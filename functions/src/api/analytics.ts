import { onCall, HttpsError } from 'firebase-functions/v2/https'
import * as admin from 'firebase-admin'

interface ApiCallData {
  endpoint: string
  method: string
  statusCode: number
  responseTime: number
  error?: string
}

interface EndpointStats {
  calls: number
  errors: number
}

interface DailyStats {
  userId: string
  date: Date
  totalCalls: number
  successfulCalls: number
  failedCalls: number
  totalResponseTime: number
  averageResponseTime: number
  endpoints: Record<string, EndpointStats>
}

interface ApiStats {
  totalCalls: number
  successfulCalls: number
  failedCalls: number
  totalResponseTime: number
  endpoints: Record<string, EndpointStats>
}

export const trackApiCall = onCall({
  region: 'europe-west9',
  maxInstances: 10
}, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'L\'utilisateur doit être authentifié')
  }

  const { endpoint, method, statusCode, responseTime, error } = request.data as ApiCallData
  if (!endpoint || !method || !statusCode || typeof responseTime !== 'number') {
    throw new HttpsError('invalid-argument', 'Paramètres invalides')
  }

  try {
    const db = admin.firestore()
    const userId = request.auth.uid

    // Enregistrer l'appel API
    await db.collection('api_analytics').add({
      endpoint,
      method,
      statusCode,
      responseTime,
      error,
      userId,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    })

    // Mettre à jour les statistiques agrégées
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const statsRef = db.collection('api_stats').doc(`${userId}_${today.toISOString().split('T')[0]}`)

    await db.runTransaction(async (transaction) => {
      const statsDoc = await transaction.get(statsRef)
      
      if (!statsDoc.exists) {
        const initialStats: DailyStats = {
          userId,
          date: today,
          totalCalls: 1,
          successfulCalls: statusCode < 400 ? 1 : 0,
          failedCalls: statusCode >= 400 ? 1 : 0,
          totalResponseTime: responseTime,
          averageResponseTime: responseTime,
          endpoints: {
            [endpoint]: {
              calls: 1,
              errors: statusCode >= 400 ? 1 : 0
            }
          }
        }
        transaction.set(statsRef, initialStats)
      } else {
        const data = statsDoc.data() as DailyStats
        const newTotalCalls = data.totalCalls + 1
        const newTotalTime = data.totalResponseTime + responseTime
        
        const endpointStats = data.endpoints[endpoint] || { calls: 0, errors: 0 }
        
        transaction.update(statsRef, {
          totalCalls: newTotalCalls,
          successfulCalls: admin.firestore.FieldValue.increment(statusCode < 400 ? 1 : 0),
          failedCalls: admin.firestore.FieldValue.increment(statusCode >= 400 ? 1 : 0),
          totalResponseTime: newTotalTime,
          averageResponseTime: newTotalTime / newTotalCalls,
          [`endpoints.${endpoint}`]: {
            calls: endpointStats.calls + 1,
            errors: endpointStats.errors + (statusCode >= 400 ? 1 : 0)
          }
        })
      }
    })

    return { success: true }
  } catch (error) {
    console.error('Erreur lors du suivi de l\'appel API:', error)
    throw new HttpsError('internal', 'Erreur lors de l\'enregistrement des statistiques')
  }
})

interface AnalyticsResponse {
  period: {
    start: string
    end: string
  }
  summary: {
    totalCalls: number
    successfulCalls: number
    failedCalls: number
    totalResponseTime: number
    averageResponseTime: number
    successRate: number
  }
  dailyStats: DailyStats[]
  endpointStats: Record<string, EndpointStats>
}

