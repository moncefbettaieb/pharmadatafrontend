<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <!-- Plan actuel -->
      <div class="bg-white shadow sm:rounded-lg mb-8">
        <div class="px-4 py-5 sm:p-6">
          <!-- Sur petits écrans, empile le contenu, sur sm+ écrans, items-center et justify-between -->
          <div
            class="flex flex-col sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Plan actuel</h3>
              <div class="mt-2 max-w-xl text-sm text-gray-500">
                <p class="font-medium text-indigo-600">
                  {{ apiStore.currentPlan?.name || "Chargement..." }}
                </p>
                <p class="mt-1">
                  {{ apiStore.currentPlan?.requestsPerMonth || 0 }} requêtes par
                  mois
                </p>
              </div>
            </div>
            <div class="mt-4 sm:mt-0">
              <NuxtLink
                to="/api-plans"
                class="inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
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
                'w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm',
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
              <h3 class="text-base font-semibold leading-6 text-gray-900">
                Token API
              </h3>
              <div class="mt-2 max-w-xl text-sm text-gray-500">
                <p>
                  Utilisez ce token pour authentifier vos requêtes API.
                  Gardez-le secret et ne le partagez pas.
                </p>
              </div>

              <div v-if="apiStore.token" class="mt-5">
                <div class="rounded-md bg-gray-50 p-4">
                  <div class="flex flex-col sm:flex-row sm:items-center">
                    <pre
                      class="flex-1 text-sm text-gray-900 overflow-x-auto break-all"
                      >{{ apiStore.token }}
                    </pre>
                    <button
                      @click="copyToken"
                      class="mt-3 sm:mt-0 sm:ml-3 inline-flex items-center justify-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                      Copier
                    </button>
                  </div>
                </div>
                <div class="mt-5">
                  <button
                    @click="handleRevokeToken"
                    :disabled="apiStore.loading"
                    class="inline-flex items-center justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
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
                  class="inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  <span v-if="apiStore.loading">Génération en cours...</span>
                  <span v-else>Générer un nouveau token</span>
                </button>
              </div>
            </div>

            <!-- Utilisation de l'API -->
            <div
              v-if="apiStore.currentPlan"
              class="border-t border-gray-200 pt-8"
            >
              <h3 class="text-base font-semibold leading-6 text-gray-900">
                Utilisation de l'API
              </h3>
              <div class="mt-4">
                <div class="flex flex-col sm:flex-row sm:justify-between mb-2">
                  <span class="text-sm font-medium text-gray-700">
                    {{ apiStore.currentPlan.remainingRequests }} requêtes
                    restantes sur {{ apiStore.currentPlan.requestsPerMonth }}
                  </span>
                  <span class="text-sm font-medium text-gray-700 mt-1 sm:mt-0">
                    {{ apiStore.usagePercentage }}%
                  </span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    class="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                    :style="{ width: `${apiStore.usagePercentage}%` }"
                    :class="{
                      'bg-yellow-500':
                        apiStore.usagePercentage >= 70 &&
                        apiStore.usagePercentage < 90,
                      'bg-red-500': apiStore.usagePercentage >= 90,
                    }"
                  ></div>
                </div>
                <div class="flex justify-between mb-2 mt-2">
                  <span class="text-sm font-medium text-gray-700">
                    Fin de l'abonnement le :
                    {{ formatDate(apiStore.currentPlan.periodEnd) }}
                  </span>
                </div>
              </div>

              <!-- Graphique d'utilisation -->
              <div class="mt-6">
                <h4 class="text-sm font-medium text-gray-900 mb-4">
                  Historique d'utilisation
                </h4>
                <!-- Sur petits écrans, le grid passera en 1 colonne -->
                <div class="grid grid-cols-1 sm:grid-cols-7 gap-2">
                  <div
                    v-for="day in apiStore.usage"
                    :key="day.date"
                    class="h-24 bg-gray-100 rounded-md p-2 relative"
                  >
                    <div class="text-xs text-gray-500">
                      {{ formatDate(day.date) }}
                    </div>
                    <div class="text-sm font-medium">
                      {{ day.endpoint }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Documentation d'utilisation -->
              <div class="border-t border-gray-200 px-4 py-5 sm:p-6 mt-6">
                <h3 class="text-base font-semibold leading-6 text-gray-900">
                  Utilisation de l'API
                </h3>
                <div class="mt-4 space-y-4">
                  <div>
                    <h4 class="text-sm font-medium text-gray-900">
                      Authentification
                    </h4>
                    <pre
                      class="mt-2 rounded-md bg-gray-50 p-4 overflow-x-auto break-all"
                    >
Authorization: Bearer {{ apiStore.token || "votre_token" }}
                    </pre>
                  </div>
                  <div>
                    <div class="flex justify-between items-center"></div>
                    <h4 class="text-sm font-medium text-gray-900">
                      Exemple de Requête
                    </h4>
                  </div>
                  <div class="flex flex-col sm:flex-row sm:items-center">
                    <pre
                      class="flex-1 text-sm text-gray-900 overflow-x-auto break-all"
                    >
curl -X GET \
  https://fournisseur-data.firebaseapp.com/api/v1/products/3400930001479 \
  -H 'Authorization: Bearer {{ apiStore.token || "votre_token" }}'
                    </pre>
                    <button
                      @click="copyRequest"
                      class="mt-3 sm:mt-0 sm:ml-3 inline-flex items-center justify-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                      Copier
                    </button>
                  </div>
                  <div>
                    <h4 class="text-sm font-medium text-gray-900">
                      Exemple de Réonse
                    </h4>
                    <pre class="mt-2 rounded-md bg-gray-50 p-4 overflow-x-auto">
                      {
  "conditionnement": null,
  "title": "A 313 Pommade dermique, 200 000 UI - Tube 50g",
  "source": "pharmacie-du-centre",
  "taxonomy_sub_category1": "Articles pour animaux de compagnie",
  "combined_categorie": "Médicaments Peau, Cheveux Irritation A 313 Pommade dermique, 200 000 UI - Tube 50g",
  "indication_contre_indication": "Déconseillé aux femmes enceintes et allaitantes, Ne pas avaler, Tenir hors de portée des enfants, Usage externe uniquement.",
  "composition_fp": null,
  "brand": "PHARMA DEVELOPPEMENT",
  "specificites": null,
  "composition": null,
  "taxonomy_category": "Animaux et articles pour animaux de compagnie",
  "sous_categorie_3": "A 313 Pommade dermique, 200 000 UI - Tube 50g",
  "nombre_d_unites": "1",
  "substance_active": "Vitamine A (concentrat de)synthétique, forme huileuse",
  "presentation": null,
  "nature_de_produit": "Pommade",
  "sous_categorie_2": "Irritation",
  "sous_categorie_1": "Peau, Cheveux",
  "label": null,
  "contre_indication": null,
  "long_desc": "Volume : 50 g Nombre d’unités : 1 Âge minimum : 15 ans Nature de produit ...",
  "taxonomy_sub_category3": null,
  "cip_code": "3400930001479",
  "taxonomy_sub_category2": "Médicaments pour animaux de compagnie",
  "usage": null,
  "posologie": null,
  "volume": "50 g",
  "last_update": "2025-03-26T20:18:06.423757Z",
  "categorie": "Médicaments",
  "age_minimum": "15 ans",
  "short_desc": "Traitement d'appoint des dermites irritatives."
}</pre
                    >
                  </div>
                </div>
              </div>

              <!-- Historique des tokens -->
              <div class="mt-8">
                <h3 class="text-base font-semibold leading-6 text-gray-900">
                  Historique des tokens
                </h3>
                <div class="mt-4">
                  <div class="flow-root">
                    <ul role="list" class="-my-5 divide-y divide-gray-200">
                      <li
                        v-for="token in apiStore.history"
                        :key="token.id"
                        class="py-4"
                      >
                        <div
                          class="flex flex-col sm:flex-row sm:items-center sm:space-x-4"
                        >
                          <div class="flex-1 min-w-0">
                            <p
                              class="text-sm font-medium text-gray-900 truncate"
                            >
                              Token {{ token.id.substring(0, 8) }}...
                            </p>
                            <p class="text-sm text-gray-500">
                              Créé le {{ formatDateTime(token.createdAt) }}
                            </p>
                            <p
                              v-if="token.revokedAt"
                              class="text-sm text-red-500"
                            >
                              Révoqué le {{ formatDateTime(token.revokedAt) }}
                            </p>
                            <p
                              v-if="token.lastUsed"
                              class="text-sm text-gray-500"
                            >
                              Dernière utilisation :
                              {{ formatDateTime(token.lastUsed) }}
                            </p>
                          </div>
                          <div class="inline-flex mt-2 sm:mt-0">
                            <span
                              class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                              :class="{
                                'bg-green-100 text-green-800': !token.revokedAt,
                                'bg-red-100 text-red-800': token.revokedAt,
                              }"
                            >
                              {{ token.revokedAt ? "Révoqué" : "Actif" }}
                            </span>
                          </div>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="apiStore.error" class="mt-4 text-sm text-red-600">
              {{ apiStore.error }}
            </div>
          </div>

          <!-- Import de fichier -->
          <div v-if="currentTab === 'import'" class="space-y-8">
            <div>
              <h3 class="text-base font-semibold leading-6 text-gray-900">
                Import de fichier
              </h3>
              <div class="mt-2 max-w-xl text-sm text-gray-500">
                <p>
                  Importez un fichier contenant des codes CIP pour récupérer les
                  informations des produits.
                </p>
                <div
                  class="mt-2 py-2 px-3 bg-blue-50 rounded-md text-blue-800 text-xs"
                >
                  <p class="font-medium mb-1">Formats de fichier acceptés :</p>
                  <ul class="list-disc list-inside space-y-1">
                    <li>
                      <strong>TXT</strong> : Un code CIP par ligne ou séparés
                      par des virgules
                    </li>
                    <li>
                      <strong>CSV</strong> : Fichier avec une colonne contenant
                      les codes CIP
                    </li>
                    <li>
                      <strong>Excel</strong> : Feuille avec une colonne
                      contenant les codes CIP
                    </li>
                    <li>
                      <strong>JSON</strong> : Tableau de codes CIP ou objets
                      avec propriété cip/code_cip/cip_code
                    </li>
                  </ul>
                </div>
              </div>

              <div class="mt-5">
                <!-- Uploader -->
                <div class="flex items-center justify-center w-full">
                  <label
                    class="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                    :class="{ 'animate-pulse': loading }"
                  >
                    <div
                      class="flex flex-col items-center justify-center pt-5 pb-6"
                    >
                      <svg
                        class="w-8 h-8 mb-4 text-gray-500"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 20 16"
                      >
                        <path
                          stroke="currentColor"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                        />
                      </svg>
                      <p class="mb-2 text-sm text-gray-500">
                        <span class="font-semibold">Cliquez pour uploader</span>
                        ou glissez-déposez
                      </p>
                      <p class="text-xs text-gray-500">
                        TXT, JSON, CSV ou Excel
                      </p>
                    </div>
                    <input
                      type="file"
                      class="hidden"
                      accept=".txt,.json,.csv,.xlsx,.xls"
                      @change="handleFileUpload"
                      :disabled="loading"
                    />
                  </label>
                </div>
              </div>

              <!-- Indicateur de chargement -->
              <div v-if="loading" class="mt-4 flex justify-center">
                <div
                  class="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-blue-500"
                >
                  <svg
                    class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Traitement en cours...
                </div>
              </div>

              <!-- Résultats -->
              <div v-if="results.length > 0" class="mt-8">
                <div
                  class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4"
                >
                  <h4 class="text-sm font-medium text-gray-900">
                    Résultats ({{ results.length }} produits)
                  </h4>
                  <div class="mt-2 sm:mt-0">
                    <span class="mr-4 text-sm text-gray-600">
                      <span
                        class="inline-block w-3 h-3 rounded-full bg-green-500 mr-1"
                      ></span>
                      {{ results.filter((r) => r.status === "success").length }}
                      trouvés
                    </span>
                    <span class="text-sm text-gray-600">
                      <span
                        class="inline-block w-3 h-3 rounded-full bg-red-500 mr-1"
                      ></span>
                      {{ results.filter((r) => r.status === "error").length }}
                      non trouvés
                    </span>
                  </div>
                </div>
                <!-- overflow-x-auto pour permettre le scroll sur mobile -->
                <div
                  class="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 rounded-lg"
                >
                  <table class="min-w-full divide-y divide-gray-300">
                    <!-- Partie <thead> -->
                    <thead class="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900"
                        >
                          CIP
                        </th>
                        <th
                          scope="col"
                          class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Titre
                        </th>
                        <th
                          scope="col"
                          class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Marque
                        </th>
                        <th
                          scope="col"
                          class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Statut
                        </th>
                        <th
                          scope="col"
                          class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Dernière mise à jour
                        </th>
                        <!-- Nouvelle colonne Actions -->
                        <th
                          scope="col"
                          class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <!-- Partie <tbody> -->
                    <tbody class="divide-y divide-gray-200 bg-white">
                      <tr
                        v-for="(result, index) in results"
                        :key="result.cip_code"
                      >
                        <td
                          class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900"
                        >
                          {{ result.cip_code }}
                        </td>
                        <td
                          class="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                        >
                          {{ result.title }}
                        </td>
                        <td
                          class="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                        >
                          {{ result.brand }}
                        </td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm">
                          <span
                            :class="{
                              'text-green-700 bg-green-50':
                                result.status === 'success',
                              'text-red-700 bg-red-50':
                                result.status === 'error',
                            }"
                            class="inline-flex rounded-full px-2 text-xs font-semibold leading-5"
                          >
                            {{
                              result.status === "success"
                                ? "Succès"
                                : "Produit Non trouvé"
                            }}
                          </span>
                        </td>
                        <td
                          class="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                        >
                          {{
                            result.last_update
                              ? formatDate(result.last_update)
                              : "-"
                          }}
                        </td>

                        <!-- Nouvelle colonne "Actions" -->
                        <td class="whitespace-nowrap px-3 py-4 text-sm">
                          <!-- 1) Bouton (Dé)Afficher détails -->
                          <button
                            class="text-blue-600 underline mr-3"
                            @click="
                              expandedIndex === index
                                ? (expandedIndex = null)
                                : (expandedIndex = index)
                            "
                          >
                            {{
                              expandedIndex === index
                                ? "Masquer"
                                : "Afficher tout"
                            }}
                          </button>

                          <!-- 2) Bouton Copier -->
                          <button
                            class="text-blue-600 underline"
                            @click="
                              copyToClipboard(
                                JSON.stringify(result.fullData, null, 2)
                              )
                            "
                          >
                            Copier
                          </button>

                          <!-- 3) Bloc affichant toutes les données, si c’est la ligne courante -->
                          <div
                            v-if="expandedIndex === index"
                            class="mt-2 p-2 border rounded bg-gray-50"
                          >
                            <pre class="text-xs whitespace-pre-wrap"
                              >{{ JSON.stringify(result.fullData, null, 2) }}
                            </pre>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Fin p-6 -->
      </div>
      <!-- Fin .bg-white -->
    </div>
    <!-- Fin max-w-7xl -->
  </div>
  <!-- Fin min-h-screen -->
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useApiStore } from "~/stores/api";
import { useToast } from "vue-toastification";
import { read, utils } from "xlsx";
import Papa from "papaparse";

