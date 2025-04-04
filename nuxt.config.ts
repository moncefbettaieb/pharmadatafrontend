export default defineNuxtConfig({
  devtools: { enabled: false },

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxtjs/google-fonts',
    '@pinia-plugin-persistedstate/nuxt',
  ],

  googleFonts: {
    families: {
      'Inter': [300, 400, 500, 600, 700],
    }
  },

  app: {
    head: {
      title: 'PharmaData - Plateforme Professionnelle de Données Pharmaceutiques',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Accédez aux données professionnelles des produits pharmaceutiques et parapharmaceutiques via notre plateforme. Achetez des fiches produits ou abonnez-vous à notre API.' }
      ]
    }
  },

  runtimeConfig: {
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    public: {
      stripePublicKey: 'pk_test_51QRbqeIXSD1y6wP4v0cNRm1yNgm6anwIx9r1v4kx9Lqg0QWlqDH8xTzVLHPhJvburJHaW6JXhZV8wSs8t86I3WX300jFobDJHr', //TODO find solution to that
      firebaseConfig: {
        apiKey: process.env.FIREBASE_API_KEY || '',
        authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
        projectId: process.env.FIREBASE_PROJECT_ID || '',
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
        appId: process.env.FIREBASE_APP_ID || ''
      }
    }
  },

  piniaPersistedstate: {
    storage: 'localStorage',
    debug: true
  },

  build: {
      transpile: ['vue-toastification']
    },

  vite: {
    define: {
      'process.env.ES_BUILD': 'false'
    }
  },

  routeRules: {
    '/products': { middleware: ['rate-limit'] }
  },

  compatibilityDate: '2025-04-04'
})