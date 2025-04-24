import { config } from "dotenv";
import { ofetch } from "ofetch";
config();

export default defineNuxtConfig({
  devtools: { enabled: false },

  modules: [
    "@nuxtjs/tailwindcss",
    "@pinia/nuxt",
    "@nuxtjs/google-fonts",
    "@pinia-plugin-persistedstate/nuxt",
    "@nuxt/content",
    "@nuxtjs/sitemap",
    "@nuxtjs/plausible",
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
        { property: "og:image", content: "/branding/og-cover.png" },
        { name: "twitter:image", content: "/branding/og-cover.png" },
      ],
      link: [
        // favicon 32 px
        {
          rel: "icon",
          type: "image/png",
          sizes: "32x32",
          href: "/branding/favicon-32.png",
        },
        // favicon 16 px (optionnel – même image réduite)
        {
          rel: "icon",
          type: "image/png",
          sizes: "16x16",
          href: "/branding/favicon-32.png",
        },
        // icône PWA (si tu utilises @vite-pwa/nuxt)
        { rel: "apple-touch-icon", href: "/branding/logo-icon.svg" },
      ],
      script: [
        {
          src: "https://static.axept.io/sdk.js",
          defer: true,
          id: "axeptio_sdk",
          "data-cookiescript": process.env.NUXT_AXEPTIO_ID,
        },
        {
          innerHTML: "window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) }",
          type: "text/javascript"
        }
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

  site: {
    url: "https://pharmadataapi.fr",
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
    build: {
      chunkSizeWarningLimit: 1000, // Augmente la limite d'avertissement à 1000KB
    },
  },

  routeRules: {
    "/products": { appMiddleware: ["rate-limit"] },
    "/__nuxt_content/**": { ssr: false },
  },

  compatibilityDate: "2025-05-01",

  plausible: {
    domain: process.env.PLAUSIBLE_DOMAIN,
    apiHost: "https://plausible.io",
    trackLocalhost: false,
    enableAutoPageviews: true,
    enableAutoOutboundTracking: true,
    scriptName: "script.file-downloads.hash.outbound-links.pageview-props.revenue.tagged-events.js",
  },

  plugins: ["~/plugins/firebase.client.ts", "~/plugins/toast.client.ts"],
  ssr: false,

  imports: {
    dirs: ["stores"],
  },

  nitro: {
    prerender: {
      ignore: ["/__nuxt_content/**"],
    },
  },

  content: {
    build: {
      markdown: {
        toc: {
          depth: 3, // include h3 headings
        },
      },
    },
  },

  sitemap: {
    sitemapName: "sitemap.xml", // défaut
    urls: ["https://pharmadataapi.fr"], // Au lieu de siteUrl
    trailingSlash: false,
    injectRoutes: false, // on gère nous-mêmes les routes
    gzip: true,
    defaults: {
      changefreq: "weekly",
      priority: 0.7,
    },
    exclude: [
      "/cart/**",
      "/account/**",
      "/api/**",
      "/add-cip",
      "/contact",
      "/error",
      "/login",
      "/phone-email-verify",
      "/privacy",
      "/profile",
      "/terms",
      "/verify-email",
      "/payment-cart/**",
      "/payment/**",
    ],

    /** Génération manuelle des routes dynamiques */
    routes: async () => {
      // Appel au endpoint Firestore dédié aux slugs
      const products: Array<{ id: string; last_update: string }> = await ofetch(
        `https://pharmadataapi.fr/api/v1/slugs/`,
        { method: "GET" }
      );
      return products.map((p) => ({
        url: `/products/${p.id}`,
        lastmod: p.last_update,
        changefreq: "daily",
        priority: 0.8,
      }));
    },
  },
});
