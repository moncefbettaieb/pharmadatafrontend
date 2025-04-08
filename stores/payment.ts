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
        const { $firebaseFunctions } = useNuxtApp()
        if (!$firebaseFunctions) {
          throw new Error('Firebase Functions non initialisé')
        }

        // Appeler la Cloud Function pour créer la session
        const createCheckoutSessionCall = httpsCallable($firebaseFunctions, 'createCheckoutSession')
        const result = await createCheckoutSessionCall({ items })
        
        const { sessionId } = result.data as { sessionId: string }

        // Obtenir la clé publique Stripe depuis la Cloud Function
        const getStripeInfoCall = httpsCallable($firebaseFunctions, 'getStripeRedirectUrl')
        const stripeInfoResult = await getStripeInfoCall({ sessionId })
        
        const stripeInfo = stripeInfoResult.data as any
        if (!stripeInfo.publicKey || !stripeInfo.sessionId) {
          throw new Error('Informations Stripe incomplètes')
        }

        // Initialiser Stripe avec la clé publique récupérée du serveur
        const stripe = await loadStripe(stripeInfo.publicKey)
        if (!stripe) {
          throw new Error('Erreur lors du chargement de Stripe')
        }

        // Rediriger vers la page de paiement Stripe
        const { error } = await stripe.redirectToCheckout({ 
          sessionId: stripeInfo.sessionId 
        })
        
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