const apiStore = useApiStore();
const toast = useToast();

const currentTab = ref("token");
const loading = ref(false);
const results = ref<
  Array<{
    cip_code: string;
    title: string;
    brand: string;
    status: string;
    last_update: any;
  }>
>([]);

const tabs = [
  { id: "token", name: "Token API et Utilisation" },
  { id: "import", name: "Import de fichier" },
];

const expandedIndex = ref<number | null>(null);

// Fonction pour copier
function copyToClipboard(content: string) {
  navigator.clipboard.writeText(content);
  toast.info("Contenu copié au presse-papier");
}

onMounted(async () => {
  try {
    await Promise.all([apiStore.fetchUsage(), apiStore.fetchTokenHistory()]);

    // Générer automatiquement un token si l'utilisateur n'en a pas
    if (!apiStore.token) {
      await apiStore.generateToken();
    }
  } catch (error) {
    console.error("Erreur lors du chargement des données:", error);
    toast.error("Erreur lors du chargement des données");
  }
});

const handleGenerateToken = async () => {
  try {
    await apiStore.generateToken();
    toast.success("Token généré avec succès");
  } catch (error) {
    toast.error("Erreur lors de la génération du token");
  }
};

const handleRevokeToken = async () => {
  try {
    await apiStore.revokeToken();
    toast.success("Token révoqué avec succès");
  } catch (error) {
    toast.error("Erreur lors de la révocation du token");
  }
};

