import { onCall, HttpsError } from 'firebase-functions/v2/https'
import * as admin from 'firebase-admin'
import Stripe from 'stripe'
import { generateToken, revokeToken } from './api/tokens'
import { getApiUsage } from './api/usage'
import { createCheckoutSession } from './api/checkout'
import { getProducts, getProductByCip } from './api/products'
import { handleWebhook } from './api/webhook'
import { trackApiUsage, getApiStats } from './api/stats'
import { 
  getNotifications, 
  markNotificationAsRead, 
  createNotification, 
  deleteNotification 
} from './api/notifications'
import {
  trackApiCall,
  getApiAnalytics,
  getEndpointPerformance
} from './api/analytics'
import {
  reportError,
  getErrorReports,
  updateErrorReport,
  deleteErrorReport
} from './api/error-reporting'

// Initialiser Firebase Admin
admin.initializeApp()

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

// Map des IDs de plans vers les IDs de prix Stripe
const PRICE_MAP: { [key: string]: string } = {
  'basic': 'price_1QpA1VIXSD1y6wP4P2wKrRLi',
  'pro': 'price_1QpA28IXSD1y6wP4gQIaoY71',
  'enterprise': 'price_1QpA2bIXSD1y6wP4LK3LyvSJ'
}

export const createSubscription = onCall({
  region: 'europe-west9',
  cors: [
    'https://pharmadata-frontend-staging-383194447870.europe-west9.run.app',
    'http://localhost:3000',
    '*' // Autoriser toutes les origines pendant le développement
  ],
  maxInstances: 10,
  memory: '256MiB'
}, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'L\'utilisateur doit être authentifié')
  }

  const { priceId, successUrl, cancelUrl } = request.data
  
  if (!priceId || !successUrl || !cancelUrl) {
    throw new HttpsError('invalid-argument', 'Paramètres manquants')
  }
  
  try {
    const stripePriceId = PRICE_MAP[priceId]
    if (!stripePriceId) {
      throw new HttpsError('invalid-argument', 'Plan invalide')
    }
    
    const db = admin.firestore()
    
    let customer
    const userRef = db.collection('users').doc(request.auth.uid)
    const userDoc = await userRef.get()
    
    if (!userDoc.exists) {
      await userRef.set({
        email: request.auth.token.email,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      })
    }
    
    const userData = userDoc.data() || {}

    if (userData.stripeCustomerId) {
      customer = await stripe.customers.retrieve(userData.stripeCustomerId)
    } else {
      customer = await stripe.customers.create({
        email: request.auth.token.email,
        metadata: {
          firebaseUID: request.auth.uid
        }
      })
      
      await userRef.update({
        stripeCustomerId: customer.id
      })
    }

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{
        price: stripePriceId,
        quantity: 1
      }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        firebaseUID: request.auth.uid,
        priceId
      }
    })

    return { sessionId: session.id }
  } catch (error) {
    console.error('Erreur lors de la création de la session:', error)
    throw new HttpsError('internal', 'Erreur lors de la création de la session de paiement')
  }
})

// Exporter les fonctions
export {
  generateToken,
  revokeToken,
  getApiUsage,
  createCheckoutSession,
  getProducts,
  handleWebhook,
  trackApiUsage,
  getApiStats,
  getNotifications,
  markNotificationAsRead,
  createNotification,
  deleteNotification,
  trackApiCall,
  getApiAnalytics,
  getEndpointPerformance,
  reportError,
  getErrorReports,
  updateErrorReport,
  deleteErrorReport,
  getProductByCip
}