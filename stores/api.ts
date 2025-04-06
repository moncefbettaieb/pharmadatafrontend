import { defineStore } from "pinia";
import { httpsCallable } from "firebase/functions";
import type { PersistenceOptions as PersistenceOptions } from "pinia-plugin-persistedstate";

interface ApiUsage {
  date: string;
  endpoint: string;
}

interface TokenHistory {
  id: string;
  createdAt: string;
  revokedAt: string | null;
  lastUsed: string | null;
}

interface ApiPlan {
  name: string;
  requestsPerMonth: number;
  remainingRequests: number;
  periodStart: string;
  periodEnd: string;
}

interface ApiState {
  token: string | null;
  loading: boolean;
  error: string | null;
  usage: ApiUsage[];
  history: TokenHistory[];
  currentPlan: ApiPlan | null;
}

export const useApiStore = defineStore("api", {
  state: (): ApiState => ({
    token: null,
    loading: false,
    error: null,
    usage: [],
    history: [],
    currentPlan: null,
  }),

  getters: {
    usagePercentage: (state): number => {
      if (!state.currentPlan) return 0;
      const used =
        state.currentPlan.requestsPerMonth -
        state.currentPlan.remainingRequests;
      return Math.round((used / state.currentPlan.requestsPerMonth) * 100);
    },
  },

  actions: {
    async generateToken() {
      this.loading = true;
      this.error = null;
      try {
        const { $firebaseFunctions } = useNuxtApp();
        if (!$firebaseFunctions) {
          throw new Error("Firebase Functions non initialisé");
        }

        const generateTokenCall = httpsCallable($firebaseFunctions, "generateToken");
        const result = await generateTokenCall();

        if (!result.data || typeof result.data !== "object") {
          throw new Error("Réponse invalide du serveur");
        }

        const { token, id } = result.data as { token: string; id: string };
        if (!token || !id) {
          throw new Error("Token ou ID manquant dans la réponse");
        }
        this.token = token;
        this.history.unshift({
          id,
          createdAt: new Date().toISOString(),
          revokedAt: null,
          lastUsed: null,
        });
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : "Une erreur est survenue";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async revokeToken() {
      if (!this.token) return;

      this.loading = true;
      this.error = null;

      try {
        const { $firebaseFunctions } = useNuxtApp();
        if (!$firebaseFunctions) {
          throw new Error("Firebase Functions non initialisé");
        }

        const revokeTokenCall = httpsCallable($firebaseFunctions, "revokeToken");
        await revokeTokenCall();

        const currentToken = this.history.find((t) => !t.revokedAt);
        if (currentToken) {
          currentToken.revokedAt = new Date().toISOString();
        }
        this.token = null;
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : "Une erreur est survenue";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchUsage() {
      this.loading = true;
      this.error = null;

      try {
        const { $firebaseFunctions } = useNuxtApp();
        if (!$firebaseFunctions) {
          throw new Error("Firebase Functions non initialisé");
        }

        const getApiUsageCall = httpsCallable($firebaseFunctions, "getApiUsage");
        const result = await getApiUsageCall();

        if (!result.data || typeof result.data !== "object") {
          throw new Error("Réponse invalide du serveur");
        }

        const data = result.data as {
          usage: ApiUsage[];
          currentPlan: ApiPlan;
        };

        this.usage = data.usage;
        this.currentPlan = data.currentPlan;
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : "Une erreur est survenue";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchTokenHistory() {
      this.loading = true;
      this.error = null;

      try {
        const { $firebaseFunctions } = useNuxtApp();
        if (!$firebaseFunctions) {
          throw new Error("Firebase Functions non initialisé");
        }

        const getTokenHistoryCall = httpsCallable(
          $firebaseFunctions,
          "getTokenHistory"
        );
        const result = await getTokenHistoryCall();

        if (!result.data || !Array.isArray(result.data)) {
          throw new Error("Réponse invalide du serveur");
        }

        this.history = result.data as TokenHistory[];

        // Mettre à jour le token actif depuis l'historique
        const activeToken = this.history.find((t) => !t.revokedAt);
        if (activeToken) {
          const getTokenCall = httpsCallable($firebaseFunctions, "getToken");
          const tokenResult = await getTokenCall({ tokenId: activeToken.id });
          const data = tokenResult.data as { token: string };
          if (data && data.token) {
            this.token = data.token;
          }
        }
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : "Une erreur est survenue";
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },

  persist: {
    key: "api-store",
    storage: localStorage,
    paths: ["token", "history"],
  } as PersistenceOptions<ApiState>,
});
