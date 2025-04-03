<template>
    <div class="min-h-screen bg-gray-50 py-12">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="bg-white shadow sm:rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h1 class="text-3xl font-bold text-gray-900 mb-8">Guide d'ajout de fiches produits</h1>
    
            <!-- Introduction -->
            <div class="prose max-w-none">
              <p class="text-gray-600 mb-8">
                Ce guide vous aidera à ajouter correctement des fiches produits sur notre plateforme. Veuillez suivre attentivement ces instructions pour garantir la qualité et l'uniformité des données.
              </p>
    
              <!-- Règles générales -->
              <section class="mb-12">
                <h2 class="text-2xl font-semibold text-gray-900 mb-4">Règles générales</h2>
                <ul class="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Toutes les informations doivent être vérifiées et exactes</li>
                  <li>Les champs marqués d'un astérisque (*) sont obligatoires</li>
                  <li>Utilisez un langage professionnel et clair</li>
                  <li>Évitez les abréviations non standard</li>
                  <li>Respectez les formats demandés pour chaque champ</li>
                </ul>
              </section>
    
              <!-- Instructions par section -->
              <section class="mb-12">
                <h2 class="text-2xl font-semibold text-gray-900 mb-4">Instructions par section</h2>
    
                <!-- Informations de base -->
                <div class="mb-8">
                  <h3 class="text-xl font-medium text-gray-900 mb-3">Informations de base</h3>
                  <div class="bg-gray-50 rounded-lg p-4">
                    <ul class="space-y-3 text-gray-600">
                      <li><strong>Code CIP* :</strong> Format à 13 chiffres, sans espaces ni tirets</li>
                      <li><strong>Marque* :</strong> Nom officiel de la marque, en majuscules</li>
                      <li><strong>Titre du produit* :</strong> Nom complet du produit incluant le dosage si applicable</li>
                    </ul>
                  </div>
                </div>
    
                <!-- Catégorisation -->
                <div class="mb-8">
                  <h3 class="text-xl font-medium text-gray-900 mb-3">Catégorisation</h3>
                  <div class="bg-gray-50 rounded-lg p-4">
                    <ul class="space-y-3 text-gray-600">
                      <li><strong>Catégorie* :</strong> Catégorie principale du produit</li>
                      <li><strong>Sous-catégories :</strong> Utilisez la hiérarchie existante des catégories</li>
                    </ul>
                  </div>
                </div>
    
                <!-- Description -->
                <div class="mb-8">
                  <h3 class="text-xl font-medium text-gray-900 mb-3">Description</h3>
                  <div class="bg-gray-50 rounded-lg p-4">
                    <ul class="space-y-3 text-gray-600">
                      <li><strong>Description courte* :</strong> 
                        <ul class="list-disc pl-6 mt-2">
                          <li>Maximum 200 caractères</li>
                          <li>Doit résumer les principales caractéristiques</li>
                          <li>Évitez les répétitions avec le titre</li>
                        </ul>
                      </li>
                      <li><strong>Description détaillée :</strong>
                        <ul class="list-disc pl-6 mt-2">
                          <li>Description complète du produit</li>
                          <li>Incluez les bénéfices et utilisations principales</li>
                          <li>Structurez le texte avec des paragraphes</li>
                        </ul>
                      </li>
                    </ul>
                  </div>
                </div>
    
                <!-- Informations techniques -->
                <div class="mb-8">
                  <h3 class="text-xl font-medium text-gray-900 mb-3">Informations techniques</h3>
                  <div class="bg-gray-50 rounded-lg p-4">
                    <ul class="space-y-3 text-gray-600">
                      <li><strong>Composition :</strong> Liste détaillée des ingrédients actifs et leurs dosages</li>
                      <li><strong>Posologie :</strong> Instructions précises d'utilisation</li>
                      <li><strong>Contre-indications :</strong> Toutes les contre-indications connues</li>
                      <li><strong>Âge minimum :</strong> Spécifiez "Adulte" ou l'âge minimum en années</li>
                      <li><strong>Nombre d'unités :</strong> Format "X unités" ou volume/poids selon le cas</li>
                    </ul>
                  </div>
                </div>
    
                <!-- Images -->
                <div class="mb-8">
                  <h3 class="text-xl font-medium text-gray-900 mb-3">Images</h3>
                  <div class="bg-gray-50 rounded-lg p-4">
                    <ul class="space-y-3 text-gray-600">
                      <li><strong>Format :</strong> JPG ou PNG uniquement</li>
                      <li><strong>Taille :</strong> Maximum 10MB par image</li>
                      <li><strong>Qualité :</strong> Minimum 1200px sur le plus grand côté</li>
                      <li><strong>Contenu :</strong>
                        <ul class="list-disc pl-6 mt-2">
                          <li>Photo principale du produit sur fond blanc</li>
                          <li>Photos additionnelles montrant différents angles</li>
                          <li>Photos de l'emballage si pertinent</li>
                        </ul>
                      </li>
                    </ul>
                  </div>
                </div>
              </section>
    
              <!-- Bonnes pratiques -->
              <section class="mb-12">
                <h2 class="text-2xl font-semibold text-gray-900 mb-4">Bonnes pratiques</h2>
                <div class="bg-gray-50 rounded-lg p-4">
                  <ul class="space-y-3 text-gray-600">
                    <li>Vérifiez toutes les informations avant soumission</li>
                    <li>Utilisez un langage professionnel et objectif</li>
                    <li>Évitez le contenu promotionnel ou marketing</li>
                    <li>Respectez les droits d'auteur pour les images</li>
                    <li>Mettez à jour les informations dès que nécessaire</li>
                  </ul>
                </div>
              </section>
    
              <!-- Bouton d'action -->
              <div class="mt-8 flex justify-center">
                <NuxtLink
                  to="/add-cip"
                  class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Ajouter une fiche produit
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </template>