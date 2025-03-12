import { onCall, HttpsError } from 'firebase-functions/v2/https'
import * as admin from 'firebase-admin'

export const getApiUsage = onCall({
  region: 'europe-west9',
  maxInstances: 10
}, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'L\'utilisateur doit être authentifié')
  }

  try {
    const db = admin.firestore()
    const userId = request.auth.uid

    // Récupérer le plan actuel de l'utilisateur
    const userDoc = await db.collection('users').doc(userId).get()
    const userData = userDoc.data()

    if (!userData?.subscriptionId) {
      return {
        currentPlan: {
          name: 'Gratuit',
          requestsPerMonth: 100,
          remainingRequests: 100
        },
        usage: []
      }
    }

    // Récupérer les détails de l'abonnement
    const subscriptionDoc = await db.collection('subscriptions').doc(userData.subscriptionId).get()
    const subscriptionData = subscriptionDoc.data()

    if (!subscriptionData) {
      throw new HttpsError('not-found', 'Abonnement non trouvé')
    }

    // Récupérer l'historique d'utilisation des 7 derniers jours
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const usageQuery = await db.collection('api_usage')
      .where('userId', '==', userId)
      .where('date', '>=', sevenDaysAgo)
      .orderBy('date', 'desc')
      .get()

    const usage = usageQuery.docs.map(doc => {
      const data = doc.data()
      const dailyLimit = Math.floor((subscriptionData.requestsPerMonth || 0) / 30) // Limite quotidienne approximative
      return {
        date: data.date.toDate().toISOString(),
        requests: Math.max(0, Number(data.requests) || 0), // Assurer que requests est un nombre valide
        limit: Math.max(0, dailyLimit) // Assurer que limit est un nombre valide
      }
    })

    // Calculer les requêtes restantes
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const currentMonthUsageQuery = await db.collection('api_usage')
      .where('userId', '==', userId)
      .where('date', '>=', currentMonthStart)
      .get()

    const totalRequestsThisMonth = currentMonthUsageQuery.docs.reduce(
      (total, doc) => total + (Number(doc.data().requests) || 0),
      0
    )

    const requestsPerMonth = Number(subscriptionData.requestsPerMonth) || 0
    const remainingRequests = Math.max(0, requestsPerMonth - totalRequestsThisMonth)

    return {
      currentPlan: {
        name: subscriptionData.planId || 'Plan personnalisé',
        requestsPerMonth: requestsPerMonth,
        remainingRequests: remainingRequests
      },
      usage
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error)
    throw new HttpsError('internal', 'Erreur lors de la récupération des statistiques')
  }
})