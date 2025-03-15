import { defineStore } from 'pinia'
import { httpsCallable } from 'firebase/functions'

interface Product {
  id: string
  cip_code: string
  brand: string
  title: string
  category: string
  sub_category1: string
  sub_category2: string
  short_desc: string
  image_url?: string
}

interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
  hasMore: boolean
}

interface ProductsState {
  products: Product[]
  pagination: Pagination | null
  loading: boolean
  error: string | null
}

interface FetchProductsParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  category?: string
  subCategory1?: string
  subCategory2?: string
  brand?: string
}

export const useProductsStore = defineStore('products', {
  state: (): ProductsState => ({
    products: [],
    pagination: null,
    loading: false,
    error: null
  }),

  actions: {
    async fetchProducts(params: FetchProductsParams = {}) {
      this.loading = true
      this.error = null

      try {
        const { $functions } = useNuxtApp()
        if (!$functions) {
          throw new Error('Firebase Functions non initialisé')
        }

        const getProductsCall = httpsCallable($functions, 'getProducts')
        const result = await getProductsCall(params)

        if (!result.data || typeof result.data !== 'object') {
          throw new Error('Réponse invalide du serveur')
        }

        const data = result.data as {
          products: Product[]
          pagination: Pagination
        }

        this.products = data.products
        this.pagination = data.pagination
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue'
        this.error = errorMessage
        // Log l'erreur avec un message plus descriptif
        if (error instanceof Error) {
          console.error(`Erreur lors du chargement des produits: ${error.message}`, {
            error,
            params
          })
        } else {
          console.error('Erreur inconnue lors du chargement des produits:', {
            error,
            params
          })
        }
        throw error
      } finally {
        this.loading = false
      }
    },

    async getProductByCip(cip_code: string) {
      this.loading = true
      this.error = null

      try {
        const { $functions } = useNuxtApp()
        if (!$functions) {
          throw new Error('Firebase Functions non initialisé')
        }

        const getProductCall = httpsCallable($functions, 'getProductByCip')
        const result = await getProductCall({ cip_code })

        if (!result.data || typeof result.data !== 'object') {
          throw new Error('Réponse invalide du serveur')
        }

        return result.data as Product
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue'
        this.error = errorMessage
        // Log l'erreur avec un message plus descriptif
        if (error instanceof Error) {
          console.error(`Erreur lors de la récupération du produit ${cip_code}: ${error.message}`, {
            error,
            cip_code
          })
        } else {
          console.error(`Erreur inconnue lors de la récupération du produit ${cip_code}:`, {
            error,
            cip_code
          })
        }
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})