// middleware/auth-verified.ts
export default defineNuxtRouteMiddleware((to, from) => {
    const authStore = useAuthStore()
  
    // 1. If no user, redirect to login page
    if (!authStore.user) {
      return navigateTo('/login')
    }
  
    // 2. If user authenticated with phone only (has phoneNumber but no email or not verified)
    if (authStore.user.phoneNumber && (!authStore.user.email || !authStore.user.emailVerified)) {
      // Check if we're already going to the phone-email-verify page to avoid redirect loops
      if (to.path !== '/phone-email-verify') {
        return navigateTo('/phone-email-verify')
      }
    }
    // 3. If user exists but email is not verified, redirect to an email verification page
    else if (!authStore.user.emailVerified) {
      return navigateTo('/verify-email')
    }
  })