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

                    <div class="flex flex-col sm:flex-row sm:items-center">
                      <pre
                        class="flex-1 text-sm text-gray-900 overflow-x-auto break-all"
                      >
curl -X GET \
  https://fournisseur-data.firebaseapp.com/api/v1/products/7630019903042 \
  -H 'Authorization: Bearer {{ apiStore.token || "votre_token" }}'
                    </pre
                      >
                      <button
                        @click="copyRequest"
                        class="mt-3 sm:mt-0 sm:ml-3 inline-flex items-center justify-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                      >
                        Copier
                      </button>
                    </div>

                    <!-- Ajout du lien vers la documentation -->
                    <div class="mt-4 flex justify-end">
                      <NuxtLink
                        to="/api-documentation"
                        class="text-sm text-indigo-600 hover:text-indigo-500 flex items-center"
                      >
                        Voir toute la documentation
                        <svg
                          class="ml-1 h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </NuxtLink>
                    </div>
                  </div>
                  <div>
                    <h4 class="text-sm font-medium text-gray-900">
                      Exemple de Réponse
                    </h4>
                    <pre class="mt-2 rounded-md bg-gray-50 p-4 overflow-x-auto">
                      {
  "codereferent": "7630019903042",
  "title": "GUM GUM Activital Sonic Brosse à Dents Souple",
  "brand": "GUM",
  "categorie": "Hygiène",
  "sous_categorie_1": null,
  "sous_categorie_2": null,
  "short_desc": "GUM Activital Sonic Brosse à Dents Souple : améliorez votre hygiène bucco-dentaire avec Pharma360. Prix bas, livraison rapide et service client irréprochable.",
  "long_desc": "GUM Activital Sonic Brosse à Dents Souple : améliorez votre hygiène bucco-dentaire avec Pharma360. Prix bas, livraison rapide et service client irréprochable.",
  "presentation": "GUM Activital Sonic Brosse à Dents Souple est disponible dès maintenant sur Pharma360 à prix bas. Plus d'informations sur ce produit très prochainement.",
  "cip7_code": "6077230",
  "images": [
    "https://storage.googleapis.com/pharma_images/7630019903042/7630019903042_0.jpeg?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=383194447870-compute%40developer.gserviceaccount.com%2F20250429%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=20250429T221132Z&X-Goog-Expires=3600&X-Goog-SignedHeaders=host&X-Goog-Signature=1cb58087e77c55f3d9f2fc0aeb8c262d52b511dc6b344004566e669729e7cc44dd85ad5aaebf7b512a5f14ad9afe3fe733766d9ad887b86b0b6a4a9b9cfaf87a4f554f9af5296b3e8343013f8aff5c8a3cb9b1be2ac3b2baaaea47e69c2508239fd9249c9999937a67d9e1456d21fa4db804b97be527118723d88a86263910b1f6ee4a902c63ea2f51923f8bac68de59001ef1b3ddd0a3b9334287c453d5d94fb7b2a114e7462dd1437b57bac12392fbcca776db4f06febeb442acfbef8350ae255022b5c04ef475ab1e46e0d4c7900e8f547caa811660ed850a4c2ae47e91fcb59f4b5781dc629977a4f6fc325b3fdf4599dd38b2ac71360124744490e54e76"
  ],
  "image_url": "https://storage.googleapis.com/pharma_images/7630019903042/7630019903042_0.jpeg?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=383194447870-compute%40developer.gserviceaccount.com%2F20250429%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=20250429T221132Z&X-Goog-Expires=3600&X-Goog-SignedHeaders=host&X-Goog-Signature=1cb58087e77c55f3d9f2fc0aeb8c262d52b511dc6b344004566e669729e7cc44dd85ad5aaebf7b512a5f14ad9afe3fe733766d9ad887b86b0b6a4a9b9cfaf87a4f554f9af5296b3e8343013f8aff5c8a3cb9b1be2ac3b2baaaea47e69c2508239fd9249c9999937a67d9e1456d21fa4db804b97be527118723d88a86263910b1f6ee4a902c63ea2f51923f8bac68de59001ef1b3ddd0a3b9334287c453d5d94fb7b2a114e7462dd1437b57bac12392fbcca776db4f06febeb442acfbef8350ae255022b5c04ef475ab1e46e0d4c7900e8f547caa811660ed850a4c2ae47e91fcb59f4b5781dc629977a4f6fc325b3fdf4599dd38b2ac71360124744490e54e76",
  "taxonomy_category": null,
  "taxonomy_sub_category2": null,
  "taxonomy_sub_category3": null,
  "usage": null,
  "nature_de_produit": null,
  "contre_indication": null,
  "conditionnement": null,
  "posologie": null,
  "substance_active": null,
  "label": null,
  "volume": null,
  "specificites": null,
  "age_minimum": null,
  "indication_contre_indication": null,
  "taxonomy_sub_category1": null,
  "sous_categorie_3": null,
  "composition": null,
  "nombre_d_unites": null,
  "last_update": "2025-04-28T11:31:31.000000Z"
}
</pre
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
                      avec propriété cip/code_cip/codereferent
                    </li>
                  </ul>
                </div>
              </div>

              <div class="mt-5">
                <!-- Uploader -->
                <div class="flex items-center justify-center w-full">
                  <label
                    @dragover.prevent="isDragging = true"
                    @dragleave.prevent="isDragging = false"
                    @drop.prevent="handleDrop"
                    class="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200"
                    :class="[
                      isDragging
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-300 bg-gray-50 hover:bg-gray-100',
                      loading ? 'animate-pulse' : '',
                    ]"
                  >
                    <div
                      class="flex flex-col items-center justify-center pt-5 pb-6"
                    >
                      <svg
                        class="w-8 h-8 mb-4 transition-colors duration-200"
                        :class="
                          isDragging ? 'text-indigo-600' : 'text-gray-500'
                        "
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
                      <p
                        class="mb-2 text-sm"
                        :class="
                          isDragging ? 'text-indigo-600' : 'text-gray-500'
                        "
                      >
                        <span class="font-semibold">Cliquez pour uploader</span>
                        ou glissez-déposez
                      </p>
                      <p
                        class="text-xs"
                        :class="
                          isDragging ? 'text-indigo-600' : 'text-gray-500'
                        "
                      >
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
                        :key="result.codereferent"
                      >
                        <td
                          class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900"
                        >
                          {{ result.codereferent }}
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

                          <!-- 3) Bloc affichant toutes les données, si c'est la ligne courante -->
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
import { ref, onMounted, watch } from "vue";
import { useApiStore } from "~/stores/api";
import { useToast } from "vue-toastification";
import { read, utils, type WorkBook } from "xlsx";
import Papa from "papaparse";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  writeBatch,
  doc,
  serverTimestamp,
  type DocumentData,
  orderBy,
  limit,
} from "firebase/firestore";
import { useAuthStore } from "~/stores/auth";

