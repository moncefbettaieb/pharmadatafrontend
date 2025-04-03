<template>
    <div class="min-h-screen bg-gray-50 py-12">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="bg-white shadow sm:rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h1 class="text-3xl font-bold text-gray-900 mb-8">Protection des données personnelles</h1>
    
            <div class="prose max-w-none">
              <!-- Introduction -->
              <section class="mb-12">
                <p class="text-gray-600">
                  Dernière mise à jour : {{ new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }) }}
                </p>
                <p class="text-gray-600 mt-4">
                  La protection de vos données personnelles est une priorité pour PharmaData. Cette politique de confidentialité 
                  décrit comment nous collectons, utilisons et protégeons vos informations personnelles conformément au 
                  Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés.
                </p>
              </section>
    
              <!-- Collecte des données -->
              <section class="mb-12" id="collecte">
                <h2 class="text-2xl font-semibold text-gray-900 mb-4">1. Collecte des données</h2>
                <div class="bg-gray-50 rounded-lg p-6">
                  <h3 class="text-xl font-medium text-gray-900 mb-3">1.1 Données collectées</h3>
                  <p class="mb-4">Nous collectons les données suivantes :</p>
                  <ul class="list-disc pl-6 space-y-2 text-gray-600">
                    <li><strong>Données d'identification :</strong> nom, prénom, adresse email</li>
                    <li><strong>Données de connexion :</strong> identifiants, tokens d'API</li>
                    <li><strong>Données d'utilisation :</strong> statistiques d'utilisation de l'API, historique des requêtes</li>
                    <li><strong>Données de facturation :</strong> coordonnées de facturation, historique des transactions</li>
                  </ul>
    
                  <h3 class="text-xl font-medium text-gray-900 mt-6 mb-3">1.2 Méthodes de collecte</h3>
                  <p class="text-gray-600">Les données sont collectées via :</p>
                  <ul class="list-disc pl-6 space-y-2 text-gray-600">
                    <li>Formulaires d'inscription et de contact</li>
                    <li>Utilisation de notre API</li>
                    <li>Cookies et technologies similaires</li>
                    <li>Interactions avec notre service client</li>
                  </ul>
                </div>
              </section>
    
              <!-- Utilisation des données -->
              <section class="mb-12" id="utilisation">
                <h2 class="text-2xl font-semibold text-gray-900 mb-4">2. Utilisation des données</h2>
                <div class="bg-gray-50 rounded-lg p-6">
                  <p class="mb-4">Vos données sont utilisées pour :</p>
                  <ul class="list-disc pl-6 space-y-2 text-gray-600">
                    <li>Fournir et gérer nos services</li>
                    <li>Authentifier les utilisateurs et sécuriser l'accès à l'API</li>
                    <li>Traiter les paiements et gérer la facturation</li>
                    <li>Communiquer avec vous concernant votre compte et nos services</li>
                    <li>Améliorer nos services et développer de nouvelles fonctionnalités</li>
                    <li>Respecter nos obligations légales et réglementaires</li>
                  </ul>
                </div>
              </section>
    
              <!-- Base légale -->
              <section class="mb-12" id="base-legale">
                <h2 class="text-2xl font-semibold text-gray-900 mb-4">3. Base légale du traitement</h2>
                <div class="bg-gray-50 rounded-lg p-6">
                  <p class="mb-4">Nous traitons vos données sur les bases légales suivantes :</p>
                  <ul class="list-disc pl-6 space-y-2 text-gray-600">
                    <li><strong>Exécution du contrat :</strong> pour fournir nos services</li>
                    <li><strong>Obligation légale :</strong> pour respecter la législation applicable</li>
                    <li><strong>Intérêt légitime :</strong> pour améliorer nos services et assurer leur sécurité</li>
                    <li><strong>Consentement :</strong> pour l'envoi de communications marketing (si applicable)</li>
                  </ul>
                </div>
              </section>
    
              <!-- Conservation des données -->
              <section class="mb-12" id="conservation">
                <h2 class="text-2xl font-semibold text-gray-900 mb-4">4. Conservation des données</h2>
                <div class="bg-gray-50 rounded-lg p-6">
                  <p class="mb-4">Nous conservons vos données :</p>
                  <ul class="list-disc pl-6 space-y-2 text-gray-600">
                    <li>Données de compte : pendant la durée de votre inscription plus 3 ans après la dernière utilisation</li>
                    <li>Données de facturation : 10 ans conformément aux obligations légales</li>
                    <li>Logs d'API : 12 mois glissants</li>
                    <li>Données de support : 3 ans après la dernière interaction</li>
                  </ul>
                </div>
              </section>
    
              <!-- Cookies -->
              <section class="mb-12" id="cookies">
                <h2 class="text-2xl font-semibold text-gray-900 mb-4">5. Cookies et technologies similaires</h2>
                <div class="bg-gray-50 rounded-lg p-6">
                  <h3 class="text-xl font-medium text-gray-900 mb-3">5.1 Types de cookies utilisés</h3>
                  <ul class="list-disc pl-6 space-y-2 text-gray-600">
                    <li><strong>Cookies essentiels :</strong> nécessaires au fonctionnement du site</li>
                    <li><strong>Cookies d'authentification :</strong> pour maintenir votre session</li>
                    <li><strong>Cookies analytiques :</strong> pour améliorer nos services</li>
                  </ul>
    
                  <h3 class="text-xl font-medium text-gray-900 mt-6 mb-3">5.2 Gestion des cookies</h3>
                  <p class="text-gray-600">
                    Vous pouvez à tout moment modifier vos préférences en matière de cookies via les paramètres de votre navigateur.
                  </p>
                </div>
              </section>
    
              <!-- Partage des données -->
              <section class="mb-12" id="partage">
                <h2 class="text-2xl font-semibold text-gray-900 mb-4">6. Partage des données</h2>
                <div class="bg-gray-50 rounded-lg p-6">
                  <p class="mb-4">Nous partageons vos données uniquement avec :</p>
                  <ul class="list-disc pl-6 space-y-2 text-gray-600">
                    <li>Nos sous-traitants techniques (hébergement, paiement)</li>
                    <li>Les autorités compétentes sur demande légale</li>
                  </ul>
                  <p class="mt-4 text-gray-600">
                    Nous ne vendons jamais vos données personnelles à des tiers.
                  </p>
                </div>
              </section>
    
              <!-- Sécurité -->
              <section class="mb-12" id="securite">
                <h2 class="text-2xl font-semibold text-gray-900 mb-4">7. Sécurité des données</h2>
                <div class="bg-gray-50 rounded-lg p-6">
                  <p class="mb-4">Nous mettons en œuvre les mesures suivantes :</p>
                  <ul class="list-disc pl-6 space-y-2 text-gray-600">
                    <li>Chiffrement des données en transit et au repos</li>
                    <li>Authentification forte pour l'accès aux services</li>
                    <li>Surveillance continue des systèmes</li>
                    <li>Formation régulière de notre personnel</li>
                    <li>Audits de sécurité périodiques</li>
                  </ul>
                </div>
              </section>
    
              <!-- Vos droits -->
              <section class="mb-12" id="droits">
                <h2 class="text-2xl font-semibold text-gray-900 mb-4">8. Vos droits</h2>
                <div class="bg-gray-50 rounded-lg p-6">
                  <p class="mb-4">Conformément au RGPD, vous disposez des droits suivants :</p>
                  <ul class="list-disc pl-6 space-y-2 text-gray-600">
                    <li>Droit d'accès à vos données</li>
                    <li>Droit de rectification</li>
                    <li>Droit à l'effacement ("droit à l'oubli")</li>
                    <li>Droit à la limitation du traitement</li>
                    <li>Droit à la portabilité des données</li>
                    <li>Droit d'opposition</li>
                  </ul>
                  <p class="mt-4 text-gray-600">
                    Pour exercer ces droits, contactez notre DPO à support@pharmadata.fr
                  </p>
                </div>
              </section>
    
              <!-- Contact -->
              <section class="mb-12" id="contact">
                <h2 class="text-2xl font-semibold text-gray-900 mb-4">9. Contact</h2>
                <div class="bg-gray-50 rounded-lg p-6">
                  <p class="mb-4">Pour toute question concernant vos données personnelles :</p>
                  <ul class="list-none space-y-2 text-gray-600">
                    <li><strong>DPO :</strong> Moncef Bettaieb</li>
                    <li><strong>Email :</strong> support@pharmadata.fr</li>
                    <li><strong>Adresse :</strong> GCD Consulting - DPO, 5 Place de Rungis, 75013 Paris</li>
                  </ul>
                  <p class="mt-4 text-gray-600">
                    Vous pouvez également déposer une réclamation auprès de la CNIL : www.cnil.fr
                  </p>
                </div>
              </section>
    
              <!-- Modifications -->
              <section>
                <h2 class="text-2xl font-semibold text-gray-900 mb-4">10. Modifications de la politique</h2>
                <div class="bg-gray-50 rounded-lg p-6">
                  <p class="text-gray-600">
                    Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. 
                    Les modifications prennent effet dès leur publication sur le site. Nous vous informerons 
                    des changements importants par email.
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
    </template>