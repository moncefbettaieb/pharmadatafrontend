// middleware/auth-verified.ts
export default defineNuxtRouteMiddleware((to, from) => {
    const authStore = useAuthStore()
  
    // 1. If no user, redirect to login page
    if (!authStore.user) {
      return navigateTo('/login')
    }
  
    // 2. If user exists but email is not verified, redirect to an email verification page
    if (!authStore.user.emailVerified) {
      return navigateTo('/verify-email')
    }
  })