interface SearchResult {
  codereferent: string;
  title: string;
  brand: string;
  status: string;
  last_update: string | null;
  fullData: Record<string, unknown>;
  fromCache?: boolean;
}

interface ProcessedResult {
  results: SearchResult[];
  errors: string[];
}

const apiStore = useApiStore();
const authStore = useAuthStore();
const toast = useToast();

const currentTab = ref("token");
const loading = ref(false);
const results = ref<SearchResult[]>([]);

const tabs = [
  { id: "token", name: "Token API et Utilisation" },
  { id: "import", name: "Import de fichier" },
];

const expandedIndex = ref<number | null>(null);
const isDragging = ref(false);

// Fonction pour charger l'historique des recherches
const loadSearchHistory = async () => {
  try {
    loading.value = true;
    const db = getFirestore();
    const resultsRef = collection(db, "api_search_history");
    const userId = authStore.user?.uid;

    const q = query(
      resultsRef,
      where("userId", "==", userId),
      orderBy("searchDate", "desc")
    );

    const snapshot = await getDocs(q);
    const newResults = snapshot.docs.map((doc: DocumentData) => {
      const data = doc.data();
      return {
        codereferent: data.codereferent,
        title: data.title,
        brand: data.brand,
        status: data.status,
        last_update: data.last_update,
        fullData: data.fullData,
        fromCache: true,
      } as SearchResult;
    });

    // Fusionner les nouveaux résultats avec les résultats existants
    newResults.forEach(result => {
      if (!results.value.some(r => r.codereferent === result.codereferent)) {
        results.value.push(result);
      }
    });
  } catch (error) {
    console.error("Erreur lors du chargement de l'historique:", error);
    toast.error("Erreur lors du chargement de l'historique");
  } finally {
    loading.value = false;
  }
};

