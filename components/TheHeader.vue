<template>
  <header class="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
    <nav class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
      <div class="flex h-16 items-center justify-between">
        <!-- Logo et titre -->
        <div class="flex items-center">
          <NuxtLink to="/" class="flex items-center">
            <span class="text-xl sm:text-2xl font-bold text-indigo-600">PharmaData</span>
          </NuxtLink>
        </div>
  
        <!-- Menu mobile -->
        <div class="flex md:hidden">
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            type="button"
            class="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
            aria-controls="mobile-menu"
            :aria-expanded="mobileMenuOpen"
          >
            <span class="sr-only">Ouvrir le menu</span>
            <!-- Icon menu -->
            <svg
              v-if="!mobileMenuOpen"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
            <!-- Icon fermer -->
            <svg
              v-else
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
  
        <!-- Menu desktop -->
        <div class="hidden md:flex md:items-center md:space-x-6">
          <NuxtLink
            to="/products"
            class="text-base font-medium text-gray-500 hover:text-gray-900"
          >Fiches Produits</NuxtLink>
          <NuxtLink
            to="/api-plans"
            class="text-base font-medium text-gray-500 hover:text-gray-900"
          >Plans API</NuxtLink>
          <template v-if="!user">
            <NuxtLink
              to="/cart"
              class="relative group flex items-center"
            >
              <span class="sr-only">Panier</span>
              <svg 
                class="h-5 w-5 text-gray-500 group-hover:text-gray-900 transition-all duration-200 ease-in-out"
                :class="{ 'animate-bounce': isCartBouncing }"
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                stroke-width="1.5"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              <span 
                v-if="cartStore.totalItems > 0"
                class="absolute -top-2 -right-2 flex items-center justify-center h-4 w-4 text-xs font-medium text-white bg-indigo-600 rounded-full transform transition-transform duration-200 ease-in-out group-hover:scale-110"
              >
                {{ cartStore.totalItems }}
              </span>
            </NuxtLink>
            <NuxtLink
              to="/login"
              class="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700"
            >Connexion</NuxtLink>
          </template>
          <template v-else>
            <NuxtLink
              to="/account/api-tokens"
              class="text-base font-medium text-gray-500 hover:text-gray-900"
            >Mes Tokens API</NuxtLink>
            <NuxtLink
              to="/cart"
              class="relative group flex items-center"
            >
              <span class="sr-only">Panier</span>
              <svg 
                class="h-5 w-5 text-gray-500 group-hover:text-gray-900 transition-all duration-200 ease-in-out"
                :class="{ 'animate-bounce': isCartBouncing }"
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                stroke-width="1.5"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              <span 
                v-if="cartStore.totalItems > 0"
                class="absolute -top-2 -right-2 flex items-center justify-center h-4 w-4 text-xs font-medium text-white bg-indigo-600 rounded-full transform transition-transform duration-200 ease-in-out group-hover:scale-110"
              >
                {{ cartStore.totalItems }}
              </span>
            </NuxtLink>
            <button
              @click="handleLogout"
              class="text-base font-medium text-gray-500 hover:text-gray-900"
            >Déconnexion</button>
          </template>
        </div>
      </div>
  
      <!-- Menu mobile (dropdown) -->
      <div
        v-show="mobileMenuOpen"
        class="md:hidden"
        id="mobile-menu"
      >
        <div class="space-y-1 px-2 pb-3 pt-2">
          <NuxtLink
            to="/products"
            class="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            @click="mobileMenuOpen = false"
          >Fiches Produits</NuxtLink>
          <NuxtLink
            to="/api-plans"
            class="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            @click="mobileMenuOpen = false"
          >Plans API</NuxtLink>
          <NuxtLink
            to="/cart"
            class="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            @click="mobileMenuOpen = false"
          >
            <div class="flex items-center">
              <span>Panier</span>
              <span v-if="cartStore.totalItems > 0" class="ml-2 text-sm text-indigo-600">({{ cartStore.totalItems }})</span>
            </div>
          </NuxtLink>
          <template v-if="!user">
            <NuxtLink
              to="/login"
              class="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              @click="mobileMenuOpen = false"
            >Connexion</NuxtLink>
          </template>
          <template v-else>
            <NuxtLink
              to="/account/api-tokens"
              class="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              @click="mobileMenuOpen = false"
            >Mes Tokens API</NuxtLink>
            <button
              @click="() => { handleLogout(); mobileMenuOpen = false; }"
              class="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            >Déconnexion</button>
          </template>
        </div>
      </div>
    </nav>
  </header>
  </template>
  
  <script setup>
  import { useAuthStore } from '~/stores/auth'
  import { useCartStore } from '~/stores/cart'
  import { storeToRefs } from 'pinia'
  
  const authStore = useAuthStore()
  const cartStore = useCartStore()
  const { user } = storeToRefs(authStore)
  const { logout } = authStore
  const mobileMenuOpen = ref(false)
  const isCartBouncing = ref(false)
  
  const handleLogout = async () => {
    try {
      await logout()
      navigateTo('/')
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
    }
  }
  
  // Watch cart changes to trigger animation
  watch(() => cartStore.totalItems, (newCount, oldCount) => {
    if (newCount > oldCount) {
      isCartBouncing.value = true
      setTimeout(() => {
        isCartBouncing.value = false
      }, 500) // Reduced animation duration to 500ms for subtlety
    }
  })
  </script>
  
  <style scoped>
  .animate-bounce {
    animation: bounce 0.5s cubic-bezier(0.36, 0, 0.66, -0.56) forwards;
  }
  
  @keyframes bounce {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.15); }
  }
  </style>