const copyToken = () => {
  if (apiStore.token) {
    navigator.clipboard.writeText(apiStore.token);
    toast.success("Token copié dans le presse-papier");
  }
};

const copyRequest = () => {
  const request = `curl -X GET \\
  https://fournisseur-data.firebaseapp.com/api/v1/products/1234567890123 \\
  -H 'Authorization: Bearer ${apiStore.token || "votre_token"}'`;
  navigator.clipboard.writeText(request);
  toast.info("Exemple de requête copié dans le presse-papier");
};

const handleFileUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const fileType = file.name.split(".").pop()?.toLowerCase();
  let cipCodes: string[] = [];
  loading.value = true;

  try {
    // Traitement selon le type de fichier
    if (fileType === "xlsx" || fileType === "xls") {
      // Traitement des fichiers Excel
      const data = await readExcelFile(file);
      cipCodes = extractCipCodesFromData(data);
    } else if (fileType === "csv") {
      // Traitement des fichiers CSV
      const data = await readCsvFile(file);
      cipCodes = extractCipCodesFromData(data);
    } else if (fileType === "json") {
      // Traitement des fichiers JSON
      const content = await readTextFile(file);
      try {
        const jsonData = JSON.parse(content);
        cipCodes = extractCipCodesFromJson(jsonData);
      } catch (error) {
        throw new Error("Format JSON invalide");
      }
    } else if (fileType === "txt") {
      // Traitement des fichiers texte
      const content = await readTextFile(file);
      cipCodes = content
        .split(/[\n,]/)
        .map((code) => code.trim())
        .filter(Boolean);
    } else {
      throw new Error("Format de fichier non supporté");
    }

    if (cipCodes.length === 0) {
      toast.error("Aucun code CIP trouvé dans le fichier");
      loading.value = false;
      return;
    }

    // Traitement des codes CIP
    await processCipCodes(cipCodes);

    toast.success(
      `Import terminé : ${
        results.value.filter((r) => r.status === "success").length
      } produits trouvés sur ${cipCodes.length} codes CIP`
    );
  } catch (error) {
    console.error("Erreur lors de la lecture du fichier:", error);
    toast.error(
      `Erreur lors de la lecture du fichier: ${
        error instanceof Error ? error.message : "Erreur inconnue"
      }`
    );
  } finally {
    loading.value = false;
    // Réinitialiser l'input file
    const input = event.target as HTMLInputElement;
    input.value = "";
  }
};

