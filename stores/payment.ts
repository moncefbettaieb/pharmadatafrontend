import { defineStore } from 'pinia'
import { loadStripe } from '@stripe/stripe-js'
import { httpsCallable } from 'firebase/functions'

export const usePaymentStore = defineStore('payment', {
  state: () => ({
    loading: false,
    error: null as string | null
  }),

  actions: {
    async createCheckoutSession(items: { productId: string; quantity: number }[]) {
      this.loading = true
      this.error = null
      
      try {
        const { $functions } = useNuxtApp()
        if (!$functions) {
          throw new Error('Firebase Functions non initialisé')
        }

        const config = useRuntimeConfig()
        if (!config.public.stripePublicKey) {
          throw new Error('La clé publique Stripe n\'est pas configurée')
        }

        const createCheckoutSessionCall = httpsCallable($functions, 'createCheckoutSession')
        const result = await createCheckoutSessionCall({ items })
        
        const { sessionId } = result.data as { sessionId: string }

        const stripe = await loadStripe(config.public.stripePublicKey)
        if (!stripe) {
          throw new Error('Erreur lors du chargement de Stripe')
        }

        const { error } = await stripe.redirectToCheckout({ sessionId })
        if (error) {
          throw error
        }
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})