export const getApiAnalytics = onCall({
  region: 'europe-west9',
  maxInstances: 10
}, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'L\'utilisateur doit être authentifié')
  }

  try {
    const db = admin.firestore()
    const userId = request.auth.uid

    const { startDate, endDate } = request.data || {}
    const end = endDate ? new Date(endDate) : new Date()
    const start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000)

    const statsQuery = await db.collection('api_stats')
      .where('userId', '==', userId)
      .where('date', '>=', start)
      .where('date', '<=', end)
      .orderBy('date', 'desc')
      .get()

    const dailyStats = statsQuery.docs.map(doc => ({
      ...doc.data() as DailyStats,
      date: doc.data().date.toDate().toISOString()
    }))

    const totalStats = dailyStats.reduce<ApiStats>((acc, day) => ({
      totalCalls: acc.totalCalls + day.totalCalls,
      successfulCalls: acc.successfulCalls + day.successfulCalls,
      failedCalls: acc.failedCalls + day.failedCalls,
      totalResponseTime: acc.totalResponseTime + day.totalResponseTime,
      endpoints: acc.endpoints
    }), {
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      totalResponseTime: 0,
      endpoints: {}
    })

    const endpointStats = dailyStats.reduce<Record<string, EndpointStats>>((acc, day) => {
      Object.entries(day.endpoints).forEach(([endpoint, stats]) => {
        if (!acc[endpoint]) {
          acc[endpoint] = { calls: 0, errors: 0 }
        }
        acc[endpoint].calls += stats.calls
        acc[endpoint].errors += stats.errors
      })
      return acc
    }, {})

    const response: AnalyticsResponse = {
      period: {
        start: start.toISOString(),
        end: end.toISOString()
      },
      summary: {
        ...totalStats,
        averageResponseTime: totalStats.totalCalls > 0 
          ? totalStats.totalResponseTime / totalStats.totalCalls 
          : 0,
        successRate: totalStats.totalCalls > 0 
          ? (totalStats.successfulCalls / totalStats.totalCalls) * 100 
          : 0
      },
      dailyStats,
      endpointStats
    }

    return response
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error)
    throw new HttpsError('internal', 'Erreur lors de la récupération des statistiques')
  }
})

interface EndpointPerformance {
  endpoint: string
  performance: {
    totalCalls: number
    averageResponseTime: number
    errors: number
    successRate: number
    percentiles: {
      p50: number
      p90: number
      p95: number
      p99: number
    }
  }
  recentCalls: Array<{
    id: string
    timestamp: string
    responseTime: number
    statusCode: number
    error?: string
  }>
}

export const getEndpointPerformance = onCall({
  region: 'europe-west9',
  maxInstances: 10
}, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'L\'utilisateur doit être authentifié')
  }

  const { endpoint } = request.data
  if (!endpoint) {
    throw new HttpsError('invalid-argument', 'Endpoint requis')
  }

  try {
    const db = admin.firestore()
    const userId = request.auth.uid

    const callsQuery = await db.collection('api_analytics')
      .where('userId', '==', userId)
      .where('endpoint', '==', endpoint)
      .orderBy('timestamp', 'desc')
      .limit(100)
      .get()

    const calls = callsQuery.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as ApiCallData & { timestamp: FirebaseFirestore.Timestamp },
      timestamp: doc.data().timestamp.toDate().toISOString()
    }))

    const totalCalls = calls.length
    const totalResponseTime = calls.reduce((sum, call) => sum + call.responseTime, 0)
    const averageResponseTime = totalCalls > 0 ? totalResponseTime / totalCalls : 0
    const errors = calls.filter(call => call.statusCode >= 400).length
    const successRate = totalCalls > 0 ? ((totalCalls - errors) / totalCalls) * 100 : 0

    const sortedResponseTimes = calls.map(call => call.responseTime).sort((a, b) => a - b)
    const p50 = totalCalls > 0 ? sortedResponseTimes[Math.floor(totalCalls * 0.5)] : 0
    const p90 = totalCalls > 0 ? sortedResponseTimes[Math.floor(totalCalls * 0.9)] : 0
    const p95 = totalCalls > 0 ? sortedResponseTimes[Math.floor(totalCalls * 0.95)] : 0
    const p99 = totalCalls > 0 ? sortedResponseTimes[Math.floor(totalCalls * 0.99)] : 0

    const response: EndpointPerformance = {
      endpoint,
      performance: {
        totalCalls,
        averageResponseTime,
        errors,
        successRate,
        percentiles: {
          p50,
          p90,
          p95,
          p99
        }
      },
      recentCalls: calls
    }

    return response
  } catch (error) {
    console.error('Erreur lors de la récupération des performances:', error)
    throw new HttpsError('internal', 'Erreur lors de la récupération des performances')
  }
})