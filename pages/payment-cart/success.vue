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
          
          <div v-if="error" class="mb-6">
            <div class="text-red-600 mb-4">
              {{ error }}
            </div>
            <!-- Formulaire de contact support -->
            <div class="bg-gray-50 p-4 rounded-md">
              <h3 class="text-sm font-medium text-gray-900 mb-2">Contacter le support</h3>
              <form @submit.prevent="handleSupportEmail" class="space-y-4">
                <div>
                  <label for="message" class="block text-sm font-medium text-gray-700">
                    Message
                  </label>
                  <textarea
                    id="message"
                    v-model="supportMessage"
                    rows="4"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Décrivez votre problème..."
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  :disabled="sendingEmail"
                  class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {{ sendingEmail ? 'Envoi en cours...' : 'Envoyer' }}
                </button>
              </form>
            </div>
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
                Retour aux fiches produits
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { usePaymentCartStore } from '~/stores/payment-cart'
import { useCartStore } from '~/stores/cart'
import { useToast } from 'vue-toastification'
import { httpsCallable } from 'firebase/functions'

const route = useRoute()
const paymentStore = usePaymentCartStore()
const cartStore = useCartStore()
const toast = useToast()

const loading = ref(true)
const error = ref(null)
const downloadUrls = ref([])
const supportMessage = ref('')
const sendingEmail = ref(false)

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

const handleSupportEmail = async () => {
  if (!supportMessage.value.trim()) return

  sendingEmail.value = true
  try {
    const { $functions } = useNuxtApp()
    if (!$functions) throw new Error('Firebase Functions non initialisé')

    const sendEmailCall = httpsCallable($functions, 'sendSupportEmail')
    await sendEmailCall({
      subject: 'Problème avec le téléchargement des fichiers',
      message: supportMessage.value,
      sessionId: route.query.session_id
    })

    toast.success('Votre message a été envoyé au support')
    supportMessage.value = ''
  } catch (err) {
    toast.error("Une erreur s'est produite lors de l'envoi du mail")
    console.error('Erreur envoi email:', err)
  } finally {
    sendingEmail.value = false
  }
}

onMounted(async () => {
  const sessionId = route.query.session_id
  
  if (!sessionId) {
    console.warn('Pas de session ID')
    error.value = 'Session de paiement invalide'
    loading.value = false
    return
  }

  try {
    const files = await paymentStore.getProductFiles(sessionId)
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