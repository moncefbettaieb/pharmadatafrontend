import { defineStore } from 'pinia'
import { httpsCallable } from 'firebase/functions'

interface ApiUsage {
  date: string
  requests: number
  limit: number
}

interface TokenHistory {
  id: string
  createdAt: string
  revokedAt: string | null
  lastUsed: string | null
}

interface ApiPlan {
  name: string
  requestsPerMonth: number
  remainingRequests: number
}

interface ApiState {
  token: string | null
  loading: boolean
  error: string | null
  usage: ApiUsage[]
  history: TokenHistory[]
  currentPlan: ApiPlan | null
}

export const useApiStore = defineStore('api', {
  state: (): ApiState => ({
    token: null,
    loading: false,
    error: null,
    usage: [],
    history: [],
    currentPlan: null
  }),

  getters: {
    usagePercentage: (state): number => {
      if (!state.currentPlan) return 0
      const used = state.currentPlan.requestsPerMonth - state.currentPlan.remainingRequests
      return Math.round((used / state.currentPlan.requestsPerMonth) * 100)
    }
  },

  actions: {
    async generateToken() {
      this.loading = true
      this.error = null

      try {
        const { $functions } = useNuxtApp()
        if (!$functions) {
          throw new Error('Firebase Functions non initialisé')
        }

        const generateTokenCall = httpsCallable($functions, 'generateToken')
        const result = await generateTokenCall()
        
        if (!result.data || typeof result.data !== 'object') {
          throw new Error('Réponse invalide du serveur')
        }

        const { token, id } = result.data as { token: string; id: string }
        
        this.token = token
        this.history.unshift({
          id,
          createdAt: new Date().toISOString(),
          revokedAt: null,
          lastUsed: null
        })
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Une erreur est survenue'
        throw error
      } finally {
        this.loading = false
      }
    },

    async revokeToken() {
      if (!this.token) return

      this.loading = true
      this.error = null

      try {
        const { $functions } = useNuxtApp()
        if (!$functions) {
          throw new Error('Firebase Functions non initialisé')
        }

        const revokeTokenCall = httpsCallable($functions, 'revokeToken')
        await revokeTokenCall()

        const currentToken = this.history.find(t => !t.revokedAt)
        if (currentToken) {
          currentToken.revokedAt = new Date().toISOString()
        }
        this.token = null
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Une erreur est survenue'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchUsage() {
      this.loading = true
      this.error = null

      try {
        const { $functions } = useNuxtApp()
        if (!$functions) {
          throw new Error('Firebase Functions non initialisé')
        }

        const getApiUsageCall = httpsCallable($functions, 'getApiUsage')
        const result = await getApiUsageCall()

        if (!result.data || typeof result.data !== 'object') {
          throw new Error('Réponse invalide du serveur')
        }

        const data = result.data as {
          usage: ApiUsage[]
          currentPlan: ApiPlan
        }

        this.usage = data.usage
        this.currentPlan = data.currentPlan
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Une erreur est survenue'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchTokenHistory() {
      this.loading = true
      this.error = null

      try {
        const { $functions } = useNuxtApp()
        if (!$functions) {
          throw new Error('Firebase Functions non initialisé')
        }

        const getTokenHistoryCall = httpsCallable($functions, 'getTokenHistory')
        const result = await getTokenHistoryCall()

        if (!result.data || !Array.isArray(result.data)) {
          throw new Error('Réponse invalide du serveur')
        }

        this.history = result.data as TokenHistory[]
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Une erreur est survenue'
        throw error
      } finally {
        this.loading = false
      }
    }
  },

  persist: true
})