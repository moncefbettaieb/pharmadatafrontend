<template>
    <div class="min-h-screen bg-gray-50 py-12">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="bg-white shadow sm:rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h1 class="text-3xl font-bold text-gray-900 mb-8">Glossaire Pharmaceutique</h1>
    
            <!-- Barre de recherche -->
            <div class="mb-8">
              <div class="relative">
                <input
                  type="text"
                  v-model="searchTerm"
                  placeholder="Rechercher un terme..."
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pl-10 sm:text-sm"
                />
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
    
            <!-- Index alphabétique -->
            <div class="mb-8 flex flex-wrap gap-2">
              <button
                v-for="letter in alphabet"
                :key="letter"
                @click="scrollToLetter(letter)"
                class="px-3 py-1 rounded-md text-sm font-medium"
                :class="currentLetter === letter ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
              >
                {{ letter }}
              </button>
            </div>
    
            <!-- Liste des termes -->
            <div class="space-y-8">
              <div v-for="(terms, letter) in filteredGlossary" :key="letter" :id="'letter-' + letter">
                <h2 class="text-2xl font-bold text-indigo-600 mb-4 sticky top-0 bg-white py-2">{{ letter }}</h2>
                <dl class="space-y-6">
                  <div v-for="term in terms" :key="term.name" class="bg-gray-50 p-4 rounded-lg">
                    <dt class="text-lg font-semibold text-gray-900">{{ term.name }}</dt>
                    <dd class="mt-2 text-gray-600">{{ term.definition }}</dd>
                    <div v-if="term.example" class="mt-2 text-sm">
                      <span class="font-medium text-gray-700">Exemple : </span>
                      <span class="text-gray-600">{{ term.example }}</span>
                    </div>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </template>
    
    <script setup>
    const searchTerm = ref('')
    const currentLetter = ref('A')
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
    
    // Glossaire complet
    const glossary = {
      'A': [
        {
          name: 'AMM',
          definition: 'Autorisation de Mise sur le Marché. Autorisation délivrée par les autorités compétentes permettant la commercialisation d\'un médicament.',
          example: 'Un nouveau médicament doit obtenir son AMM avant d\'être commercialisé.'
        },
        {
          name: 'Antibiotique',
          definition: 'Substance qui détruit les bactéries ou empêche leur multiplication.',
          example: 'L\'amoxicilline est un antibiotique couramment prescrit.'
        }
      ],
      'B': [
        {
          name: 'Biodisponibilité',
          definition: 'Fraction de la dose administrée d\'un médicament qui atteint la circulation sanguine.',
          example: 'La biodisponibilité d\'un médicament peut varier selon sa forme galénique.'
        }
      ],
      'C': [
        {
          name: 'CIP',
          definition: 'Code Identifiant de Présentation. Code à 13 chiffres identifiant de manière unique chaque présentation d\'un médicament.',
          example: 'Le code CIP 3400936485236 correspond à une boîte spécifique de médicament.'
        },
        {
          name: 'Contre-indication',
          definition: 'Situation dans laquelle un médicament ne doit pas être utilisé car il pourrait être dangereux pour le patient.',
          example: 'L\'aspirine est contre-indiquée chez les patients allergiques aux salicylés.'
        }
      ],
      'D': [
        {
          name: 'DCI',
          definition: 'Dénomination Commune Internationale. Nom scientifique d\'une substance active pharmaceutique.',
          example: 'Le paracétamol est la DCI du Doliprane.'
        }
      ],
      'E': [
        {
          name: 'Excipient',
          definition: 'Substance inactive ajoutée au principe actif dans la fabrication d\'un médicament.',
          example: 'Le lactose est un excipient couramment utilisé dans les comprimés.'
        }
      ],
      'F': [
        {
          name: 'Forme galénique',
          definition: 'Forme pharmaceutique sous laquelle se présente un médicament.',
          example: 'Comprimé, gélule, sirop, pommade sont des formes galéniques.'
        }
      ],
      'P': [
        {
          name: 'Posologie',
          definition: 'Dose d\'un médicament à administrer et rythme d\'administration.',
          example: '1 comprimé 3 fois par jour pendant 7 jours.'
        },
        {
          name: 'Principe actif',
          definition: 'Substance responsable de l\'effet thérapeutique d\'un médicament.',
          example: 'Le paracétamol est le principe actif du Doliprane.'
        }
      ],
      'V': [
        {
          name: 'Voie d\'administration',
          definition: 'Mode d\'introduction d\'un médicament dans l\'organisme.',
          example: 'Voie orale, injectable, cutanée, etc.'
        }
      ]
    }
    
    // Filtrer le glossaire en fonction du terme recherché
    const filteredGlossary = computed(() => {
      if (!searchTerm.value) return glossary
    
      const filtered = {}
      for (const [letter, terms] of Object.entries(glossary)) {
        const filteredTerms = terms.filter(term => 
          term.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
          term.definition.toLowerCase().includes(searchTerm.value.toLowerCase())
        )
        if (filteredTerms.length > 0) {
          filtered[letter] = filteredTerms
        }
      }
      return filtered
    })
    
    // Fonction pour scroller vers une lettre
    const scrollToLetter = (letter) => {
      currentLetter.value = letter
      const element = document.getElementById(`letter-${letter}`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
    
    // Observer pour détecter la lettre courante pendant le défilement
    onMounted(() => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const letter = entry.target.id.split('-')[1]
            currentLetter.value = letter
          }
        })
      }, { threshold: 0.5 })
    
      // Observer chaque section de lettre
      alphabet.forEach(letter => {
        const element = document.getElementById(`letter-${letter}`)
        if (element) {
          observer.observe(element)
        }
      })
    })
    </script>