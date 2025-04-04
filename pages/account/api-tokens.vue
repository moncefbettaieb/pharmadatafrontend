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
  
      <!-- Token actuel -->
      <div class="bg-white shadow sm:rounded-lg mb-8">
        <div class="px-4 py-5 sm:p-6">
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
        <div v-if="apiStore.currentPlan" class="border-t border-gray-200 px-4 py-5 sm:p-6">
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
  
          <!-- Graphique d'utilisation -->
          <div class="mt-6">
            <h4 class="text-sm font-medium text-gray-900 mb-4">Historique d'utilisation</h4>
            <div class="grid grid-cols-7 gap-2">
              <div
                v-for="day in apiStore.usage"
                :key="day.date"
                class="h-24 bg-gray-100 rounded-md p-2 relative"
              >
                <div class="text-xs text-gray-500">{{ formatDate(day.date) }}</div>
                <div class="text-sm font-medium">{{ day.requests }} req.</div>
                <div 
                  class="absolute bottom-2 left-2 right-2 bg-indigo-200 rounded-sm transition-all duration-300"
                  :style="{ height: `${(day.requests / day.limit) * 100}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Documentation d'utilisation -->
        <div class="border-t border-gray-200 px-4 py-5 sm:p-6">
          <h3 class="text-base font-semibold leading-6 text-gray-900">Utilisation de l'API</h3>
          <div class="mt-4 space-y-4">
            <div>
              <h4 class="text-sm font-medium text-gray-900">Authentification</h4>
              <pre class="mt-2 rounded-md bg-gray-50 p-4">
  Authorization: Bearer {{ apiStore.token || 'votre_token' }}</pre>
            </div>
            <div>
              <h4 class="text-sm font-medium text-gray-900">Exemple de requête</h4>
              <pre class="mt-2 rounded-md bg-gray-50 p-4">
  curl -X GET \
  https://europe-west9-fournisseur-data.cloudfunctions.net/getProductByCip?cip_code="12345" \
  -H 'Authorization: Bearer {{ apiStore.token || 'votre_token' }}'</pre>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Historique des tokens -->
      <div class="bg-white shadow sm:rounded-lg">
        <div class="px-4 py-5 sm:p-6">
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
  </div>
  </template>
  
  <script setup lang="ts">
  import { useApiStore } from '~/stores/api'
  import { useToast } from 'vue-toastification'
  
  const apiStore = useApiStore()
  const toast = useToast()
  
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
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
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