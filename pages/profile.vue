<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <div class="bg-white shadow sm:rounded-lg">
        <div class="p-4 sm:p-6">
          <!-- Onglets -->
          <div class="border-b border-gray-200 overflow-x-auto">
            <nav
              class="-mb-px flex flex-nowrap gap-x-4 sm:gap-x-8"
              aria-label="Tabs"
            >
              <button
                v-for="tab in tabs"
                :key="tab.id"
                @click="currentTab = tab.id"
                :class="[
                  currentTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                  'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium flex-shrink-0',
                ]"
              >
                {{ tab.name }}
              </button>
            </nav>
          </div>

          <!-- Contenu par onglet -->
          <div class="mt-6 space-y-12">
            <!-- Informations personnelles -->
            <div v-if="currentTab === 'personal'">
              <h3 class="text-lg font-medium text-gray-900">
                Informations personnelles
              </h3>
              <form @submit.prevent="updateProfile" class="mt-6 space-y-6">
                <div>
                  <label
                    for="name"
                    class="block text-sm font-medium text-gray-700"
                    >Nom</label
                  >
                  <input
                    type="text"
                    id="name"
                    v-model="profileData.displayName"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label
                    for="email"
                    class="block text-sm font-medium text-gray-700"
                    >Email</label
                  >
                  <input
                    type="email"
                    id="email"
                    :value="authStore.user?.email"
                    disabled
                    class="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm sm:text-sm"
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    :disabled="loading"
                    class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none"
                  >
                    {{ loading ? "Enregistrement..." : "Enregistrer" }}
                  </button>
                </div>
              </form>

              <div class="border-t border-gray-200 pt-6">
                <h3 class="text-lg font-medium text-gray-900">
                  Changer le mot de passe
                </h3>
                <form @submit.prevent="updatePassword" class="mt-6 space-y-6">
                  <div>
                    <label
                      for="current-password"
                      class="block text-sm font-medium text-gray-700"
                    >
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
                    <label
                      for="new-password"
                      class="block text-sm font-medium text-gray-700"
                    >
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
                      class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
                    >
                      {{
                        loading ? "Modification..." : "Modifier le mot de passe"
                      }}
                    </button>
                  </div>
                </form>
              </div>
            </div>
            <!-- Contact -->
            <div v-if="currentTab === 'contact'" class="mt-6">
              <ContactForm />
            </div>

            <!-- Statistiques -->
            <div v-if="currentTab === 'stats'">
              <h3 class="text-lg font-medium text-gray-900">
                Statistiques d'utilisation
              </h3>
              <div class="mt-4">
                <div v-if="apiStore.currentPlan" class="space-y-4">
                  <p class="text-sm text-gray-500">
                    Plan actuel : {{ apiStore.currentPlan.name }}<br />
                    {{ apiStore.currentPlan.remainingRequests }} requêtes
                    restantes sur
                    {{ apiStore.currentPlan.requestsPerMonth }}
                  </p>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div
                      class="bg-indigo-600 h-2 rounded-full"
                      :style="{ width: `${apiStore.usagePercentage}%` }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Notifications -->
            <NotificationList
              :notifications="notificationsStore.notifications"
              :loading="notificationsStore.loading"
              :error="notificationsStore.error"
              @mark-as-read="markAsRead"
              @delete="deleteNotification"
              @retry="fetchNotifications"
            />

            <!-- Déconnexion -->
            <div v-if="currentTab === 'logout'">
              <div class="rounded-md bg-red-50 p-4">
                <div class="flex">
                  <div class="flex-shrink-0">
                    <svg
                      class="h-5 w-5 text-red-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M8.485 3.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 3.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </div>
                  <div class="ml-3">
                    <h3 class="text-sm font-medium text-red-800">
                      Déconnexion
                    </h3>
                    <p class="text-sm text-red-700 mt-1">
                      Vous serez redirigé vers la page de connexion.
                    </p>
                    <button
                      @click="handleLogout"
                      :disabled="loading"
                      class="mt-3 inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                    >
                      {{ loading ? "Déconnexion..." : "Se déconnecter" }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- /Contenus -->
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import NotificationList from "~/components/NotificationList.vue";
import ContactForm from "~/components/ContactForm.vue";
import { ref, onMounted } from "vue";
import { useAuthStore } from "~/stores/auth";
import { useApiStore } from "~/stores/api";
import { useNotificationsStore } from "~/stores/notifications";
import { useToast } from "vue-toastification";
import { useRouter } from "#app";

const authStore = useAuthStore();
const apiStore = useApiStore();
const notificationsStore = useNotificationsStore();
const toast = useToast();
const router = useRouter();

const loading = ref(false);
const currentTab = ref("personal");

const tabs = [
  { id: "personal", name: "Informations personnelles" },
  { id: "contact", name: "Contact" },
  { id: "stats", name: "Statistiques" },
  { id: "notifications", name: "Notifications" },
  { id: "logout", name: "Déconnexion" },
];

const profileData = ref({
  displayName: authStore.user?.displayName || "",
});

const passwordData = ref({
  currentPassword: "",
  newPassword: "",
});

const updateProfile = async () => {
  loading.value = true;
  try {
    await authStore.updateProfile({
      displayName: profileData.value.displayName,
    });
    toast.success("Profil mis à jour avec succès");
  } catch {
    toast.error("Erreur lors de la mise à jour du profil");
  } finally {
    loading.value = false;
  }
};

const updatePassword = async () => {
  loading.value = true;
  try {
    await authStore.updatePassword(
      passwordData.value.currentPassword,
      passwordData.value.newPassword
    );
    passwordData.value = { currentPassword: "", newPassword: "" };
    toast.success("Mot de passe mis à jour");
  } catch {
    toast.error("Erreur lors de la mise à jour du mot de passe");
  } finally {
    loading.value = false;
  }
};

const generateToken = async () => {
  loading.value = true;
  try {
    await apiStore.generateToken();
    toast.success("Token généré");
  } catch {
    toast.error("Erreur lors de la génération du token");
  } finally {
    loading.value = false;
  }
};

const revokeToken = async () => {
  loading.value = true;
  try {
    await apiStore.revokeToken();
    toast.success("Token révoqué");
  } catch {
    toast.error("Erreur lors de la révocation");
  } finally {
    loading.value = false;
  }
};

const copyToken = () => {
  if (apiStore.token) {
    navigator.clipboard.writeText(apiStore.token);
    toast.success("Token copié");
  }
};

const handleLogout = async () => {
  loading.value = true;
  try {
    await authStore.logout();
    router.push("/login");
    toast.success("Déconnecté");
  } catch {
    toast.error("Erreur lors de la déconnexion");
  } finally {
    loading.value = false;
  }
};

const fetchNotifications = async () => {
  try {
    await notificationsStore.fetchNotifications();
  } catch {
    toast.error("Erreur lors du chargement des notifications");
  }
};

const markAsRead = async (id) => {
  try {
    await notificationsStore.markAsRead(id);
    toast.success("Notification lue");
  } catch {
    toast.error("Erreur lors de la mise à jour");
  }
};

const deleteNotification = async (id) => {
  try {
    await notificationsStore.deleteNotification(id);
    toast.success("Notification supprimée");
  } catch {
    toast.error("Erreur lors de la suppression");
  }
};

onMounted(() => {
  apiStore.fetchUsage();
  notificationsStore.fetchNotifications();
});

definePageMeta({ middleware: ["auth"] });
</script>