// Observer le changement d'onglet
watch(currentTab, async (newTab: string) => {
  if (newTab === "import" && results.value.length === 0) {
    await loadSearchHistory();
  }
});

onMounted(async () => {
  try {
    await Promise.all([
      apiStore.fetchUsage(),
      apiStore.fetchTokenHistory(),
      currentTab.value === "import" ? loadSearchHistory() : Promise.resolve(),
    ]);

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
  const target = event.target as HTMLInputElement;
  if (!target.files?.length) {
    toast.error("Aucun fichier sélectionné");
    return;
  }

  const file = target.files[0];
  loading.value = true;
  results.value = []; // Reset results

  try {
    let codereferents: string[] = [];

    if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
      const workbook = await readFileAsWorkbook(file);
      codereferents = extractCipCodes(workbook);
    } else if (file.name.endsWith(".csv")) {
      const text = await file.text();
      const parsed = Papa.parse(text, { header: true });
      codereferents = extractCipCodesFromParsedData(parsed.data);
    } else if (file.name.endsWith(".txt")) {
      const text = await file.text();
      codereferents = text
        .split(/[\n,]/)
        .map((code) => code.trim())
        .filter(Boolean);
    } else if (file.name.endsWith(".json")) {
      const text = await file.text();
      const data = JSON.parse(text);
      codereferents = extractCipCodesFromJson(data);
    }

    if (codereferents.length === 0) {
      toast.error("Aucun code CIP trouvé dans le fichier");
      return;
    }

    const processResult = await processCipCodes(codereferents);
    if (processResult.errors.length > 0) {
      processResult.errors.forEach((error) => toast.error(error));
    }

    const successCount = processResult.results.filter(
      (r) => r.status === "success"
    ).length;
    const errorCount = processResult.results.filter(
      (r) => r.status === "error"
    ).length;

    toast.info(
      `Traitement terminé: ${successCount} produits trouvés, ${errorCount} non trouvés`
    );
  } catch (error) {
    console.error("Erreur lors du traitement du fichier:", error);
    toast.error(
      error instanceof Error
        ? error.message
        : "Erreur lors du traitement du fichier"
    );
  } finally {
    loading.value = false;
  }
};

const readFileAsWorkbook = (file: File): Promise<WorkBook> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (r: ProgressEvent<FileReader>) => {
      try {
        const data = r.target?.result;
        const workbook = read(data, { type: "binary" });
        resolve(workbook);
      } catch (error) {
        reject(new Error("Erreur lors de la lecture du fichier"));
      }
    };
    reader.onerror = () =>
      reject(new Error("Erreur lors de la lecture du fichier"));
    reader.readAsBinaryString(file);
  });
};

const extractCipCodes = (workbook: WorkBook): string[] => {
  const codereferents: string[] = [];

  workbook.SheetNames.forEach((sheetName: string) => {
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = utils.sheet_to_json(worksheet) as unknown[];
    jsonData.forEach((row: unknown) => {
      let cipCode = null;
      const rowData = row as Record<string, unknown>;

      // Vérifier chaque colonne possible
      for (const column of [
        "cip",
        "code_cip",
        "codereferent",
        "code",
        "cip13",
        "cip7",
      ]) {
        if (rowData[column]) {
          cipCode = String(rowData[column]).trim();
          break;
        }
      }

      if (cipCode) {
        codereferents.push(cipCode);
      }
    });
  });

  return codereferents;
};

const extractCipCodesFromParsedData = (data: any[]): string[] => {
  const codereferents: string[] = [];
  for (const row of data) {
    for (const key of [
      "cip",
      "code_cip",
      "codereferent",
      "code",
      "cip13",
      "cip7",
    ]) {
      if (row[key]) {
        const code = String(row[key]).trim();
        if (code) codereferents.push(code);
        break;
      }
    }
  }
  return codereferents;
};

