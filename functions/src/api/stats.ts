import { onCall, HttpsError } from 'firebase-functions/v2/https'
import * as admin from 'firebase-admin'

interface DailyStats {
  userId: string
  date: Date
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  averageResponseTime: number
  endpoints: Record<string, number>
  createdAt: FirebaseFirestore.Timestamp
}

interface UserStats {
  userId: string
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  averageResponseTime: number
  lastRequest: FirebaseFirestore.Timestamp
  createdAt: FirebaseFirestore.Timestamp
}

export const trackApiUsage = onCall({
  region: 'europe-west9',
  maxInstances: 10
}, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'L\'utilisateur doit être authentifié')
  }

  const { endpoint, responseTime, success } = request.data
  if (!endpoint || typeof responseTime !== 'number') {
    throw new HttpsError('invalid-argument', 'Paramètres invalides')
  }

  try {
    const db = admin.firestore()
    const userId = request.auth.uid
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const dailyStatsRef = db.collection('api_daily_stats').doc(`${userId}_${today.toISOString().split('T')[0]}`)
    
    await db.runTransaction(async (transaction) => {
      const dailyStatsDoc = await transaction.get(dailyStatsRef)
      
      if (!dailyStatsDoc.exists) {
        const initialStats: DailyStats = {
          userId,
          date: today,
          totalRequests: 1,
          successfulRequests: success ? 1 : 0,
          failedRequests: success ? 0 : 1,
          averageResponseTime: responseTime,
          endpoints: {
            [endpoint]: 1
          },
          createdAt: admin.firestore.FieldValue.serverTimestamp() as FirebaseFirestore.Timestamp
        }
        transaction.set(dailyStatsRef, initialStats)
      } else {
        const data = dailyStatsDoc.data() as DailyStats
        const newAvgTime = (data.averageResponseTime * data.totalRequests + responseTime) / (data.totalRequests + 1)
        
        transaction.update(dailyStatsRef, {
          totalRequests: admin.firestore.FieldValue.increment(1),
          successfulRequests: admin.firestore.FieldValue.increment(success ? 1 : 0),
          failedRequests: admin.firestore.FieldValue.increment(success ? 0 : 1),
          averageResponseTime: newAvgTime,
          [`endpoints.${endpoint}`]: admin.firestore.FieldValue.increment(1),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        })
      }
    })

    const userStatsRef = db.collection('api_user_stats').doc(userId)
    
    await db.runTransaction(async (transaction) => {
      const userStatsDoc = await transaction.get(userStatsRef)
      
      if (!userStatsDoc.exists) {
        const initialStats: UserStats = {
          userId,
          totalRequests: 1,
          successfulRequests: success ? 1 : 0,
          failedRequests: success ? 0 : 1,
          averageResponseTime: responseTime,
          lastRequest: admin.firestore.FieldValue.serverTimestamp() as FirebaseFirestore.Timestamp,
          createdAt: admin.firestore.FieldValue.serverTimestamp() as FirebaseFirestore.Timestamp
        }
        transaction.set(userStatsRef, initialStats)
      } else {
        const data = userStatsDoc.data() as UserStats
        const newAvgTime = (data.averageResponseTime * data.totalRequests + responseTime) / (data.totalRequests + 1)
        
        transaction.update(userStatsRef, {
          totalRequests: admin.firestore.FieldValue.increment(1),
          successfulRequests: admin.firestore.FieldValue.increment(success ? 1 : 0),
          failedRequests: admin.firestore.FieldValue.increment(success ? 0 : 1),
          averageResponseTime: newAvgTime,
          lastRequest: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        })
      }
    })

    return { success: true }
  } catch (error) {
    console.error('Erreur lors du suivi de l\'utilisation:', error)
    throw new HttpsError('internal', 'Erreur lors du suivi de l\'utilisation de l\'API')
  }
})

export const getApiStats = onCall({
  region: 'europe-west9',
  maxInstances: 10
}, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'L\'utilisateur doit être authentifié')
  }

  try {
    const db = admin.firestore()
    const userId = request.auth.uid

    const userStatsDoc = await db.collection('api_user_stats').doc(userId).get()
    const globalStats = userStatsDoc.exists ? userStatsDoc.data() as UserStats : null

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const dailyStatsQuery = await db.collection('api_daily_stats')
      .where('userId', '==', userId)
      .where('date', '>=', thirtyDaysAgo)
      .orderBy('date', 'desc')
      .get()

    const dailyStats = dailyStatsQuery.docs.map(doc => {
      const data = doc.data() as DailyStats
      return {
        date: data.date instanceof admin.firestore.Timestamp ? data.date.toDate() : data.date,
        totalRequests: data.totalRequests,
        successfulRequests: data.successfulRequests,
        failedRequests: data.failedRequests,
        averageResponseTime: data.averageResponseTime,
        endpoints: data.endpoints
      }
    })

    return {
      globalStats,
      dailyStats
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error)
    throw new HttpsError('internal', 'Erreur lors de la récupération des statistiques')
  }
})