import { onCall, HttpsError } from 'firebase-functions/v2/https'
import * as admin from 'firebase-admin'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

interface ProductPaymentItem {
  productId: string
  title: string
  cip_code: string
}

export const createProductPaymentSession = onCall({
  region: 'europe-west9',
  maxInstances: 10
}, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'L\'utilisateur doit être authentifié')
  }

  try {
    const frontendUrl = process.env.FRONTEND_URL
    if (!frontendUrl) {
      throw new Error('FRONTEND_URL non configurée')
    }

    const { items } = request.data as { items: ProductPaymentItem[] }
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new HttpsError('invalid-argument', 'Liste de produits invalide')
    }

    // Valider chaque item
    items.forEach(item => {
      if (!item.title || !item.cip_code) {
        throw new HttpsError('invalid-argument', 'Données de produit incomplètes')
      }
    })

    const db = admin.firestore()
    const userId = request.auth.uid

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
          userId: userId
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
      line_items: items.map((item: ProductPaymentItem) => ({
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Fiche produit - ${item.title}`,
            description: `CIP: ${item.cip_code}`,
            metadata: {
              productId: item.productId,
              cip_code: item.cip_code
            }
          },
          unit_amount: 70,
        },
        quantity: 1
      })),
      success_url: `${frontendUrl}/payment-cart/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/payment-cart/cancel`,
      metadata: {
        userId,
        productIds: JSON.stringify(items.map(item => item.productId))
      }
    })

    // Sauvegarder la session dans Firestore
    await db.collection('product_payment_sessions').doc(session.id).set({
      userId,
      items,
      status: 'pending',
      amount: (items.length * 70) / 100,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    })

    return { sessionId: session.id }
  } catch (error) {
    console.error('Erreur lors de la création de la session de paiement:', error)
    throw new HttpsError('internal', 'Erreur lors de la création de la session de paiement')
  }
})