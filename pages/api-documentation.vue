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
                  <code class="text-sm">/api/products/{codereferent}</code>
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
                      <td class="px-4 py-2 text-sm text-gray-600">
                        codereferent
                      </td>
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

            <!-- Get Brands -->
            <div class="mb-8">
              <h3 class="text-xl font-medium text-gray-900 mb-3">
                Récupérer la liste des marques
              </h3>
              <div class="bg-gray-50 rounded-lg p-6">
                <div class="flex items-center space-x-2 mb-4">
                  <span
                    class="px-2 py-1 bg-blue-500 text-white rounded-md text-sm font-medium"
                    >GET</span
                  >
                  <code class="text-sm">/api/v1/brands</code>
                </div>

                <h4 class="font-medium text-gray-900 mb-2">
                  Exemple de requête
                </h4>
                <div class="bg-gray-800 rounded-md p-4 mb-4">
                  <code class="text-green-400">
                    curl -X GET \<br />
                    &nbsp;&nbsp;https://fournisseur-data.firebaseapp.com/api/v1/brands
                    \<br />
                    &nbsp;&nbsp;-H 'Authorization: Bearer votre_token_api'
                  </code>
                </div>

                <h4 class="font-medium text-gray-900 mb-2">
                  Exemple de réponse
                </h4>
                <div class="bg-gray-800 rounded-md p-4">
                  <pre class="text-green-400">
[
  "PHARMA DEVELOPPEMENT",
  "SANOFI",
  "BAYER",
  "PFIZER",
  "JOHNSON & JOHNSON"
]</pre
                  >
                </div>
              </div>
            </div>

            <!-- Get Categories -->
            <div class="mb-8">
              <h3 class="text-xl font-medium text-gray-900 mb-3">
                Récupérer la liste des catégories
              </h3>
              <div class="bg-gray-50 rounded-lg p-6">
                <div class="flex items-center space-x-2 mb-4">
                  <span
                    class="px-2 py-1 bg-blue-500 text-white rounded-md text-sm font-medium"
                    >GET</span
                  >
                  <code class="text-sm">/api/v1/categories</code>
                </div>

                <h4 class="font-medium text-gray-900 mb-2">
                  Exemple de requête
                </h4>
                <div class="bg-gray-800 rounded-md p-4 mb-4">
                  <code class="text-green-400">
                    curl -X GET \<br />
                    &nbsp;&nbsp;https://fournisseur-data.firebaseapp.com/api/v1/categories
                    \<br />
                    &nbsp;&nbsp;-H 'Authorization: Bearer votre_token_api'
                  </code>
                </div>

                <h4 class="font-medium text-gray-900 mb-2">
                  Exemple de réponse
                </h4>
                <div class="bg-gray-800 rounded-md p-4">
                  <pre class="text-green-400">
[
  "Médicaments",
  "Parapharmacie",
  "Hygiène",
  "Premiers soins",
  "Materiel médical"
]</pre
                  >
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
                      Fiches Produits/mois
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
