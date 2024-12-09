// nuxt.config.ts
import { config } from 'dotenv'
config()

export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      apiBase: process.env.API_URL || 'http://localhost:3000',
      apiBaseTest: process.env.API_URL || 'moncef',
      apiBaseTest2: process.env.API_URL,
    },
  },
});