export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore()
  const { $isAuthenticated } = useNuxtApp()
  
  // Attendre que l'authentification soit initialisée
  if (!authStore.initialized) {
    // Vous pouvez afficher un spinner de chargement ici si nécessaire
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  
  if (!$isAuthenticated()) {
    return navigateTo('/login')
  }
})