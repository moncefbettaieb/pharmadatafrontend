import { defineStore } from 'pinia'
import { loadStripe } from '@stripe/stripe-js'

interface CartItem {
  productId: string
  title: string
  short_desc: string
  image_url?: string
  cip_code: string
}

type FileFormat = 'pdf' | 'json'

export const usePaymentStore = defineStore('paymentCart', {
  state: () => ({
    loading: false,
    error: null as string | null,
    downloadUrls: [] as string[],
    selectedFormat: 'pdf' as FileFormat
  }),

  actions: {
    async createProductPaymentSession(items: CartItem[]) {
      this.loading = true
      this.error = null
      
      try {
        const { $callFunction } = useNuxtApp()
        if (!$callFunction) {
          throw new Error('Firebase Functions non initialisé')
        }

        const config = useRuntimeConfig()
        if (!config.public.stripePublicKey) {
          throw new Error('La clé publique Stripe n\'est pas configurée')
        }

        const { sessionId } = await $callFunction('createProductPaymentSession', { 
          items: items.map(item => ({
            productId: item.productId,
            title: item.title,
            cip_code: item.cip_code
          }))
        })

        const stripe = await loadStripe(config.public.stripePublicKey)
        if (!stripe) {
          throw new Error('Erreur lors du chargement de Stripe')
        }

        const { error } = await stripe.redirectToCheckout({ 
          sessionId,
          successUrl: `${window.location.origin}/paymentCart/success?session_id=${sessionId}`,
          cancelUrl: `${window.location.origin}/paymentCart/cancel`
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
    },

    async getProductFiles(sessionId: string, format: FileFormat = 'pdf') {
      this.loading = true
      this.error = null
      this.selectedFormat = format
      
      try {
        const { $callFunction } = useNuxtApp()
        if (!$callFunction) {
          throw new Error('Firebase Functions non initialisé')
        }

        const { files } = await $callFunction('getProductFiles', { sessionId, format })
        this.downloadUrls = files
        
        return files
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    setFileFormat(format: FileFormat) {
      this.selectedFormat = format
    }
  }
})