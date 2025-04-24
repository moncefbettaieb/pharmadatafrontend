import { initializeApp } from 'firebase/app'
import type { FirebaseApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import type { Auth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import type { Firestore } from 'firebase/firestore'
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions'
import type { Functions } from 'firebase/functions'

let app: FirebaseApp | undefined
let auth: Auth | undefined
let firestore: Firestore | undefined
let functions: Functions | undefined

export const initFirebase = () => {
  if (!app) {
    const config = useRuntimeConfig()

    const firebaseConfig = {
      apiKey: config.public.FIREBASE_API_KEY,
      authDomain: config.public.FIREBASE_AUTH_DOMAIN,
      projectId: config.public.FIREBASE_PROJECT_ID,
      storageBucket: config.public.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: config.public.FIREBASE_MESSAGING_SENDER_ID,
      appId: config.public.FIREBASE_APP_ID
    }

    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
    firestore = getFirestore(app)
    
    // Initialiser les fonctions avec la région correcte
    functions = getFunctions(app, 'europe-west9')

    // En développement local, utilisez l'émulateur
    if (process.env.NODE_ENV === 'development') {
      connectFunctionsEmulator(functions, 'localhost', 5001)
    }
  }

  return { app, auth, firestore, functions }
}

export default defineNuxtPlugin((nuxtApp) => {
  const { auth, firestore, functions } = initFirebase()

  // Utiliser des noms différents pour éviter les conflits
  return {
    provide: {
      firebaseAuth: auth,
      firebaseDb: firestore,
      firebaseFunctions: functions
    }
  }
})
