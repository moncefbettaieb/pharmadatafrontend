import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getFunctions } from 'firebase/functions'

import type { FirebaseApp } from 'firebase/app'
import type { Auth } from 'firebase/auth'
import type { Firestore } from 'firebase/firestore'
import type { Functions } from 'firebase/functions'

let app: FirebaseApp | undefined, auth: Auth | undefined, firestore: Firestore | undefined, functions: Functions | undefined;

export const initFirebase = () => {
  if (!app) {
    // Récupérer la configuration runtime
    const config = useRuntimeConfig()

    const firebaseConfig = {
      apiKey: config.public.FIREBASE_API_KEY,
      authDomain: config.public.FIREBASE_AUTH_DOMAIN,
      projectId: config.public.FIREBASE_PROJECT_ID,
      storageBucket: config.public.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: config.public.FIREBASE_MESSAGING_SENDER_ID,
      appId: config.public.FIREBASE_APP_ID
    }

    // Vérifier que la configuration est valide
    if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'votre_api_key') {
      console.error('Firebase API key is missing or invalid')
      throw new Error('Firebase configuration is invalid')
    }

    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
    firestore = getFirestore(app)
    functions = getFunctions(app)

    // Si vous êtes en développement local, décommentez ces lignes
    // if (process.env.NODE_ENV === 'development') {
    //   connectFunctionsEmulator(functions, 'localhost', 5001)
    // }
  }

  return { app, auth, firestore, functions }
} 