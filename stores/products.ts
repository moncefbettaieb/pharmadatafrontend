import { defineStore } from 'pinia'
import { httpsCallable } from 'firebase/functions'
import type { Product } from '~/types/product'

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
  categorie?: string
  sous_categorie_1?: string
  sous_categorie_2?: string
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
        if (error instanceof Error) {
          console.error(`Erreur lors du chargement des fiches produits: ${error.message}`, {
            error,
            params
          })
        } else {
          console.error('Erreur inconnue lors du chargement des fiches produits:', {
            error,
            params
          })
        }
        throw error
      } finally {
        this.loading = false
      }
    },

    async getProductByCip(cipCode: string): Promise<Partial<Product>> {
      this.loading = true
      this.error = null

      try {
        const { $functions } = useNuxtApp()
        if (!$functions) {
          throw new Error('Firebase Functions non initialisé')
        }

        const getProductCall = httpsCallable($functions, 'getProductByCip')
        const result = await getProductCall({ cipCode })

        if (!result.data || typeof result.data !== 'object') {
          throw new Error('Réponse invalide du serveur')
        }

        const product = result.data as Product
        
        // Filtrer les champs non-nuls
        return Object.fromEntries(
          Object.entries(product).filter(([_, value]) => value !== null && value !== undefined)
        ) as Partial<Product>
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue'
        this.error = errorMessage
        if (error instanceof Error) {
          console.error(`Erreur lors de la récupération du produit ${cipCode}: ${error.message}`, {
            error,
            cipCode
          })
        } else {
          console.error(`Erreur inconnue lors de la récupération du produit ${cipCode}:`, {
            error,
            cipCode
          })
        }
        throw error
      } finally {
        this.loading = false
      }
    },

    async getProductById(id: string): Promise<Product> {
      this.loading = true
      this.error = null

      try {
        // Rechercher d'abord dans les produits déjà chargés
        const existingProduct = this.products.find(p => p.id === id)
        if (existingProduct) {
          return existingProduct
        }

        // Si le produit n'est pas trouvé dans le store, charger tous les produits
        if (this.products.length === 0) {
          await this.fetchProducts()
          const product = this.products.find(p => p.id === id)
          if (product) {
            return product
          }
        }

        throw new Error('Produit non trouvé')
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue'
        this.error = errorMessage
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})