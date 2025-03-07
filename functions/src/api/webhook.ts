import { onRequest } from 'firebase-functions/v2/https'
import * as admin from 'firebase-admin'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

export const handleWebhook = onRequest({
  region: 'europe-west9',
  maxInstances: 10
}, async (request, response) => {
  const sig = request.headers['stripe-signature']

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('Signature ou secret webhook manquant')
    response.status(400).send('Webhook Error: signature manquante')
    return
  }

  try {
    const event = stripe.webhooks.constructEvent(
      request.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )

    const db = admin.firestore()

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const { userId, items } = session.metadata || {}

        if (!userId || !items) {
          throw new Error('Métadonnées de session incomplètes')
        }

        const orderData = {
          userId,
          stripeSessionId: session.id,
          amount: (session.amount_total || 0) / 100,
          items: JSON.parse(items),
          status: 'completed',
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        }

        await db.collection('orders').add(orderData)

        if (session.mode === 'subscription') {
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
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const { firebaseUID } = subscription.metadata || {}

        if (firebaseUID) {
          const subscriptionsSnapshot = await db
            .collection('subscriptions')
            .where('stripeSubscriptionId', '==', subscription.id)
            .limit(1)
            .get()

          if (!subscriptionsSnapshot.empty) {
            const subscriptionDoc = subscriptionsSnapshot.docs[0]
            
            await subscriptionDoc.ref.update({
              status: 'cancelled',
              cancelledAt: admin.firestore.FieldValue.serverTimestamp()
            })

            await db.collection('users').doc(firebaseUID).update({
              subscriptionId: admin.firestore.FieldValue.delete(),
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            })
          }
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subscription = invoice.subscription as string
        
        if (subscription) {
          const subscriptionsSnapshot = await db
            .collection('subscriptions')
            .where('stripeSubscriptionId', '==', subscription)
            .limit(1)
            .get()

          if (!subscriptionsSnapshot.empty) {
            await subscriptionsSnapshot.docs[0].ref.update({
              status: 'payment_failed',
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            })
          }
        }
        break
      }
    }

    response.json({ received: true })
  } catch (error) {
    if (error instanceof Error) {
      console.error('Erreur webhook:', error)
      response.status(400).send(`Webhook Error: ${error.message}`)
    } else {
      console.error('Erreur webhook inconnue:', error)
      response.status(400).send('Webhook Error: Une erreur inconnue est survenue')
    }
  }
})