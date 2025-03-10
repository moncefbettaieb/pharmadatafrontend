<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <div v-if="loading" class="text-center">
          <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p class="mt-2 text-gray-600">Chargement de vos fichiers...</p>
        </div>
        
        <div v-else>
          <h2 class="text-2xl font-bold text-green-600 mb-4">Paiement réussi !</h2>
          
          <div v-if="error" class="mb-4 text-red-600">
            {{ error }}
          </div>
          
          <div v-else>
            <p class="text-gray-600 mb-6">
              Vos fiches produits sont prêtes à être téléchargées.
            </p>

            <!-- Sélection du format -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">Format de fichier</label>
              <div class="flex gap-4">
                <button
                  @click="changeFormat('pdf')"
                  class="flex-1 py-2 px-4 rounded-md"
                  :class="{
                    'bg-indigo-600 text-white': paymentStore.selectedFormat === 'pdf',
                    'bg-gray-100 text-gray-700': paymentStore.selectedFormat !== 'pdf'
                  }"
                >
                  PDF
                </button>
                <button
                  @click="changeFormat('json')"
                  class="flex-1 py-2 px-4 rounded-md"
                  :class="{
                    'bg-indigo-600 text-white': paymentStore.selectedFormat === 'json',
                    'bg-gray-100 text-gray-700': paymentStore.selectedFormat !== 'json'
                  }"
                >
                  JSON
                </button>
              </div>
            </div>
            
            <div class="space-y-4">
              <div v-for="(url, index) in downloadUrls" :key="index" class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Fiche produit {{ index + 1 }}</span>
                <a 
                  :href="url"
                  target="_blank"
                  class="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  :download="`fiche-produit-${index + 1}.${paymentStore.selectedFormat}`"
                >
                  Télécharger le fichier
                </a>
              </div>
            </div>
            
            <div class="mt-8 text-center">
              <NuxtLink
                to="/products"
                class="text-indigo-600 hover:text-indigo-500"
              >
                Retour aux produits
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { usePaymentStore } from '~/stores/paymentCart'
import { useCartStore } from '~/stores/cart'
import { useToast } from 'vue-toastification'

const route = useRoute()
const paymentStore = usePaymentStore()
const cartStore = useCartStore()
const toast = useToast()

const loading = ref(true)
const error = ref(null)
const downloadUrls = ref([])

const changeFormat = async (format) => {
  const sessionId = route.query.session_id
  if (!sessionId) return

  loading.value = true
  try {
    downloadUrls.value = await paymentStore.getProductFiles(sessionId, format)
  } catch (err) {
    error.value = "Une erreur s'est produite lors de la récupération de vos fichiers"
    toast.error(error.value)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  console.log('Montage du composant success.vue')
  const sessionId = route.query.session_id
  console.log('Session ID:', sessionId)
  
  if (!sessionId) {
    console.warn('Pas de session ID')
    error.value = 'Session de paiement invalide'
    loading.value = false
    return
  }

  try {
    console.log('Appel de getProductFiles...')
    const files = await paymentStore.getProductFiles(sessionId)
    console.log('Fichiers reçus:', files)
    downloadUrls.value = files
    cartStore.clearCart()
  } catch (err) {
    console.error('Erreur complète:', err)
    error.value = "Une erreur s'est produite lors de la récupération de vos fichiers"
    toast.error(error.value)
  } finally {
    loading.value = false
  }
})
</script>