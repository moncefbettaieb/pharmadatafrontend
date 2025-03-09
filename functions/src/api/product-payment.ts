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

  const { items } = request.data as { items: ProductPaymentItem[] }
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new HttpsError('invalid-argument', 'La liste des produits est requise')
  }

  try {
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
      line_items: items.map(item => ({
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
      success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
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
      amount: items.length * 50, // 0.50€ par fiche
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    })

    return { sessionId: session.id }
  } catch (error) {
    console.error('Erreur lors de la création de la session de paiement:', error)
    throw new HttpsError('internal', 'Erreur lors de la création de la session de paiement')
  }
})

// Webhook pour gérer le succès du paiement
export const handleProductPaymentWebhook = onCall({
  region: 'europe-west9',
  maxInstances: 10
}, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'L\'utilisateur doit être authentifié')
  }

  const { sessionId } = request.data
  if (!sessionId) {
    throw new HttpsError('invalid-argument', 'ID de session requis')
  }

  try {
    const db = admin.firestore()
    const sessionDoc = await db.collection('product_payment_sessions').doc(sessionId).get()
    
    if (!sessionDoc.exists) {
      throw new HttpsError('not-found', 'Session de paiement non trouvée')
    }

    const sessionData = sessionDoc.data()
    if (sessionData?.userId !== request.auth.uid) {
      throw new HttpsError('permission-denied', 'Accès non autorisé à cette session')
    }

    // Vérifier le paiement avec Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    if (session.payment_status !== 'paid') {
      throw new HttpsError('failed-precondition', 'Le paiement n\'est pas complété')
    }

    // Mettre à jour le statut de la session
    await sessionDoc.ref.update({
      status: 'completed',
      completedAt: admin.firestore.FieldValue.serverTimestamp()
    })

    // Stocker l'uid pour une utilisation ultérieure
    const uid = request.auth.uid

    // Créer les entrées pour les fichiers
    const productIds = JSON.parse(session.metadata?.productIds || '[]')
    await Promise.all(productIds.map(async (productId: string) => {
      await db.collection('product_files').add({
        userId: uid, // Utiliser l'uid stocké
        productId,
        sessionId,
        status: 'pending',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      })
    }))

    return { success: true }
  } catch (error) {
    console.error('Erreur lors du traitement du webhook:', error)
    throw new HttpsError('internal', 'Erreur lors du traitement du webhook')
  }
})