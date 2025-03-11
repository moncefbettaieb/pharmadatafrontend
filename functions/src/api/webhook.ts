import { onRequest } from 'firebase-functions/v2/https'
import * as admin from 'firebase-admin'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

export const handleStripeWebhook = onRequest({
  region: 'europe-west9',
  maxInstances: 10,
  cors: false // Désactiver CORS pour les webhooks
}, async (request, response) => {
  const sig = request.headers['stripe-signature']

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('Signature ou secret webhook manquant')
    response.status(400).send('Webhook Error: signature manquante')
    return
  }

  let event

  try {
    // S'assurer que le corps de la requête est brut
    const rawBody = request.rawBody

    if (!rawBody) {
      throw new Error('Corps de la requête manquant')
    }

    // Construire l'événement avec le corps brut
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )

    const db = admin.firestore()

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        // Vérifier le mode de la session
        if (session.mode === 'subscription') {
          await handleSubscriptionPayment(session, db)
        } else if (session.mode === 'payment') {
          await handleProductPayment(session, db)
        }
        break
      }

      case 'customer.subscription.deleted': {
        await handleSubscriptionCancellation(event.data.object as Stripe.Subscription, db)
        break
      }

      case 'invoice.payment_failed': {
        await handlePaymentFailure(event.data.object as Stripe.Invoice, db)
        break
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleSessionExpiration(session, db)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentIntentFailure(paymentIntent, db)
        break
      }
    }

    response.json({ received: true })
  } catch (error) {
    console.error('Erreur webhook:', error)
    response.status(400).send(`Webhook Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
})

async function handleSubscriptionPayment(session: Stripe.Checkout.Session, db: FirebaseFirestore.Firestore) {
  const { userId, priceId } = session.metadata || {}
  if (!userId || !priceId) {
    throw new Error('Métadonnées de session incomplètes')
  }

  const orderData = {
    userId,
    stripeSessionId: session.id,
    amount: (session.amount_total || 0) / 100,
    priceId: priceId,
    status: 'completed',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  }

  await db.collection('orders').add(orderData)

  const subscriptionData = {
    userId,
    stripeSubscriptionId: session.subscription,
    planId: session.metadata?.priceId,
    status: 'active',
    currentPeriodStart: new Date(),
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  }

  const subscriptionRef = await db.collection('subscriptions').add(subscriptionData)

  await db.collection('users').doc(userId).update({
    subscriptionId: subscriptionRef.id,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  })
}

async function handleProductPayment(session: Stripe.Checkout.Session, db: FirebaseFirestore.Firestore) {
  const sessionId = session.id

  // Mettre à jour le statut de la session
  await db.collection('product_payment_sessions').doc(sessionId).update({
    status: 'completed',
    completedAt: admin.firestore.FieldValue.serverTimestamp(),
    stripePaymentIntentId: session.payment_intent,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  })

  // Créer les entrées pour les fichiers
  if (session.metadata?.productIds) {
    const productIds = JSON.parse(session.metadata.productIds)
    await Promise.all(
      productIds.map(async (productId: string) => {
        await db.collection('product_files').add({
          sessionId,
          productId,
          userId: session.metadata?.userId,
          status: 'pending',
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        })
      })
    )
  }
}

async function handleSubscriptionCancellation(subscription: Stripe.Subscription, db: FirebaseFirestore.Firestore) {
  const { firebaseUID } = subscription.metadata || {}
  if (firebaseUID) {
    const subscriptionsSnapshot = await db
      .collection('subscriptions')
      .where('stripeSubscriptionId', '==', subscription.id)
      .limit(1)
      .get()

    if (!subscriptionsSnapshot.empty) {
      await subscriptionsSnapshot.docs[0].ref.update({
        status: 'cancelled',
        cancelledAt: admin.firestore.FieldValue.serverTimestamp()
      })

      await db.collection('users').doc(firebaseUID).update({
        subscriptionId: admin.firestore.FieldValue.delete(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      })
    }
  }
}

async function handlePaymentFailure(invoice: Stripe.Invoice, db: FirebaseFirestore.Firestore) {
  if (invoice.subscription) {
    const subscriptionsSnapshot = await db
      .collection('subscriptions')
      .where('stripeSubscriptionId', '==', invoice.subscription)
      .limit(1)
      .get()

    if (!subscriptionsSnapshot.empty) {
      await subscriptionsSnapshot.docs[0].ref.update({
        status: 'payment_failed',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      })
    }
  }
}

async function handleSessionExpiration(session: Stripe.Checkout.Session, db: FirebaseFirestore.Firestore) {
  const sessionId = session.id
  await db.collection('product_payment_sessions').doc(sessionId).update({
    status: 'expired',
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  })
}

async function handlePaymentIntentFailure(paymentIntent: Stripe.PaymentIntent, db: FirebaseFirestore.Firestore) {
  const sessionsSnapshot = await db.collection('product_payment_sessions')
    .where('stripePaymentIntentId', '==', paymentIntent.id)
    .limit(1)
    .get()

  if (!sessionsSnapshot.empty) {
    await sessionsSnapshot.docs[0].ref.update({
      status: 'failed',
      error: paymentIntent.last_payment_error?.message || 'Paiement échoué',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    })
  }
}