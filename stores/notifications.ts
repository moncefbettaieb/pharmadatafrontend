import { defineStore } from 'pinia'
import { httpsCallable } from 'firebase/functions'

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'error' | 'warning'
  read: boolean
  createdAt: string
}

interface NotificationsState {
  notifications: Notification[]
  loading: boolean
  error: string | null
}

export const useNotificationsStore = defineStore('notifications', {
  state: (): NotificationsState => ({
    notifications: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchNotifications() {
      this.loading = true
      this.error = null

      try {
        const { $functions } = useNuxtApp()
        if (!$functions) {
          throw new Error('Firebase Functions non initialisé')
        }

        const getNotificationsCall = httpsCallable($functions, 'getNotifications')
        const result = await getNotificationsCall()

        if (!result.data || typeof result.data !== 'object') {
          throw new Error('Réponse invalide du serveur')
        }

        const { notifications } = result.data as { notifications: Notification[] }
        this.notifications = notifications
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Une erreur est survenue'
        throw error
      } finally {
        this.loading = false
      }
    },

    async markAsRead(notificationId: string) {
      try {
        const { $functions } = useNuxtApp()
        if (!$functions) {
          throw new Error('Firebase Functions non initialisé')
        }

        const markNotificationAsReadCall = httpsCallable($functions, 'markNotificationAsRead')
        await markNotificationAsReadCall({ notificationId })

        // Mettre à jour localement
        const notification = this.notifications.find(n => n.id === notificationId)
        if (notification) {
          notification.read = true
        }
      } catch (error) {
        console.error('Erreur lors du marquage de la notification:', error)
        throw error
      }
    },

    async deleteNotification(notificationId: string) {
      try {
        const { $functions } = useNuxtApp()
        if (!$functions) {
          throw new Error('Firebase Functions non initialisé')
        }

        const deleteNotificationCall = httpsCallable($functions, 'deleteNotification')
        await deleteNotificationCall({ notificationId })

        // Supprimer localement
        this.notifications = this.notifications.filter(n => n.id !== notificationId)
      } catch (error) {
        console.error('Erreur lors de la suppression de la notification:', error)
        throw error
      }
    }
  }
})