export default defineNuxtRouteMiddleware((to, from) => {
  const { $firebaseAuth } = useNuxtApp()
  const user = $firebaseAuth?.currentUser

  // Si l'utilisateur est connecté, rediriger vers la page d'accueil
  if (user) {
    return navigateTo('/account/api-tokens')
  }
}) 