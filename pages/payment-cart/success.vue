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
            
            <!-- Bouton pour télécharger tous les fichiers en ZIP -->
            <div class="mb-6">
              <button
                @click="downloadAllAsZip"
                :disabled="loadingZip"
                class="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                <svg v-if="loadingZip" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {{ loadingZip ? 'Préparation du ZIP...' : `Télécharger tous les fichiers en ZIP (${paymentStore.selectedFormat.toUpperCase()})` }}
              </button>
              
              <a 
                v-if="paymentStore.zipUrl"
                :href="paymentStore.zipUrl"
                target="_blank"
                class="mt-2 w-full flex justify-center items-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                :download="`fiches-produits.${paymentStore.selectedFormat}.zip`"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Télécharger le ZIP généré
              </a>
            </div>
            
            <!-- Liste des fichiers individuels -->
            <h3 class="text-md font-medium text-gray-700 mb-3">Téléchargement individuel</h3>
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
          </div>

          <!-- Bouton pour afficher/masquer le formulaire de support -->
          <div class="mt-8 text-center">
            <button
              @click="showSupportForm = !showSupportForm"
              class="text-indigo-600 hover:text-indigo-500"
            >
              {{ showSupportForm ? 'Masquer le formulaire de support' : 'Besoin d\'aide ? Contacter le support' }}
            </button>
          </div>

          <!-- Formulaire de contact support - indépendant des erreurs -->
          <div v-if="showSupportForm" class="mt-4 bg-gray-50 p-4 rounded-md">
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
            <div v-if="supportError" class="mt-2 text-red-600 text-sm">
              {{ supportError }}
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
const loadingZip = ref(false)
const error = ref(null)
const supportError = ref(null)
const downloadUrls = ref([])
const supportMessage = ref('')
const sendingEmail = ref(false)
const showSupportForm = ref(false)

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

const downloadAllAsZip = async () => {
  const sessionId = route.query.session_id
  if (!sessionId) return

  loadingZip.value = true
  try {
    await paymentStore.getProductFilesAsZip(sessionId, paymentStore.selectedFormat)
    toast.success(`Archive ZIP des fichiers ${paymentStore.selectedFormat.toUpperCase()} générée avec succès`)
  } catch (err) {
    toast.error("Une erreur s'est produite lors de la génération de l'archive ZIP")
    console.error('Erreur ZIP:', err)
  } finally {
    loadingZip.value = false
  }
}

const handleSupportEmail = async () => {
  if (!supportMessage.value.trim()) return

  supportError.value = null
  sendingEmail.value = true
  try {
    const { $firebaseFunctions } = useNuxtApp()
    if (!$firebaseFunctions) throw new Error('Firebase Functions non initialisé')

    const sessionId = route.query.session_id
    if (!sessionId) {
      throw new Error('ID de session manquant')
    }

    const sendEmailCall = httpsCallable($firebaseFunctions, 'sendSupportEmail')
    const result = await sendEmailCall({
      subject: 'Problème avec le téléchargement des fichiers',
      message: supportMessage.value,
      sessionId: sessionId
    })

    toast.success('Votre message a été envoyé au support')
    supportMessage.value = ''
    showSupportForm.value = false
  } catch (err) {
    console.error('Erreur détaillée:', err)
    supportError.value = err.message || "Une erreur s'est produite lors de l'envoi du mail"
    toast.error(supportError.value)
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