// Fonction pour lire un fichier Excel
const readExcelFile = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = utils.sheet_to_json(worksheet);
        resolve(jsonData);
      } catch (error) {
        reject(new Error("Erreur lors de la lecture du fichier Excel"));
      }
    };
    reader.onerror = () =>
      reject(new Error("Erreur lors de la lecture du fichier"));
    reader.readAsBinaryString(file);
  });
};

// Fonction pour lire un fichier CSV
const readCsvFile = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        resolve(results.data);
      },
      error: (error) => {
        reject(new Error(`Erreur lors de la lecture du CSV: ${error.message}`));
      },
    });
  });
};

// Fonction pour lire un fichier texte
const readTextFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    reader.onerror = () =>
      reject(new Error("Erreur lors de la lecture du fichier"));
    reader.readAsText(file);
  });
};

// Extraire les codes CIP à partir de données structurées (Excel ou CSV)
const extractCipCodesFromData = (data: any[]): string[] => {
  const cipCodes: string[] = [];

  // Chercher les codes CIP dans différentes colonnes possibles
  const possibleColumns = [
    "cip",
    "code_cip",
    "cip_code",
    "code",
    "cip13",
    "cip7",
  ];

  data.forEach((row) => {
    let cipCode = null;

    // Vérifier chaque colonne possible
    for (const column of possibleColumns) {
      if (row[column]) {
        cipCode = String(row[column]).trim();
        break;
      }
    }

    // Si aucune colonne trouvée, chercher dans la première colonne disponible
    if (!cipCode && Object.keys(row).length > 0) {
      const firstColumn = Object.keys(row)[0];
      cipCode = String(row[firstColumn]).trim();
    }

    // Ajouter le code CIP s'il est valide
    if (cipCode && cipCode.length > 0) {
      cipCodes.push(cipCode);
    }
  });

  return cipCodes;
};

