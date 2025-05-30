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
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <!-- Prénom (obligatoire) -->
                  <div>
                    <label
                      for="firstName"
                      class="block text-sm font-medium text-gray-700"
                    >
                      Prénom <span class="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      v-model="profileData.firstName"
                      required
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  <!-- Nom -->
                  <div>
                    <label
                      for="lastName"
                      class="block text-sm font-medium text-gray-700"
                    >
                      Nom
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      v-model="profileData.lastName"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  <!-- Email (obligatoire) -->
                  <div>
                    <label
                      for="email"
                      class="block text-sm font-medium text-gray-700"
                    >
                      Email <span class="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      :value="authStore.user?.email"
                      disabled
                      class="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm sm:text-sm"
                    />
                  </div>

                  <!-- Téléphone -->
                  <div>
                    <label
                      for="phone"
                      class="block text-sm font-medium text-gray-700"
                    >
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      v-model="profileData.phoneNumber"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  <!-- Date de naissance -->
                  <div>
                    <label
                      for="birthdate"
                      class="block text-sm font-medium text-gray-700"
                    >
                      Date de naissance
                    </label>
                    <input
                      type="date"
                      id="birthdate"
                      v-model="profileData.birthdate"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  <!-- Profession -->
                  <div>
                    <label
                      for="profession"
                      class="block text-sm font-medium text-gray-700"
                    >
                      Profession
                    </label>
                    <select
                      id="profession"
                      v-model="profileData.profession"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value="">Sélectionnez</option>
                      <option value="pharmacien">Pharmacien</option>
                      <option value="préparateur">
                        Préparateur en pharmacie
                      </option>
                      <option value="médecin">Médecin</option>
                      <option value="responsablesi">Resonsable SI</option>
                      <option value="étudiant">Étudiant</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>
                </div>

                <!-- Adresse -->
                <div class="border-t border-gray-200 pt-6 mt-6">
                  <h4 class="text-md font-medium text-gray-900 mb-4">
                    Adresse
                  </h4>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        for="address"
                        class="block text-sm font-medium text-gray-700"
                      >
                        Adresse
                      </label>
                      <input
                        type="text"
                        id="address"
                        v-model="profileData.address"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label
                        for="city"
                        class="block text-sm font-medium text-gray-700"
                      >
                        Ville
                      </label>
                      <input
                        type="text"
                        id="city"
                        v-model="profileData.city"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label
                        for="postalCode"
                        class="block text-sm font-medium text-gray-700"
                      >
                        Code postal
                      </label>
                      <input
                        type="text"
                        id="postalCode"
                        v-model="profileData.postalCode"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label
                        for="country"
                        class="block text-sm font-medium text-gray-700"
                      >
                        Pays
                      </label>
                      <input
                        type="text"
                        id="country"
                        v-model="profileData.country"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>

                <!-- Préférences -->
                <div class="border-t border-gray-200 pt-6 mt-6">
                  <h4 class="text-md font-medium text-gray-900 mb-4">
                    Préférences
                  </h4>
                  <div>
                    <label
                      for="language"
                      class="block text-sm font-medium text-gray-700"
                    >
                      Langue préférée
                    </label>
                    <select
                      id="language"
                      v-model="profileData.preferredLanguage"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value="fr">Français</option>
                      <option value="en">Anglais</option>
                    </select>
                  </div>
                </div>

                <div class="mt-6">
                  <button
                    type="submit"
                    :disabled="loading"
                    class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none"
                  >
                    {{ loading ? "Enregistrement..." : "Enregistrer" }}
                  </button>
                </div>
              </form>

              <div class="border-t border-gray-200 pt-6 mt-8">
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
            <!-- Fiches achetées -->
            <div v-if="currentTab === 'purchased'" class="space-y-6">
              <h3 class="text-lg font-medium text-gray-900">
                Mes fiches achetées
              </h3>

              <div v-if="loadingPurchases" class="text-center py-4">
                <div
                  class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"
                ></div>
                <p class="mt-2 text-gray-600">Chargement de vos fiches...</p>
              </div>

              <div v-else-if="purchaseError" class="text-red-600">
                {{ purchaseError }}
              </div>

              <div
                v-else-if="purchases.length === 0"
                class="text-center py-4 text-gray-500"
              >
                Vous n'avez pas encore acheté de fiches produits.
              </div>

              <div v-else class="space-y-8">
                <div
                  v-for="purchase in purchases"
                  :key="purchase.id"
                  class="bg-white shadow overflow-hidden sm:rounded-lg"
                >
                  <div class="px-4 py-5 sm:px-6 bg-gray-50">
                    <h4 class="text-lg font-medium text-gray-900">
                      Achat du
                      {{
                        new Date(purchase.purchaseDate).toLocaleDateString(
                          "fr-FR",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )
                      }}
                    </h4>
                    <p class="mt-1 text-sm text-gray-500">
                      Format: {{ purchase.format.toUpperCase() }} -
                      {{ purchase.totalFiles }} fichier(s)
                    </p>
                  </div>

                  <div class="border-t border-gray-200 px-4 py-5 sm:px-6">
                    <!-- Si c'est un ZIP -->
                    <div v-if="purchase.zipUrl" class="mb-4">
                      <a
                        :href="purchase.zipUrl"
                        target="_blank"
                        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                        :download="`fiches-produits.${purchase.format}.zip`"
                      >
                        <svg
                          class="mr-2 h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                        Télécharger l'archive ZIP
                      </a>
                    </div>

                    <!-- Liste des fichiers individuels -->
                    <div v-else class="space-y-4">
                      <div
                        v-for="file in purchase.files"
                        :key="file.productId"
                        class="flex justify-between items-center py-2"
                      >
                        <div class="flex-1">
                          <h5 class="text-sm font-medium text-gray-900">
                            {{ file.productData?.title || file.fileName }}
                          </h5>
                          <p class="text-sm text-gray-500">
                            {{
                              file.productData?.codereferent
                                ? `Code Réferent: ${file.productData.codereferent}`
                                : file.fileName
                            }}
                          </p>
                        </div>
                        <a
                          :href="file.url"
                          target="_blank"
                          class="ml-4 inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                          :download="file.fileName"
                        >
                          Télécharger
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Pagination si nécessaire -->
              <div
                v-if="totalPages > 1"
                class="flex justify-center mt-6 space-x-2"
              >
                <button
                  v-for="page in totalPages"
                  :key="page"
                  @click="currentPurchasePage = page"
                  class="px-3 py-1 rounded"
                  :class="
                    currentPurchasePage === page
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  "
                >
                  {{ page }}
                </button>
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

            <!-- Notifications - Afficher uniquement si l'onglet "notifications" est sélectionné -->
            <div v-if="currentTab === 'notifications'">
              <h3 class="text-lg font-medium text-gray-900 mb-4">
                Notifications
              </h3>
              <NotificationList
                :notifications="notificationsStore.notifications"
                :loading="notificationsStore.loading"
                :error="notificationsStore.error"
                @mark-as-read="markAsRead"
                @delete="deleteNotification"
                @retry="fetchNotifications"
              />
            </div>

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
import { ref, onMounted, computed } from "vue";
import { useAuthStore } from "~/stores/auth";
import { useApiStore } from "~/stores/api";
import { useNotificationsStore } from "~/stores/notifications";
import { useToast } from "vue-toastification";
import { useRouter } from "#app";
import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  getDocs,
} from "firebase/firestore";

