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
    const { items } = request.data as { items: ProductPaymentItem[] }
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new HttpsError('invalid-argument', 'Liste de produits invalide')
    }

    // Valider chaque item
    items.forEach(item => {
      if (!item.productId || !item.title || !item.cip_code) {
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
          unit_amount: 50, // 0.50€ en centimes
        },
        quantity: 1
      })),
      success_url: `${process.env.FRONTEND_URL}/paymentCart/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/paymentCart/cancel`,
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
      amount: items.length * 50,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    })

    return { sessionId: session.id }
  } catch (error) {
    console.error('Erreur lors de la création de la session de paiement:', error)
    throw new HttpsError('internal', 'Erreur lors de la création de la session de paiement')
  }
})

export const handleProductPaymentWebhook = onCall({
  region: 'europe-west9',
  maxInstances: 10
}, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'L\'utilisateur doit être authentifié')
  }

  const { event } = request.data
  if (!event) {
    throw new HttpsError('invalid-argument', 'Événement Stripe manquant')
  }

  try {
    const db = admin.firestore()

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const sessionId = session.id

      // Mettre à jour le statut de la session
      await db.collection('product_payment_sessions').doc(sessionId).update({
        status: 'completed',
        completedAt: admin.firestore.FieldValue.serverTimestamp()
      })

      // Créer les entrées pour les fichiers
      const productIds = JSON.parse(session.metadata.productIds)
      await Promise.all(
        productIds.map(async (productId: string) => {
          await db.collection('product_files').add({
            sessionId,
            productId,
            userId: session.metadata.userId,
            status: 'pending',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          })
        })
      )
    }

    return { success: true }
  } catch (error) {
    console.error('Erreur lors du traitement du webhook:', error)
    throw new HttpsError('internal', 'Erreur lors du traitement du webhook')
  }
})