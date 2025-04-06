<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="bg-white shadow sm:rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h1 class="text-3xl font-bold text-gray-900 mb-8">
            Documentation API
          </h1>

          <!-- Introduction -->
          <div class="prose max-w-none mb-12">
            <p class="text-gray-600">
              Notre API RESTful vous permet d'accéder à notre base de données de
              produits pharmaceutiques. Cette documentation vous guidera à
              travers les différents endpoints disponibles et leur utilisation.
            </p>
          </div>

          <!-- Authentication -->
          <section class="mb-12">
            <h2 class="text-2xl font-semibold text-gray-900 mb-4">
              Authentification
            </h2>
            <div class="bg-gray-50 rounded-lg p-6">
              <p class="text-gray-600 mb-4">
                Toutes les requêtes API doivent inclure votre token d'API dans
                l'en-tête HTTP :
              </p>
              <div class="bg-gray-800 rounded-md p-4 mb-4">
                <code class="text-green-400">
                  Authorization: Bearer votre_token_api
                </code>
              </div>
              <p class="text-gray-600">
                Pour obtenir votre token API, connectez-vous à votre compte et
                visitez la section
                <NuxtLink
                  to="/account/api-tokens"
                  class="text-indigo-600 hover:text-indigo-500"
                  >Tokens API</NuxtLink
                >.
              </p>
            </div>
          </section>

          <!-- Endpoints -->
          <section class="mb-12">
            <h2 class="text-2xl font-semibold text-gray-900 mb-4">Endpoints</h2>

            <!-- Get Product by CIP -->
            <div class="mb-8">
              <h3 class="text-xl font-medium text-gray-900 mb-3">
                Récupérer un produit par CIP
              </h3>
              <div class="bg-gray-50 rounded-lg p-6">
                <div class="flex items-center space-x-2 mb-4">
                  <span
                    class="px-2 py-1 bg-blue-500 text-white rounded-md text-sm font-medium"
                    >GET</span
                  >
                  <code class="text-sm">/api/products/{cip_code}</code>
                </div>

                <h4 class="font-medium text-gray-900 mb-2">Paramètres</h4>
                <table class="min-w-full divide-y divide-gray-200 mb-4">
                  <thead class="bg-gray-100">
                    <tr>
                      <th
                        class="px-4 py-2 text-left text-sm font-medium text-gray-900"
                      >
                        Paramètre
                      </th>
                      <th
                        class="px-4 py-2 text-left text-sm font-medium text-gray-900"
                      >
                        Type
                      </th>
                      <th
                        class="px-4 py-2 text-left text-sm font-medium text-gray-900"
                      >
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200">
                    <tr>
                      <td class="px-4 py-2 text-sm text-gray-600">cip_code</td>
                      <td class="px-4 py-2 text-sm text-gray-600">string</td>
                      <td class="px-4 py-2 text-sm text-gray-600">
                        Code CIP du produit
                      </td>
                    </tr>
                  </tbody>
                </table>

                <h4 class="font-medium text-gray-900 mb-2">
                  Exemple de requête
                </h4>
                <div class="bg-gray-800 rounded-md p-4 mb-4">
                  <code class="text-green-400">
                    curl -X GET \<br />
                    &nbsp;&nbsp;https://fournisseur-data.firebaseapp.com/api/v1/products/1234567890123
                    \<br />
                    &nbsp;&nbsp;-H 'Authorization: Bearer votre_token_api'
                  </code>
                </div>

                <h4 class="font-medium text-gray-900 mb-2">
                  Exemple de réponse
                </h4>
                <div class="bg-gray-800 rounded-md p-4">
                  <pre class="text-green-400">
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

            <!-- Search Products -->
            <div class="mb-8">
              <h3 class="text-xl font-medium text-gray-900 mb-3">
                Rechercher des produits
              </h3>
              <div class="bg-gray-50 rounded-lg p-6">
                <div class="flex items-center space-x-2 mb-4">
                  <span
                    class="px-2 py-1 bg-blue-500 text-white rounded-md text-sm font-medium"
                    >GET</span
                  >
                  <code class="text-sm">/api/products</code>
                </div>

                <h4 class="font-medium text-gray-900 mb-2">
                  Paramètres de requête
                </h4>
                <table class="min-w-full divide-y divide-gray-200 mb-4">
                  <thead class="bg-gray-100">
                    <tr>
                      <th
                        class="px-4 py-2 text-left text-sm font-medium text-gray-900"
                      >
                        Paramètre
                      </th>
                      <th
                        class="px-4 py-2 text-left text-sm font-medium text-gray-900"
                      >
                        Type
                      </th>
                      <th
                        class="px-4 py-2 text-left text-sm font-medium text-gray-900"
                      >
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200">
                    <tr>
                      <td class="px-4 py-2 text-sm text-gray-600">page</td>
                      <td class="px-4 py-2 text-sm text-gray-600">number</td>
                      <td class="px-4 py-2 text-sm text-gray-600">
                        Numéro de page (défaut: 1)
                      </td>
                    </tr>
                    <tr>
                      <td class="px-4 py-2 text-sm text-gray-600">limit</td>
                      <td class="px-4 py-2 text-sm text-gray-600">number</td>
                      <td class="px-4 py-2 text-sm text-gray-600">
                        Nombre de résultats par page (défaut: 20)
                      </td>
                    </tr>
                    <tr>
                      <td class="px-4 py-2 text-sm text-gray-600">category</td>
                      <td class="px-4 py-2 text-sm text-gray-600">string</td>
                      <td class="px-4 py-2 text-sm text-gray-600">
                        Filtrer par catégorie
                      </td>
                    </tr>
                    <tr>
                      <td class="px-4 py-2 text-sm text-gray-600">brand</td>
                      <td class="px-4 py-2 text-sm text-gray-600">string</td>
                      <td class="px-4 py-2 text-sm text-gray-600">
                        Filtrer par marque
                      </td>
                    </tr>
                  </tbody>
                </table>

                <h4 class="font-medium text-gray-900 mb-2">
                  Exemple de requête
                </h4>
                <div class="bg-gray-800 rounded-md p-4 mb-4">
                  <code class="text-green-400">
                    curl -X GET \<br />
                    &nbsp;&nbsp;'https://fournisseur-data.firebaseapp.com/api/v1/products?page=1&limit=20&category=Médicaments'
                    \<br />
                    &nbsp;&nbsp;-H 'Authorization: Bearer votre_token_api'
                  </code>
                </div>
              </div>
            </div>
          </section>

          <!-- Rate Limits -->
          <section class="mb-12">
            <h2 class="text-2xl font-semibold text-gray-900 mb-4">
              Limites d'utilisation
            </h2>
            <div class="bg-gray-50 rounded-lg p-6">
              <p class="text-gray-600 mb-4">
                Les limites d'utilisation dépendent de votre plan d'abonnement :
              </p>
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-100">
                  <tr>
                    <th
                      class="px-4 py-2 text-left text-sm font-medium text-gray-900"
                    >
                      Plan
                    </th>
                    <th
                      class="px-4 py-2 text-left text-sm font-medium text-gray-900"
                    >
                      Requêtes/mois
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr>
                    <td class="px-4 py-2 text-sm text-gray-600">Gratuit</td>
                    <td class="px-4 py-2 text-sm text-gray-600">100</td>
                  </tr>
                  <tr>
                    <td class="px-4 py-2 text-sm text-gray-600">Basic</td>
                    <td class="px-4 py-2 text-sm text-gray-600">1,000</td>
                  </tr>
                  <tr>
                    <td class="px-4 py-2 text-sm text-gray-600">Pro</td>
                    <td class="px-4 py-2 text-sm text-gray-600">5,000</td>
                  </tr>
                  <tr>
                    <td class="px-4 py-2 text-sm text-gray-600">Enterprise</td>
                    <td class="px-4 py-2 text-sm text-gray-600">20,000</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <!-- Error Handling -->
          <section class="mb-12">
            <h2 class="text-2xl font-semibold text-gray-900 mb-4">
              Gestion des erreurs
            </h2>
            <div class="bg-gray-50 rounded-lg p-6">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-100">
                  <tr>
                    <th
                      class="px-4 py-2 text-left text-sm font-medium text-gray-900"
                    >
                      Code
                    </th>
                    <th
                      class="px-4 py-2 text-left text-sm font-medium text-gray-900"
                    >
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr>
                    <td class="px-4 py-2 text-sm text-gray-600">400</td>
                    <td class="px-4 py-2 text-sm text-gray-600">
                      Requête invalide
                    </td>
                  </tr>
                  <tr>
                    <td class="px-4 py-2 text-sm text-gray-600">401</td>
                    <td class="px-4 py-2 text-sm text-gray-600">
                      Non authentifié
                    </td>
                  </tr>
                  <tr>
                    <td class="px-4 py-2 text-sm text-gray-600">403</td>
                    <td class="px-4 py-2 text-sm text-gray-600">
                      Accès refusé
                    </td>
                  </tr>
                  <tr>
                    <td class="px-4 py-2 text-sm text-gray-600">404</td>
                    <td class="px-4 py-2 text-sm text-gray-600">
                      Ressource non trouvée
                    </td>
                  </tr>
                  <tr>
                    <td class="px-4 py-2 text-sm text-gray-600">429</td>
                    <td class="px-4 py-2 text-sm text-gray-600">
                      Limite de requêtes dépassée
                    </td>
                  </tr>
                  <tr>
                    <td class="px-4 py-2 text-sm text-gray-600">500</td>
                    <td class="px-4 py-2 text-sm text-gray-600">
                      Erreur serveur
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <!-- Support -->
          <section>
            <h2 class="text-2xl font-semibold text-gray-900 mb-4">Support</h2>
            <div class="bg-gray-50 rounded-lg p-6">
              <p class="text-gray-600 mb-4">
                Si vous rencontrez des difficultés ou avez des questions,
                n'hésitez pas à :
              </p>
              <ul class="list-disc pl-6 space-y-2 text-gray-600">
                <li>
                  Consulter notre
                  <NuxtLink
                    to="/faq"
                    class="text-indigo-600 hover:text-indigo-500"
                    >FAQ</NuxtLink
                  >
                </li>
                <li>
                  Nous contacter via la page
                  <NuxtLink
                    to="/contact"
                    class="text-indigo-600 hover:text-indigo-500"
                    >Contact</NuxtLink
                  >
                </li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>
