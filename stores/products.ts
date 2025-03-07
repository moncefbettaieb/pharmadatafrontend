import { defineStore } from 'pinia'
import { httpsCallable } from 'firebase/functions'

interface Product {
  cip_code: string
  title: string
  brand: string
  image_url: string
  price: number
}

export const useProductsStore = defineStore('products', {
  state: () => ({
    products: [] as Product[],
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchProducts() {
      this.loading = true
      this.error = null
      try {
        const { $functions } = useNuxtApp()
        if (!$functions) {
          throw new Error('Firebase Functions non initialisé')
        }

        const getProductsCall = httpsCallable($functions, 'getProducts')
        const result = await getProductsCall()
        this.products = result.data as Product[]
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})