const extractCipCodesFromJson = (data: any): string[] => {
  const codereferents: string[] = [];

  if (Array.isArray(data)) {
    data.forEach((item) => {
      if (typeof item === "string") {
        codereferents.push(item.trim());
      } else if (typeof item === "object" && item !== null) {
        for (const key of [
          "cip",
          "code_cip",
          "codereferent",
          "code",
          "cip13",
          "cip7",
        ]) {
          if (item[key]) {
            codereferents.push(String(item[key]).trim());
            break;
          }
        }
      }
    });
  } else if (typeof data === "object" && data !== null) {
    for (const key of [
      "cip",
      "code_cip",
      "codereferent",
      "code",
      "cip13",
      "cip7",
    ]) {
      if (data[key]) {
        codereferents.push(String(data[key]).trim());
        break;
      }
    }
  }

  return codereferents;
};

const processCipCodes = async (
  codereferents: string[]
): Promise<ProcessedResult> => {
  try {
    const { cached, newCodes } = await getCachedResults(codereferents);

    // Ajouter les résultats en cache à results
    cached.forEach((result) => {
      if (!results.value.some(r => r.codereferent === result.codereferent)) {
      results.value.push(result);
      }
    });

    if (newCodes.length > 0) {
      // Appeler l'API pour chaque code CIP
      const newResults = await Promise.all(
        newCodes.map(async (cipCode) => {
          try {
            const response = await fetch(
              `https://fournisseur-data.firebaseapp.com/api/v1/products/${cipCode}`,
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${apiStore.token}`,
                  "Content-Type": "application/json",
                },
              }
            );

            if (!response.ok) {
              throw new Error("Erreur lors de la récupération du produit");
            }

            const product = await response.json();
            return {
              codereferent: cipCode,
              title: product.title,
              brand: product.brand,
              status: "success",
              last_update: product.last_update,
              fullData: product,
            } as SearchResult;
          } catch (error) {
            return {
              codereferent: cipCode,
              title: "-",
              brand: "-",
              status: "error",
              last_update: null,
              fullData: {},
            } as SearchResult;
          }
        })
      );

      await saveResults(newResults);
      // Ajouter uniquement les nouveaux résultats qui n'existent pas déjà
      newResults.forEach(result => {
        if (!results.value.some(r => r.codereferent === result.codereferent)) {
          results.value.push(result);
        }
      });
    }

    return {
      results: results.value,
      errors: [],
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Une erreur est survenue";
    return {
      results: [],
      errors: [errorMessage],
    };
  }
};

const getCachedResults = async (codereferents: string[]) => {
  const db = getFirestore();
  const resultsRef = collection(db, "api_search_history");
  const userId = authStore.user?.uid;

  const cachedResults = new Map<string, SearchResult>();
  const newCipCodes = new Set(codereferents);

  // Récupérer les résultats existants
  const q = query(
    resultsRef,
    where("userId", "==", userId),
    where("codereferent", "in", codereferents)
  );

  const snapshot = await getDocs(q);
  snapshot.forEach((doc: DocumentData) => {
    const data = doc.data();
    cachedResults.set(data.codereferent, {
      ...data,
      fromCache: true,
    });
    newCipCodes.delete(data.codereferent);
  });

  return {
    cached: Array.from(cachedResults.values()),
    newCodes: Array.from(newCipCodes),
  };
};

const saveResults = async (newResults: SearchResult[]) => {
  const db = getFirestore();
  const resultsRef = collection(db, "api_search_history");
  const userId = authStore.user?.uid;

  const batch = writeBatch(db);

  newResults.forEach((result) => {
    if (result.status === "success") {
      const docRef = doc(resultsRef);
      batch.set(docRef, {
        userId,
        codereferent: result.codereferent,
        title: result.title,
        brand: result.brand,
        status: result.status,
        last_update: result.last_update,
        fullData: result.fullData,
        searchDate: serverTimestamp(),
      });
    }
  });

  await batch.commit();
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

const copyToClipboard = (content: string) => {
  navigator.clipboard.writeText(content);
  toast.info("Contenu copié au presse-papier");
};

const handleDrop = async (event: DragEvent) => {
  isDragging.value = false;
  const files = event.dataTransfer?.files;
  if (!files?.length) {
    toast.error("Aucun fichier déposé");
    return;
  }

  const file = files[0];
  const input = event.target as HTMLInputElement;
  if (input.type === "file") {
    input.files = files;
  }
  await handleFileUpload({ target: { files: [file] } } as unknown as Event);
};

definePageMeta({
  middleware: ["auth-verified"],
});
</script>