// Extraire les codes CIP à partir de données JSON
const extractCipCodesFromJson = (jsonData: any): string[] => {
  const cipCodes: string[] = [];

  // Si le JSON est un tableau
  if (Array.isArray(jsonData)) {
    jsonData.forEach((item) => {
      if (typeof item === "string") {
        // Si c'est un tableau de strings
        cipCodes.push(item.trim());
      } else if (typeof item === "object" && item !== null) {
        // Si c'est un tableau d'objets
        const possibleFields = [
          "cip",
          "code_cip",
          "cip_code",
          "code",
          "cip13",
          "cip7",
        ];
        for (const field of possibleFields) {
          if (item[field]) {
            cipCodes.push(String(item[field]).trim());
            break;
          }
        }
      }
    });
  } else if (typeof jsonData === "object" && jsonData !== null) {
    // Si le JSON est un objet avec une propriété qui contient un tableau
    const possibleArrayFields = [
      "cips",
      "codes",
      "cipCodes",
      "products",
      "data",
      "items",
    ];
    for (const field of possibleArrayFields) {
      if (Array.isArray(jsonData[field])) {
        return extractCipCodesFromJson(jsonData[field]);
      }
    }

    // Parcourir toutes les propriétés de l'objet
    Object.values(jsonData).forEach((value) => {
      if (typeof value === "string") {
        cipCodes.push(value.trim());
      }
    });
  }

  return cipCodes.filter(Boolean);
};

