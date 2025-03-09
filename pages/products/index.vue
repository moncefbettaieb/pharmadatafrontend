<template>
  <div class="bg-white">
    <div class="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
      <div class="flex justify-between items-center">
        <h1 class="text-3xl font-bold tracking-tight text-gray-900">Nos Fiches Produits</h1>
        
        <!-- Filtres -->
        <div class="flex gap-4">
          <select 
            v-model="filters.category"
            class="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Toutes catégories</option>
            <option v-for="category in categories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>

          <select 
            v-model="sortBy"
            class="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="title">Nom</option>
            <option value="brand">Marque</option>
            <option value="category">Catégorie</option>
          </select>

          <select 
            v-model="sortOrder"
            class="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="asc">Croissant</option>
            <option value="desc">Décroissant</option>
          </select>
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
      <div v-else class="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
        <div v-for="product in productsStore.products" :key="product.id" class="group relative">
          <div class="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-md bg-gray-200 lg:aspect-none group-hover:opacity-75 lg:h-80">
            <img 
              :src="product.image_url || '/placeholder-product.jpg'" 
              :alt="product.title"
              class="h-full w-full object-cover object-center lg:h-full lg:w-full"
            >
          </div>
          <div class="mt-4">
            <div>
              <h3 class="text-sm text-gray-700">
                {{ product.title }}
              </h3>
              <p class="mt-1 text-sm text-gray-500">{{ product.brand }}</p>
              <p class="mt-1 text-xs text-gray-400">CIP: {{ product.cip_code }}</p>
            </div>
          </div>
          <div class="mt-2">
            <p class="text-sm text-gray-600 line-clamp-2">{{ product.short_desc }}</p>
          </div>
          <div class="mt-2">
            <p class="text-xs text-gray-500">
              {{ product.category }} > {{ product.sub_category1 }} > {{ product.sub_category2 }}
            </p>
          </div>
          <div class="mt-4 flex items-center justify-between">
            <p class="text-sm font-medium text-gray-900">0.50€</p>
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

      <!-- Pagination -->
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

const productsStore = useProductsStore()
const cartStore = useCartStore()
const toast = useToast()

const currentPage = ref(1)
const limit = ref(12)
const sortBy = ref('title')
const sortOrder = ref('asc')
const filters = ref({
  category: '',
  subCategory1: '',
  subCategory2: '',
  brand: ''
})

const categories = computed(() => {
  return [...new Set(productsStore.products.map(p => p.category))].sort()
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
      limit: limit.value,
      sortBy: sortBy.value,
      sortOrder: sortOrder.value,
      ...filters.value
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
      price: 0.5,
      quantity: 1
    })
    toast.success('Fiche produit ajoutée au panier')
  }
}

watch([currentPage, limit, sortBy, sortOrder, filters], () => {
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