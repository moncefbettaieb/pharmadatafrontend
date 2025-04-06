import { useAuthStore } from '~/stores/auth';

export default defineNuxtPlugin(async (nuxtApp) => {
  const authStore = useAuthStore();
  
  // Initialiser l'écouteur d'authentification au chargement de l'application
  await authStore.initAuthListener();
  
  // Exposer l'état d'authentification aux middlewares
  nuxtApp.provide('isAuthenticated', () => !!authStore.user);
}); 