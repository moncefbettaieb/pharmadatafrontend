import { onCall, HttpsError } from 'firebase-functions/v2/https'
import * as admin from 'firebase-admin'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

interface CartItem {
  cip_code: string
  quantity: number
}

interface ProductData {
  name: string
  description: string
  price: number
  image_url?: string
  quantity: number
}

export const createCheckoutSession = onCall({
  region: 'europe-west9',
  maxInstances: 10
}, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'L\'utilisateur doit être authentifié')
  }

  const { items } = request.data as { items: CartItem[] }
  if (!items || !Array.isArray(items)) {
    throw new HttpsError('invalid-argument', 'Les items du panier sont requis')
  }

  try {
    const db = admin.firestore()
    const userId = request.auth.uid

    // Récupérer les détails des produits depuis Firestore
    const productDetails = await Promise.all(
      items.map(async (item) => {
        const productDoc = await db.collection('final_pharma_table').doc(item.cip_code).get()
        if (!productDoc.exists) {
          throw new HttpsError('not-found', `Produit non trouvé: ${item.cip_code}`)
        }
        const productData = productDoc.data() as ProductData
        return {
          ...productData,
          quantity: item.quantity
        }
      })
    )

    // Récupérer ou créer le client Stripe
    let customer
    const userDoc = await db.collection('users').doc(userId).get()
    const userData = userDoc.data()

    if (userData?.stripeCustomerId) {
      customer = await stripe.customers.retrieve(userData.stripeCustomerId)
    } else {
      customer = await stripe.customers.create({
        email: request.auth.token.email,
        metadata: {
          firebaseUID: userId
        }
      })

      await db.collection('users').doc(userId).update({
        stripeCustomerId: customer.id
      })
    }

    // Créer la session de paiement
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: productDetails.map(product => ({
        price_data: {
          currency: 'eur',
          product_data: {
            name: product.name,
            description: product.description,
            images: product.image_url ? [product.image_url] : undefined
          },
          unit_amount: Math.round(product.price * 100) // Convertir en centimes
        },
        quantity: product.quantity
      })),
      success_url: `${process.env.FRONTEND_URL}/payment/success`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
      metadata: {
        userId,
        items: JSON.stringify(items)
      }
    })

    return { sessionId: session.id }
  } catch (error) {
    console.error('Erreur lors de la création de la session:', error)
    throw new HttpsError('internal', 'Erreur lors de la création de la session de paiement')
  }
})