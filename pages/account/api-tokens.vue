<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <!-- Plan actuel -->
      <div class="bg-white shadow sm:rounded-lg mb-8">
        <div class="px-4 py-5 sm:p-6">
          <div class="sm:flex sm:items-center sm:justify-between">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Plan actuel</h3>
              <div class="mt-2 max-w-xl text-sm text-gray-500">
                <p class="font-medium text-indigo-600">{{ apiStore.currentPlan?.name || 'Chargement...' }}</p>
                <p class="mt-1">{{ apiStore.currentPlan?.requestsPerMonth || 0 }} requêtes par mois</p>
              </div>
            </div>
            <div class="mt-4 sm:mt-0">
              <NuxtLink
                to="/api-plans"
                class="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
              >
                Changer de plan
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Tabs -->
      <div class="bg-white shadow sm:rounded-lg">
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex" aria-label="Tabs">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="currentTab = tab.id"
              :class="[
                currentTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                'w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm'
              ]"
            >
              {{ tab.name }}
            </button>
          </nav>
        </div>
  
        <div class="p-6">
          <!-- Token API et Utilisation -->
          <div v-if="currentTab === 'token'" class="space-y-8">
            <!-- Token actuel -->
            <div>
              <h3 class="text-base font-semibold leading-6 text-gray-900">Token API</h3>
              <div class="mt-2 max-w-xl text-sm text-gray-500">
                <p>Utilisez ce token pour authentifier vos requêtes API. Gardez-le secret et ne le partagez pas.</p>
              </div>
  
              <div v-if="apiStore.token" class="mt-5">
                <div class="rounded-md bg-gray-50 p-4">
                  <div class="flex">
                    <pre class="flex-1 text-sm text-gray-900">{{ apiStore.token }}</pre>
                    <button
                      @click="copyToken"
                      class="ml-3 inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                      Copier
                    </button>
                  </div>
                </div>
                <div class="mt-5">
                  <button
                    @click="handleRevokeToken"
                    :disabled="apiStore.loading"
                    class="inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                  >
                    <span v-if="apiStore.loading">Révocation en cours...</span>
                    <span v-else>Révoquer le token</span>
                  </button>
                </div>
              </div>
  
              <div v-else class="mt-5">
                <button
                  @click="handleGenerateToken"
                  :disabled="apiStore.loading"
                  class="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  <span v-if="apiStore.loading">Génération en cours...</span>
                  <span v-else>Générer un nouveau token</span>
                </button>
              </div>
  
              <div v-if="apiStore.error" class="mt-4 text-sm text-red-600">
                {{ apiStore.error }}
              </div>
            </div>
  
            <!-- Utilisation de l'API -->
            <div v-if="apiStore.currentPlan" class="border-t border-gray-200 pt-8">
              <h3 class="text-base font-semibold leading-6 text-gray-900">Utilisation de l'API</h3>
              <div class="mt-4">
                <div class="flex justify-between mb-2">
                  <span class="text-sm font-medium text-gray-700">
                    {{ apiStore.currentPlan.remainingRequests }} requêtes restantes sur {{ apiStore.currentPlan.requestsPerMonth }}
                  </span>
                  <span class="text-sm font-medium text-gray-700">
                    {{ apiStore.usagePercentage }}%
                  </span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    class="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                    :style="{ width: `${apiStore.usagePercentage}%` }"
                    :class="{
                      'bg-yellow-500': apiStore.usagePercentage >= 70 && apiStore.usagePercentage < 90,
                      'bg-red-500': apiStore.usagePercentage >= 90
                    }"
                  ></div>
                </div>
              </div>
  
              <!-- Historique des tokens -->
              <div class="mt-8">
                <h3 class="text-base font-semibold leading-6 text-gray-900">Historique des tokens</h3>
                <div class="mt-4">
                  <div class="flow-root">
                    <ul role="list" class="-my-5 divide-y divide-gray-200">
                      <li v-for="token in apiStore.history" :key="token.id" class="py-4">
                        <div class="flex items-center space-x-4">
                          <div class="flex-1 min-w-0">
                            <p class="text-sm font-medium text-gray-900 truncate">
                              Token {{ token.id.substring(0, 8) }}...
                            </p>
                            <p class="text-sm text-gray-500">
                              Créé le {{ formatDateTime(token.createdAt) }}
                            </p>
                            <p v-if="token.revokedAt" class="text-sm text-red-500">
                              Révoqué le {{ formatDateTime(token.revokedAt) }}
                            </p>
                            <p v-if="token.lastUsed" class="text-sm text-gray-500">
                              Dernière utilisation : {{ formatDateTime(token.lastUsed) }}
                            </p>
                          </div>
                          <div class="inline-flex items-center">
                            <span
                              class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                              :class="{
                                'bg-green-100 text-green-800': !token.revokedAt,
                                'bg-red-100 text-red-800': token.revokedAt
                              }"
                            >
                              {{ token.revokedAt ? 'Révoqué' : 'Actif' }}
                            </span>
                          </div>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
  
          <!-- Import de fichier -->
          <div v-if="currentTab === 'import'" class="space-y-8">
            <div>
              <h3 class="text-base font-semibold leading-6 text-gray-900">Import de fichier</h3>
              <div class="mt-2 max-w-xl text-sm text-gray-500">
                <p>Importez un fichier contenant des codes CIP pour récupérer les informations des produits.</p>
              </div>
  
              <div class="mt-5">
                <div class="flex items-center justify-center w-full">
                  <label class="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div class="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg class="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                      </svg>
                      <p class="mb-2 text-sm text-gray-500">
                        <span class="font-semibold">Cliquez pour uploader</span> ou glissez-déposez
                      </p>
                      <p class="text-xs text-gray-500">TXT, JSON, CSV ou Excel</p>
                    </div>
                    <input 
                      type="file" 
                      class="hidden" 
                      accept=".txt,.json,.csv,.xlsx,.xls"
                      @change="handleFileUpload"
                    />
                  </label>
                </div>
              </div>
  
              <!-- Résultats -->
              <div v-if="results.length > 0" class="mt-8">
                <h4 class="text-sm font-medium text-gray-900 mb-4">Résultats</h4>
                <div class="overflow-x-auto">
                  <table class="min-w-full divide-y divide-gray-300">
                    <thead>
                      <tr>
                        <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">CIP</th>
                        <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Titre</th>
                        <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Marque</th>
                        <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Statut</th>
                        <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Dernière mise à jour</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200">
                      <tr v-for="result in results" :key="result.cip_code">
                        <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900">{{ result.cip_code }}</td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ result.title }}</td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ result.brand }}</td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm">
                          <span :class="{
                            'text-green-700 bg-green-50': result.status === 'success',
                            'text-red-700 bg-red-50': result.status === 'error'
                          }" class="inline-flex rounded-full px-2 text-xs font-semibold leading-5">
                            {{ result.status === 'success' ? 'Succès' : 'Erreur' }}
                          </span>
                        </td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {{ result.last_update ? formatDate(result.last_update) : '-' }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  </template>
  
  <script setup lang="ts">
  import { useApiStore } from '~/stores/api'
  import { useToast } from 'vue-toastification'
  import { httpsCallable } from 'firebase/functions'
  
  const apiStore = useApiStore()
  const toast = useToast()
  
  const currentTab = ref('token')
  const loading = ref(false)
  const results = ref<any[]>([])
  
  const tabs = [
    { id: 'token', name: 'Token API et Utilisation' },
    { id: 'import', name: 'Import de fichier' }
  ]
  
  onMounted(async () => {
    try {
      await Promise.all([
        apiStore.fetchUsage(),
        apiStore.fetchTokenHistory()
      ])
  
      // Générer automatiquement un token si l'utilisateur n'en a pas
      if (!apiStore.token) {
        await apiStore.generateToken()
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
      toast.error("Erreur lors du chargement des données")
    }
  })
  
  const handleGenerateToken = async () => {
    try {
      await apiStore.generateToken()
      toast.success('Token généré avec succès')
    } catch (error) {
      toast.error("Erreur lors de la génération du token")
    }
  }
  
  const handleRevokeToken = async () => {
    try {
      await apiStore.revokeToken()
      toast.success('Token révoqué avec succès')
    } catch (error) {
      toast.error("Erreur lors de la révocation du token")
    }
  }
  
  const copyToken = () => {
    if (apiStore.token) {
      navigator.clipboard.writeText(apiStore.token)
      toast.success('Token copié dans le presse-papier')
    }
  }
  
  const handleFileUpload = async (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file) return
  
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string
        const cipCodes = content.split(/[\n,]/).map(code => code.trim()).filter(Boolean)
  
        results.value = []
        loading.value = true
  
        const { $functions } = useNuxtApp()
        if (!$functions) throw new Error('Firebase Functions non initialisé')
  
        const getProductByCipCall = httpsCallable($functions, 'getProductByCip')
  
        for (const cipCode of cipCodes) {
          try {
            const result = await getProductByCipCall({ cipCode })
            const product = result.data
            results.value.push({
              cip_code: cipCode,
              title: product.title,
              brand: product.brand,
              status: 'success',
              last_update: product.last_update
            })
          } catch (error) {
            results.value.push({
              cip_code: cipCode,
              title: '-',
              brand: '-',
              status: 'error',
              last_update: null
            })
          }
        }
  
        toast.success(`Import terminé : ${results.value.filter(r => r.status === 'success').length} produits trouvés`)
      } catch (error) {
        console.error('Erreur lors de la lecture du fichier:', error)
        toast.error('Erreur lors de la lecture du fichier')
      } finally {
        loading.value = false
        // Réinitialiser l'input file
        const input = event.target as HTMLInputElement
        input.value = ''
      }
    }
  
    reader.readAsText(file)
  }
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }
  
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  definePageMeta({
    middleware: ['auth']
  })
  </script>