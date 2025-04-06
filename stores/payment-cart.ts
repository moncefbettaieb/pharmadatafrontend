import { defineStore } from 'pinia'
import { loadStripe } from '@stripe/stripe-js'
import { httpsCallable } from 'firebase/functions'

interface CartItem {
  productId: string
  title: string
  short_desc: string
  image_url?: string
  cip_code: string
}

type FileFormat = 'json' | 'pdf'

export const usePaymentCartStore = defineStore('paymentCart', {
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
        const { $firebaseFunctions } = useNuxtApp()
        if (!$firebaseFunctions) {
          throw new Error('Firebase Functions non initialisé')
        }

        const config = useRuntimeConfig()
        if (!config.public.stripePublicKey) {
          throw new Error('La clé publique Stripe n\'est pas configurée')
        }

        // Appeler la Cloud Function
        const createSessionCall = httpsCallable($firebaseFunctions, 'createProductPaymentSession')
        const result = await createSessionCall({
          items: items.map(item => ({
            productId: item.productId,
            title: item.title,
            cip_code: item.cip_code
          }))
        })

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
    },

    async getProductFiles(sessionId: string, format: FileFormat = 'json') {
      this.loading = true
      this.error = null
      this.selectedFormat = format
      
      try {
        const { $firebaseFunctions } = useNuxtApp()
        if (!$firebaseFunctions) {
          throw new Error('Firebase Functions non initialisé')
        }

        const getFilesCall = httpsCallable($firebaseFunctions, 'getProductFiles')
        const result = await getFilesCall({ sessionId, format })
        
        const { files } = result.data as { files: string[] }
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