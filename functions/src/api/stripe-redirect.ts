import { onCall, HttpsError } from 'firebase-functions/v2/https'

export const getStripeRedirectUrl = onCall({
  region: 'europe-west9',
  maxInstances: 10,
}, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'L\'utilisateur doit être authentifié')
  }

  try {
    const { sessionId } = request.data
    if (!sessionId) {
      throw new HttpsError('invalid-argument', 'Le sessionId est requis')
    }

    // Récupérer la clé publique Stripe depuis les variables d'environnement
    const stripePublicKey = process.env.STRIPE_PUBLIC_KEY
    if (!stripePublicKey) {
      throw new HttpsError('internal', 'La clé publique Stripe n\'est pas configurée')
    }

    // Retourner la clé publique et l'ID de session
    // Le client utilisera ces informations pour initialiser Stripe correctement
    return { 
      sessionId,
      publicKey: stripePublicKey 
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des informations Stripe:', error)
    throw new HttpsError('internal', 'Erreur lors de la récupération des informations Stripe')
  }
}) 