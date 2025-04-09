import { config } from 'dotenv'
config()

export default defineNuxtConfig({
  devtools: { enabled: false },

  modules: [
    "@nuxtjs/tailwindcss",
    "@pinia/nuxt",
    "@nuxtjs/google-fonts",
    "@pinia-plugin-persistedstate/nuxt",
  ],

  googleFonts: {
    families: {
      Inter: [300, 400, 500, 600, 700],
    },
  },

  app: {
    head: {
      title:
        "PharmaData - Plateforme Professionnelle de Données Pharmaceutiques",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content:
            "Accédez aux données professionnelles des produits pharmaceutiques et parapharmaceutiques via notre plateforme. Achetez des fiches produits ou abonnez-vous à notre API.",
        },
      ],
    },
  },

  runtimeConfig: {
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    public: {
      stripePublicKey: process.env.STRIPE_PUBLIC_KEY,
      FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
      FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
      FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
      FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
      FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
    },
  },

  piniaPersistedstate: {
    storage: "localStorage",
    debug: true,
  },

  build: {
    transpile: ["vue-toastification"],
  },

  vite: {
    define: {
      "process.env.ES_BUILD": "false",
    },
  },

  routeRules: {
    "/products": { middleware: ["rate-limit"] },
  },

  compatibilityDate: "2025-04-04",

  plugins: [
    '~/plugins/firebase.client.ts',
    '~/plugins/toast.client.ts'
  ],
  ssr: false,

  pinia: {
    autoImports: ['defineStore', 'storeToRefs'],
  },

  imports: {
    dirs: ['stores'],
  },
});
