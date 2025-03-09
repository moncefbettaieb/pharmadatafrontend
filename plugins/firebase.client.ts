import { initializeApp } from 'firebase/app'
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getFunctions, connectFunctionsEmulator, httpsCallable, type HttpsCallable } from 'firebase/functions'

// Créer un type pour stocker les fonctions Firebase
interface FirebaseFunctions {
  [key: string]: HttpsCallable
}

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()
  
  // Cache pour stocker les fonctions Firebase
  const functionsCache: FirebaseFunctions = {}
  
  // Only initialize Firebase if we have the required config
  if (!config.public.firebaseConfig.apiKey) {
    console.warn('Firebase configuration is missing. Authentication features will not work.')
    return {
      provide: {
        firebase: null,
        auth: null,
        db: null,
        functions: null,
        callFunction: null
      }
    }
  }

  try {
    const app = initializeApp(config.public.firebaseConfig)
    const auth = getAuth(app)
    const db = getFirestore(app)
    const functions = getFunctions(app, 'europe-west9')

    // En développement, connecter à l'émulateur si nécessaire
    if (process.dev) {
      connectFunctionsEmulator(functions, 'localhost', 5001)
    }
    
    // Écouter les changements d'état d'authentification
    onAuthStateChanged(auth, (user: User | null) => {
      authStore.user = user
    })

    // Fonction utilitaire pour appeler les Cloud Functions
    const callFunction = async (name: string, data?: any) => {
      // Vérifier si l'utilisateur est connecté
      if (!auth.currentUser) {
        throw new Error('Utilisateur non authentifié')
      }

      // Récupérer ou créer la fonction depuis le cache
      if (!functionsCache[name]) {
        functionsCache[name] = httpsCallable(functions, name)
      }

      try {
        // Appeler la fonction avec les données
        const result = await functionsCache[name](data)
        return result.data
      } catch (error: any) {
        console.error(`Erreur lors de l'appel de la fonction ${name}:`, error)
        
        // Gérer les erreurs d'authentification
        if (error.code === 'unauthenticated' || error.code === 'permission-denied') {
          authStore.logout()
          throw new Error('Session expirée. Veuillez vous reconnecter.')
        }
        
        throw error
      }
    }
    
    return {
      provide: {
        firebase: app,
        auth,
        db,
        functions,
        callFunction
      }
    }
  } catch (error) {
    console.error('Failed to initialize Firebase:', error)
    return {
      provide: {
        firebase: null,
        auth: null,
        db: null,
        functions: null,
        callFunction: null
      }
    }
  }
})