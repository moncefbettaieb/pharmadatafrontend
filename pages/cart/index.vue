<template>
  <div class="bg-white">
    <div class="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
      <h1 class="text-3xl font-bold tracking-tight text-gray-900">Votre Panier</h1>

      <div v-if="cartStore.items.length === 0" class="mt-6 text-center">
        <p class="text-gray-500">Votre panier est vide</p>
        <NuxtLink
          to="/products"
          class="mt-4 inline-block rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          Parcourir les fiches produits
        </NuxtLink>
      </div>

      <div v-else>
        <!-- Liste des fiches produits -->
        <div class="mt-8">
          <div class="flow-root">
            <ul role="list" class="-my-6 divide-y divide-gray-200">
              <li v-for="item in cartStore.items" :key="item.productId" class="flex py-6">
                <!-- Image du produit -->
                <div class="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                  <img 
                    :src="item.image_url || 'images/placeholder-product.png'" 
                    :alt="item.title"
                    class="h-full w-full object-cover object-center"
                  >
                </div>

                <div class="ml-4 flex flex-1 flex-col">
                  <div>
                    <div class="flex justify-between text-base font-medium text-gray-900">
                      <h3>{{ item.title }}</h3>
                      <p class="ml-4">0.70€</p>
                    </div>
                    <p class="mt-1 text-sm text-gray-500 line-clamp-2">{{ item.short_desc }}</p>
                  </div>
                  
                  <div class="flex flex-1 items-end justify-between text-sm">
                    <p class="text-gray-500">CIP: {{ item.cip_code }}</p>
                    <div class="flex">
                      <button
                        @click="removeFromCart(item.productId)"
                        class="font-medium text-indigo-600 hover:text-indigo-500"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <!-- Résumé -->
        <div class="mt-8 border-t border-gray-200 pt-8">
          <div class="flex justify-between text-base font-medium text-gray-900">
            <p>Total</p>
            <p>{{ (cartStore.items.length * 0.70).toFixed(2) }}€</p>
          </div>
          <p class="mt-0.5 text-sm text-gray-500">TVA incluse.</p>
          
          <div class="mt-6">
            <button
              @click="proceedToCheckout"
              :disabled="paymentStore.loading"
              class="w-full rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ paymentStore.loading ? 'Redirection vers le paiement...' : 'Commander' }}
            </button>
          </div>
          
          <div v-if="paymentStore.error" class="mt-4 text-center text-red-600 text-sm">
            {{ paymentStore.error }}
          </div>
          
          <div class="mt-6 flex justify-center text-center text-sm text-gray-500">
            <p>
              ou
              <NuxtLink
                to="/products"
                class="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Continuer vos achats
              </NuxtLink>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCartStore } from '~/stores/cart'
import { usePaymentCartStore } from '~/stores/paymentCart'
import { useToast } from 'vue-toastification'

const cartStore = useCartStore()
const paymentStore = usePaymentCartStore()
const toast = useToast()

const removeFromCart = (productId: string): void => {
  cartStore.removeFromCart(productId)
  toast.success('Fiche produit retirée du panier')
}

const proceedToCheckout = async (): Promise<void> => {
  try {
    await paymentStore.createProductPaymentSession(cartStore.items)
  } catch (error) {
    toast.error("Une erreur s'est produite lors de la redirection vers le paiement")
  }
}

definePageMeta({
  middleware: ['auth']
})
</script>