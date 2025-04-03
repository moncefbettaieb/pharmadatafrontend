<template>
    <div class="min-h-screen bg-gray-50 py-12">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="bg-white shadow sm:rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h1 class="text-3xl font-bold text-gray-900 mb-8">Questions Fréquentes</h1>
    
            <!-- Barre de recherche -->
            <div class="mb-8">
              <div class="relative">
                <input
                  type="text"
                  v-model="searchQuery"
                  placeholder="Rechercher une question..."
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pl-10 sm:text-sm"
                />
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
    
            <!-- Navigation des catégories -->
            <div class="mb-8 flex flex-wrap gap-2">
              <button
                v-for="category in categories"
                :key="category.id"
                @click="selectedCategory = category.id"
                class="px-4 py-2 rounded-md text-sm font-medium transition-colors"
                :class="selectedCategory === category.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
              >
                {{ category.name }}
              </button>
            </div>
    
            <!-- Questions et réponses -->
            <div class="space-y-8">
              <div v-for="category in filteredCategories" :key="category.id">
                <h2 class="text-2xl font-semibold text-gray-900 mb-6">{{ category.name }}</h2>
                <div class="space-y-4">
                  <div
                    v-for="question in category.questions"
                    :key="question.id"
                    class="border border-gray-200 rounded-lg"
                  >
                    <button
                      @click="toggleQuestion(question.id)"
                      class="w-full text-left px-4 py-3 flex justify-between items-center hover:bg-gray-50"
                    >
                      <span class="font-medium text-gray-900">{{ question.question }}</span>
                      <svg
                        class="h-5 w-5 text-gray-500 transform transition-transform"
                        :class="openQuestions.includes(question.id) ? 'rotate-180' : ''"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                      </svg>
                    </button>
                    <div
                      v-show="openQuestions.includes(question.id)"
                      class="px-4 py-3 border-t border-gray-200 bg-gray-50"
                    >
                      <p class="text-gray-600" v-html="question.answer"></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
    
            <!-- Pas de résultats -->
            <div v-if="filteredCategories.length === 0" class="text-center py-12">
              <p class="text-gray-500">Aucune question ne correspond à votre recherche.</p>
            </div>
    
            <!-- Contact support -->
            <div class="mt-12 border-t border-gray-200 pt-8">
              <p class="text-center text-gray-600">
                Vous ne trouvez pas la réponse à votre question ?
                <NuxtLink to="/contact" class="text-indigo-600 hover:text-indigo-500 font-medium">
                  Contactez notre support
                </NuxtLink>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </template>
    
    <script setup>
    const searchQuery = ref('')
    const selectedCategory = ref('general')
    const openQuestions = ref([])
    
    // Catégories et questions
    const categories = [
      {
        id: 'general',
        name: 'Général',
        questions: [
          {
            id: 'what-is',
            question: 'Qu\'est-ce que PharmaData ?',
            answer: 'PharmaData est une plateforme de données pharmaceutiques professionnelle qui fournit un accès à une base de données complète de produits pharmaceutiques et parapharmaceutiques. Nous proposons des fiches produits détaillées et une API pour intégrer ces données dans vos applications.'
          },
          {
            id: 'who-for',
            question: 'À qui s\'adresse ce service ?',
            answer: 'Notre service s\'adresse aux professionnels de santé, aux pharmacies, aux développeurs d\'applications de santé et à toute entreprise ayant besoin d\'accéder à des données pharmaceutiques fiables et à jour.'
          }
        ]
      },
      {
        id: 'products',
        name: 'Fiches Produits',
        questions: [
          {
            id: 'product-content',
            question: 'Que contiennent les fiches produits ?',
            answer: 'Chaque fiche produit contient des informations détaillées incluant : le code CIP, la marque, la description, la composition, la posologie, les contre-indications, et les images du produit.'
          },
          {
            id: 'product-price',
            question: 'Combien coûte une fiche produit ?',
            answer: 'Chaque fiche produit coûte 0,70€. Vous pouvez acheter les fiches individuellement ou accéder à l\'ensemble des données via notre API avec un abonnement mensuel.'
          }
        ]
      },
      {
        id: 'api',
        name: 'API',
        questions: [
          {
            id: 'api-access',
            question: 'Comment accéder à l\'API ?',
            answer: 'Pour accéder à l\'API, vous devez d\'abord créer un compte et choisir un plan d\'abonnement. Vous recevrez ensuite un token d\'API que vous pourrez utiliser pour authentifier vos requêtes.'
          },
          {
            id: 'api-limits',
            question: 'Quelles sont les limites de l\'API ?',
            answer: 'Les limites dépendent de votre plan d\'abonnement :<br>- Gratuit : 100 requêtes/mois<br>- Basic : 1 000 requêtes/mois<br>- Pro : 5 000 requêtes/mois<br>- Enterprise : 20 000 requêtes/mois'
          }
        ]
      },
      {
        id: 'billing',
        name: 'Facturation',
        questions: [
          {
            id: 'payment-methods',
            question: 'Quels moyens de paiement acceptez-vous ?',
            answer: 'Nous acceptons les cartes de crédit (Visa, Mastercard) via notre partenaire de paiement sécurisé Stripe.'
          },
          {
            id: 'subscription-cancel',
            question: 'Comment annuler mon abonnement ?',
            answer: 'Vous pouvez annuler votre abonnement à tout moment depuis votre espace client. L\'annulation prendra effet à la fin de la période de facturation en cours.'
          }
        ]
      },
      {
        id: 'technical',
        name: 'Support Technique',
        questions: [
          {
            id: 'api-docs',
            question: 'Où trouver la documentation de l\'API ?',
            answer: 'La documentation complète de l\'API est disponible dans la section <a href="/api-documentation" class="text-indigo-600 hover:text-indigo-500">Documentation API</a>.'
          },
          {
            id: 'technical-support',
            question: 'Comment obtenir de l\'aide technique ?',
            answer: 'Notre équipe de support technique est disponible par email et répond généralement dans les 24 heures ouvrées. Vous pouvez également consulter notre documentation technique détaillée.'
          }
        ]
      }
    ]
    
    // Filtrer les catégories et questions en fonction de la recherche
    const filteredCategories = computed(() => {
      if (!searchQuery.value && selectedCategory === 'all') return categories
      
      return categories
        .filter(category => 
          selectedCategory.value === 'all' || category.id === selectedCategory.value
        )
        .map(category => ({
          ...category,
          questions: category.questions.filter(q =>
            !searchQuery.value || 
            q.question.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            q.answer.toLowerCase().includes(searchQuery.value.toLowerCase())
          )
        }))
        .filter(category => category.questions.length > 0)
    })
    
    // Gérer l'ouverture/fermeture des questions
    const toggleQuestion = (questionId) => {
      const index = openQuestions.value.indexOf(questionId)
      if (index === -1) {
        openQuestions.value.push(questionId)
      } else {
        openQuestions.value.splice(index, 1)
      }
    }
    </script>