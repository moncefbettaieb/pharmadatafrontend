import * as admin from 'firebase-admin'

const RATE_LIMIT_WINDOW = 3600000 // 1 hour in milliseconds
const MAX_REQUESTS = 20

interface RateLimitData {
  requests: number[]
  lastReset: number
}

export async function rateLimit(clientIp: string): Promise<boolean> {
  if (!clientIp || clientIp === 'unknown') {
    return false // Ne pas limiter si l'IP ne peut pas être déterminée
  }

  const db = admin.firestore()
  const now = Date.now()
  const rateLimitRef = db.collection('rate_limits').doc(clientIp)

  try {
    const result = await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(rateLimitRef)
      
      if (!doc.exists) {
        const initialData: RateLimitData = {
          requests: [now],
          lastReset: now
        }
        transaction.set(rateLimitRef, initialData)
        return false
      }

      const data = doc.data() as RateLimitData
      const validRequests = data.requests.filter(time => now - time < RATE_LIMIT_WINDOW)

      if (validRequests.length >= MAX_REQUESTS) {
        return true
      }

      validRequests.push(now)
      transaction.update(rateLimitRef, {
        requests: validRequests,
        lastReset: data.lastReset
      })

      return false
    })

    return result
  } catch (error) {
    console.error('Error in rate limiting:', error)
    return false // En cas d'erreur, permettre la requête
  }
}