const authStore = useAuthStore();
const apiStore = useApiStore();
const notificationsStore = useNotificationsStore();
const toast = useToast();
const router = useRouter();

const loading = ref(false);
const currentTab = ref("personal");

const tabs = [
  { id: "personal", name: "Informations personnelles" },
  { id: "purchased", name: "Fiches achetées" },
  { id: "contact", name: "Contact" },
  { id: "stats", name: "Statistiques" },
  { id: "notifications", name: "Notifications" },
  { id: "logout", name: "Déconnexion" },
];

const profileData = ref({
  displayName: authStore.user?.displayName || "",
  firstName: authStore.user?.firstName || "",
  lastName: authStore.user?.lastName || "",
  email: authStore.user?.email || "",
  phoneNumber: authStore.user?.phoneNumber || "",
  birthdate: authStore.user?.birthdate || "",
  profession: authStore.user?.profession || "",
  address: authStore.user?.address || "",
  city: authStore.user?.city || "",
  postalCode: authStore.user?.postalCode || "",
  country: authStore.user?.country || "",
  preferredLanguage: authStore.user?.preferredLanguage || "fr",
});

const passwordData = ref({
  currentPassword: "",
  newPassword: "",
});

const loadingPurchases = ref(false);
const purchaseError = ref(null);
const purchases = ref([]);
const currentPurchasePage = ref(1);
const purchasesPerPage = 5;
const totalPages = computed(() =>
  Math.ceil(purchases.value.length / purchasesPerPage)
);

const updateProfile = async () => {
  loading.value = true;
  try {
    await authStore.updateProfile({
      displayName: profileData.value.displayName,
      firstName: profileData.value.firstName,
      lastName: profileData.value.lastName,
      email: profileData.value.email,
      phoneNumber: profileData.value.phoneNumber,
      birthdate: profileData.value.birthdate,
      profession: profileData.value.profession,
      address: profileData.value.address,
      city: profileData.value.city,
      postalCode: profileData.value.postalCode,
      country: profileData.value.country,
      preferredLanguage: profileData.value.preferredLanguage,
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

const fetchPurchases = async () => {
  loadingPurchases.value = true;
  purchaseError.value = null;
  try {
    const db = getFirestore();
    const purchasesRef = collection(db, "user_purchases");
    const q = query(
      purchasesRef,
      where("userId", "==", authStore.user?.uid),
      orderBy("purchaseDate", "desc")
    );

    const snapshot = await getDocs(q);
    purchases.value = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Erreur lors du chargement des achats:", error);
    purchaseError.value = "Erreur lors du chargement de vos fiches achetées";
    toast.error(purchaseError.value);
  } finally {
    loadingPurchases.value = false;
  }
};

onMounted(() => {
  apiStore.fetchUsage();
  notificationsStore.fetchNotifications();
  fetchPurchases();
});

definePageMeta({ middleware: ["auth-verified"] });
</script>
