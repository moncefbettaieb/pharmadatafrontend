<template>
    <div class="min-h-screen bg-gray-50 py-12">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="bg-white shadow sm:rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <!-- Tabs -->
            <div class="border-b border-gray-200">
              <nav class="-mb-px flex space-x-8" aria-label="Tabs">
                <button
                  v-for="tab in tabs"
                  :key="tab.id"
                  @click="currentTab = tab.id"
                  :class="[
                    currentTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                    'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium'
                  ]"
                >
                  {{ tab.name }}
                </button>
              </nav>
            </div>
    
            <!-- Personal Information -->
            <div v-if="currentTab === 'personal'" class="mt-6 space-y-6">
              <div>
                <h3 class="text-lg font-medium text-gray-900">Informations personnelles</h3>
                <form @submit.prevent="updateProfile" class="mt-6 space-y-6">
                  <div>
                    <label for="name" class="block text-sm font-medium text-gray-700">Nom</label>
                    <input
                      type="text"
                      id="name"
                      v-model="profileData.displayName"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
    
                  <div>
                    <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      id="email"
                      :value="authStore.user?.email"
                      disabled
                      class="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
    
                  <div>
                    <button
                      type="submit"
                      :disabled="loading"
                      class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      {{ loading ? 'Enregistrement...' : 'Enregistrer' }}
                    </button>
                  </div>
                </form>
              </div>
    
              <div class="border-t border-gray-200 pt-6">
                <h3 class="text-lg font-medium text-gray-900">Changer le mot de passe</h3>
                <form @submit.prevent="updatePassword" class="mt-6 space-y-6">
                  <div>
                    <label for="current-password" class="block text-sm font-medium text-gray-700">
                      Mot de passe actuel
                    </label>
                    <input
                      type="password"
                      id="current-password"
                      v-model="passwordData.currentPassword"
                      required
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
    
                  <div>
                    <label for="new-password" class="block text-sm font-medium text-gray-700">
                      Nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      id="new-password"
                      v-model="passwordData.newPassword"
                      required
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
    
                  <div>
                    <button
                      type="submit"
                      :disabled="loading"
                      class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      {{ loading ? 'Modification...' : 'Modifier le mot de passe' }}
                    </button>
                  </div>
                </form>
              </div>
            </div>
    
            <!-- API -->
            <div v-if="currentTab === 'api'" class="mt-6 space-y-6">
              <div>
                <h3 class="text-lg font-medium text-gray-900">Clés API</h3>
                <div class="mt-4">
                  <div v-if="apiStore.token" class="rounded-md bg-gray-50 p-4">
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
                  <div class="mt-4">
                    <button
                      v-if="!apiStore.token"
                      @click="generateToken"
                      :disabled="loading"
                      class="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                    >
                      {{ loading ? 'Génération...' : 'Générer un token' }}
                    </button>
                    <button
                      v-else
                      @click="revokeToken"
                      :disabled="loading"
                      class="inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500"
                    >
                      {{ loading ? 'Révocation...' : 'Révoquer le token' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
    
            <!-- Stats -->
            <div v-if="currentTab === 'stats'" class="mt-6 space-y-6">
              <div>
                <h3 class="text-lg font-medium text-gray-900">Statistiques d'utilisation</h3>
                <div class="mt-4">
                  <div v-if="apiStore.currentPlan" class="space-y-4">
                    <div>
                      <p class="text-sm text-gray-500">Plan actuel : {{ apiStore.currentPlan.name }}</p>
                      <p class="text-sm text-gray-500">
                        {{ apiStore.currentPlan.remainingRequests }} requêtes restantes sur
                        {{ apiStore.currentPlan.requestsPerMonth }}
                      </p>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div
                        class="bg-indigo-600 h-2 rounded-full"
                        :style="{ width: `${apiStore.usagePercentage}%` }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
    
            <!-- Notifications -->
            <div v-if="currentTab === 'notifications'" class="mt-6 space-y-6">
              <div>
                <h3 class="text-lg font-medium text-gray-900">Notifications</h3>
                <div class="mt-4">
                  <div v-if="notificationsStore.loading" class="text-center py-4">
                    <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
                  </div>
                  
                  <div v-else-if="notificationsStore.error" class="text-center py-4">
                    <p class="text-red-600">{{ notificationsStore.error }}</p>
                    <button
                      @click="fetchNotifications"
                      class="mt-2 text-indigo-600 hover:text-indigo-500"
                    >
                      Réessayer
                    </button>
                  </div>
    
                  <div v-else-if="notificationsStore.notifications.length === 0" class="text-center py-4">
                    <p class="text-gray-500">Aucune notification</p>
                  </div>
    
                  <div v-else class="space-y-4">
                    <div
                      v-for="notification in notificationsStore.notifications"
                      :key="notification.id"
                      class="bg-white shadow rounded-lg p-4"
                      :class="{
                        'border-l-4': !notification.read,
                        'border-indigo-500': !notification.read && notification.type === 'info',
                        'border-green-500': !notification.read && notification.type === 'success',
                        'border-red-500': !notification.read && notification.type === 'error',
                        'border-yellow-500': !notification.read && notification.type === 'warning'
                      }"
                    >
                      <div class="flex items-start justify-between">
                        <div class="flex-1">
                          <h4 class="text-sm font-medium text-gray-900">{{ notification.title }}</h4>
                          <p class="mt-1 text-sm text-gray-500">{{ notification.message }}</p>
                          <p class="mt-1 text-xs text-gray-400">
                            {{ new Date(notification.createdAt).toLocaleDateString('fr-FR', { 
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) }}
                          </p>
                        </div>
                        <div class="ml-4 flex-shrink-0 flex">
                          <button
                            v-if="!notification.read"
                            @click="markAsRead(notification.id)"
                            class="text-indigo-600 hover:text-indigo-500 text-sm"
                          >
                            Marquer comme lu
                          </button>
                          <button
                            @click="deleteNotification(notification.id)"
                            class="ml-3 text-gray-400 hover:text-gray-500"
                          >
                            <span class="sr-only">Supprimer</span>
                            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path
                                fill-rule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clip-rule="evenodd"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
    
            <!-- Logout -->
            <div v-if="currentTab === 'logout'" class="mt-6">
              <div class="rounded-md bg-red-50 p-4">
                <div class="flex">
                  <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fill-rule="evenodd"
                        d="M8.485 3.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 3.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </div>
                  <div class="ml-3">
                    <h3 class="text-sm font-medium text-red-800">Déconnexion</h3>
                    <div class="mt-2">
                      <p class="text-sm text-red-700">
                        Êtes-vous sûr de vouloir vous déconnecter ? Vous devrez vous reconnecter pour accéder à votre compte.
                      </p>
                    </div>
                    <div class="mt-4">
                      <button
                        @click="handleLogout"
                        :disabled="loading"
                        class="inline-flex items-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700"
                      >
                        {{ loading ? 'Déconnexion...' : 'Se déconnecter' }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </template>
    
    <script setup>
    import { ref } from 'vue'
    import { useAuthStore } from '~/stores/auth'
    import { useApiStore } from '~/stores/api'
    import { useNotificationsStore } from '~/stores/notifications'
    import { useToast } from 'vue-toastification'
    
    const authStore = useAuthStore()
    const apiStore = useApiStore()
    const notificationsStore = useNotificationsStore()
    const toast = useToast()
    const router = useRouter()
    
    const loading = ref(false)
    const currentTab = ref('personal')
    
    const tabs = [
      { id: 'personal', name: 'Informations personnelles' },
      { id: 'api', name: 'API' },
      { id: 'stats', name: 'Statistiques' },
      { id: 'notifications', name: 'Notifications' },
      { id: 'logout', name: 'Déconnexion' }
    ]
    
    const profileData = ref({
      displayName: authStore.user?.displayName || ''
    })
    
    const passwordData = ref({
      currentPassword: '',
      newPassword: ''
    })
    
    const updateProfile = async () => {
      loading.value = true
      try {
        await authStore.updateProfile({
          displayName: profileData.value.displayName
        })
        toast.success('Profil mis à jour avec succès')
      } catch (error) {
        toast.error('Erreur lors de la mise à jour du profil')
      } finally {
        loading.value = false
      }
    }
    
    const updatePassword = async () => {
      loading.value = true
      try {
        await authStore.updatePassword(
          passwordData.value.currentPassword,
          passwordData.value.newPassword
        )
        passwordData.value = {
          currentPassword: '',
          newPassword: ''
        }
        toast.success('Mot de passe mis à jour avec succès')
      } catch (error) {
        toast.error('Erreur lors de la mise à jour du mot de passe')
      } finally {
        loading.value = false
      }
    }
    
    const generateToken = async () => {
      loading.value = true
      try {
        await apiStore.generateToken()
        toast.success('Token généré avec succès')
      } catch (error) {
        toast.error('Erreur lors de la génération du token')
      } finally {
        loading.value = false
      }
    }
    
    const revokeToken = async () => {
      loading.value = true
      try {
        await apiStore.revokeToken()
        toast.success('Token révoqué avec succès')
      } catch (error) {
        toast.error('Erreur lors de la révocation du token')
      } finally {
        loading.value = false
      }
    }
    
    const copyToken = () => {
      if (apiStore.token) {
        navigator.clipboard.writeText(apiStore.token)
        toast.success('Token copié dans le presse-papier')
      }
    }
    
    const handleLogout = async () => {
      loading.value = true
      try {
        await authStore.logout()
        router.push('/login')
        toast.success('Déconnexion réussie')
      } catch (error) {
        toast.error('Erreur lors de la déconnexion')
      } finally {
        loading.value = false
      }
    }
    
    const fetchNotifications = async () => {
      try {
        await notificationsStore.fetchNotifications()
      } catch (error) {
        console.error('Erreur lors du chargement des notifications:', error)
      }
    }
    
    const markAsRead = async (notificationId) => {
      try {
        await notificationsStore.markAsRead(notificationId)
        toast.success('Notification marquée comme lue')
      } catch (error) {
        toast.error('Erreur lors du marquage de la notification')
      }
    }
    
    const deleteNotification = async (notificationId) => {
      try {
        await notificationsStore.deleteNotification(notificationId)
        toast.success('Notification supprimée')
      } catch (error) {
        toast.error('Erreur lors de la suppression de la notification')
      }
    }
    
    // Charger les données au montage
    onMounted(async () => {
      try {
        await Promise.all([
          apiStore.fetchUsage(),
          notificationsStore.fetchNotifications()
        ])
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error)
      }
    })
    
    // Protection de la route
    definePageMeta({
      middleware: ['auth']
    })
    </script>