// Traiter les codes CIP
const processCipCodes = async (cipCodes: string[]) => {
  results.value = [];

  const { $functions } = useNuxtApp();
  if (!$functions) throw new Error("Firebase Functions non initialisé");

  // Traiter par lot de 10 pour éviter de surcharger le serveur
  const batchSize = 10;
  for (let i = 0; i < cipCodes.length; i += batchSize) {
    const batch = cipCodes.slice(i, i + batchSize);
    await Promise.all(
      batch.map(async (cipCode) => {
        try {
          const result = await fetch(
            "https://fournisseur-data.firebaseapp.com/api/v1/products/" +
              cipCode,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${apiStore.token}`,
                "Content-Type": "application/json",
              },
            }
          );
          // Vérifier si la réponse est correcte
          if (!result.ok) {
            throw new Error("Erreur lors de la récupération du produit");
          }
          const product = await result.json();
          results.value.push({
            cip_code: cipCode,
            title: product.title,
            brand: product.brand,
            status: "success",
            last_update: product.last_update,
            fullData: product,
          });
        } catch (error) {
          results.value.push({
            cip_code: cipCode,
            title: "-",
            brand: "-",
            status: "Non Trouvé",
            last_update: null,
            fullData: "-",
          });
        }
      })
    );
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

definePageMeta({
  middleware: ["auth"],
});
</script>
