import { defineNuxtRouteMiddleware } from '#app'

const RATE_LIMIT_WINDOW = 3600000 // 1 hour in milliseconds
const MAX_REQUESTS = 20

export default defineNuxtRouteMiddleware((to) => {
  // Only apply rate limiting to the products page
  if (to.path !== '/products') return

  // Get client IP from local storage history
  const now = Date.now()
  const requestHistory = JSON.parse(localStorage.getItem('requestHistory') || '[]')

  // Clean up old requests
  const recentRequests = requestHistory.filter((timestamp: number) => 
    now - timestamp < RATE_LIMIT_WINDOW
  )

  // Check if rate limit is exceeded
  if (recentRequests.length >= MAX_REQUESTS) {
    return navigateTo('/error', {
      query: {
        message: 'Trop de requêtes. Veuillez réessayer dans une heure.'
      }
    })
  }

  // Add current request to history
  recentRequests.push(now)
  localStorage.setItem('requestHistory', JSON.stringify(recentRequests))
})