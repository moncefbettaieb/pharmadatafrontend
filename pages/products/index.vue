<template>
  <div class="bg-white">
    <div class="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">Nos Fiches Produits</h1>

        <!-- Recherche par CIP -->
        <div class="relative w-full sm:w-96">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            v-model="searchCip"
            placeholder="Rechercher un produit par CIP..."
            class="block w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent shadow-sm placeholder-gray-400 transition duration-150 ease-in-out text-sm sm:text-base"
          />
          <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              v-if="searchCip"
              @click="searchCip = ''"
              class="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>
          <div 
            v-if="searchCip && filteredProducts.length === 0" 
            class="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 py-2 px-3 text-sm text-gray-500"
          >
            Aucun produit trouvé avec ce CIP
          </div>
        </div>
      </div>

      <!-- Loading et Error states -->
      <div v-if="productsStore.loading" class="mt-6 text-center">
        <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
        <p class="mt-2 text-gray-500">Chargement des produits...</p>
      </div>

      <div v-else-if="productsStore.error" class="mt-6 text-center">
        <p class="text-red-500">{{ productsStore.error }}</p>
        <button 
          @click="fetchProducts"
          class="mt-4 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white"
        >
          Réessayer
        </button>
      </div>

      <!-- Grid des produits -->
      <div v-else class="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div
          v-for="product in filteredProducts"
          :key="product.cip_code"
          class="group flex flex-col justify-between border rounded-md p-4 bg-white shadow-sm h-full min-h-[450px]"
        >
          <!-- Image -->
          <div class="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md bg-gray-200">
            <img
              :src="product.image_url || 'images/placeholder-product.png'"
              :alt="product.title"
              class="h-full w-full object-cover object-center"
            />
          </div>

          <!-- Infos produit -->
          <div class="mt-4 flex-1 flex flex-col">
            <div>
              <h3 class="text-sm font-medium text-gray-700">{{ product.title }}</h3>
              <p class="mt-1 text-sm text-gray-500">{{ product.brand }}</p>
              <p class="mt-1 text-xs text-gray-400">CIP: {{ product.cip_code }}</p>
            </div>
            <p class="mt-2 text-sm text-gray-600 line-clamp-2">{{ product.short_desc }}</p>
            <p class="mt-2 text-xs text-gray-500">{{ product.categorie }} > {{ product.sous_categorie_1 }} > {{ product.sous_categorie_2 }}</p>

            <!-- Prix + Bouton -->
            <div class="mt-auto pt-4 flex items-center justify-between">
              <p class="text-sm font-medium text-gray-900">0.70€</p>
              <button
                @click="addToCart(product)"
                class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                :disabled="isInCart(product.id)"
              >
                {{ isInCart(product.id) ? 'Déjà dans le panier' : 'Ajouter au panier' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination (inchangée) -->
      <div v-if="productsStore.pagination" class="mt-8 flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6">
        <div class="flex flex-1 justify-between sm:hidden">
          <button
            :disabled="currentPage === 1"
            @click="currentPage--"
            class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            :class="{ 'opacity-50 cursor-not-allowed': currentPage === 1 }"
          >
            Précédent
          </button>
          <button
            :disabled="!productsStore.pagination.hasMore"
            @click="currentPage++"
            class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            :class="{ 'opacity-50 cursor-not-allowed': !productsStore.pagination.hasMore }"
          >
            Suivant
          </button>
        </div>
        <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              Affichage de <span class="font-medium">{{ ((currentPage - 1) * limit) + 1 }}</span> à
              <span class="font-medium">{{ Math.min(currentPage * limit, productsStore.pagination.total) }}</span> sur
              <span class="font-medium">{{ productsStore.pagination.total }}</span> résultats
            </p>
          </div>
          <div>
            <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button
                v-for="page in displayedPages"
                :key="page"
                @click="currentPage = page"
                :class="[
                  page === currentPage ? 'bg-indigo-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50',
                  'relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300'
                ]"
              >
                {{ page }}
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { useProductsStore } from '~/stores/products'
import { useCartStore } from '~/stores/cart'
import { useToast } from 'vue-toastification'
import { httpsCallable } from 'firebase/functions'
import type { Product } from '~/types/product'

const productsStore = useProductsStore()
const cartStore = useCartStore()
const toast = useToast()

const currentPage = ref(1)
const limit = ref(12)
const searchCip = ref('')
const filteredProducts = computed(() => {
  if (!searchCip.value) return productsStore.products
  return productsStore.products.filter(product => 
    product.cip_code.toLowerCase().includes(searchCip.value.toLowerCase())
  )
})

const displayedPages = computed(() => {
  if (!productsStore.pagination) return []
  
  const totalPages = productsStore.pagination.totalPages
  const current = currentPage.value
  const pages = []
  
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    if (current <= 3) {
      for (let i = 1; i <= 5; i++) pages.push(i)
      pages.push('...')
      pages.push(totalPages)
    } else if (current >= totalPages - 2) {
      pages.push(1)
      pages.push('...')
      for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      pages.push('...')
      for (let i = current - 1; i <= current + 1; i++) pages.push(i)
      pages.push('...')
      pages.push(totalPages)
    }
  }
  
  return pages
})

const fetchProducts = async () => {
  try {
    await productsStore.fetchProducts({
      page: currentPage.value,
      limit: limit.value
    })
  } catch (error) {
    console.error('Erreur lors du chargement des produits:', error)
    toast.error("Une erreur s'est produite lors du chargement des produits")
  }
}

const isInCart = (productId: string): boolean => {
  return cartStore.items.some(item => item.productId === productId)
}

const addToCart = (product: any) => {
  if (!isInCart(product.id)) {
    cartStore.addToCart({
      ...product,
      price: 0.7,
      quantity: 1
    })
    toast.success('Fiche produit ajoutée au panier')
  }
}

watch([currentPage, limit, searchCip], () => {
  fetchProducts()
})

onMounted(() => {
  fetchProducts()
})

// Meta tags pour les robots
useHead({
  meta: [
    { name: 'robots', content: 'noindex, nofollow' }
  ]
})
</script>