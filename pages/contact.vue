<template>
    <div class="min-h-screen bg-gray-50 py-12">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="bg-white shadow sm:rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h1 class="text-3xl font-bold text-gray-900 mb-8">Contactez-nous</h1>
    
            <!-- Informations de contact -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div>
                <h2 class="text-xl font-semibold text-gray-900 mb-4">Nos coordonnées</h2>
                <div class="space-y-4">
                  <div class="flex items-start">
                    <div class="flex-shrink-0">
                      <svg class="h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div class="ml-3">
                      <p class="text-sm font-medium text-gray-900">Email</p>
                      <p class="text-sm text-gray-600">support@@pharmadata.fr</p>
                    </div>
                  </div>
    
                  <div class="flex items-start">
                    <div class="flex-shrink-0">
                      <svg class="h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div class="ml-3">
                      <p class="text-sm font-medium text-gray-900">Téléphone</p>
                      <p class="text-sm text-gray-600">+33 (0)6 05 67 12 23</p>
                    </div>
                  </div>
    
                  <div class="flex items-start">
                    <div class="flex-shrink-0">
                      <svg class="h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div class="ml-3">
                      <p class="text-sm font-medium text-gray-900">Horaires</p>
                      <p class="text-sm text-gray-600">Du lundi au vendredi</p>
                      <p class="text-sm text-gray-600">9h00 - 18h00</p>
                    </div>
                  </div>
                </div>
    
                <!-- FAQ et Documentation -->
                <div class="mt-8">
                  <h3 class="text-lg font-medium text-gray-900 mb-4">Ressources utiles</h3>
                  <div class="space-y-3">
                    <NuxtLink to="/faq" class="flex items-center text-indigo-600 hover:text-indigo-500">
                      <svg class="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      FAQ
                    </NuxtLink>
                    <NuxtLink to="/api-documentation" class="flex items-center text-indigo-600 hover:text-indigo-500">
                      <svg class="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Documentation API
                    </NuxtLink>
                  </div>
                </div>
              </div>
    
              <!-- Formulaire de contact -->
              <div>
                <h2 class="text-xl font-semibold text-gray-900 mb-4">Envoyez-nous un message</h2>
                <form @submit.prevent="handleSubmit" class="space-y-6">
                  <div>
                    <label for="name" class="block text-sm font-medium text-gray-700">Nom*</label>
                    <input
                      type="text"
                      id="name"
                      v-model="formData.name"
                      required
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
    
                  <div>
                    <label for="email" class="block text-sm font-medium text-gray-700">Email*</label>
                    <input
                      type="email"
                      id="email"
                      v-model="formData.email"
                      required
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
    
                  <div>
                    <label for="subject" class="block text-sm font-medium text-gray-700">Sujet*</label>
                    <select
                      id="subject"
                      v-model="formData.subject"
                      required
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value="">Sélectionnez un sujet</option>
                      <option value="api">Question sur l'API</option>
                      <option value="product">Question sur les fiches produits</option>
                      <option value="billing">Question sur la facturation</option>
                      <option value="technical">Support technique</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>
    
                  <div>
                    <label for="message" class="block text-sm font-medium text-gray-700">Message*</label>
                    <textarea
                      id="message"
                      v-model="formData.message"
                      rows="4"
                      required
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    ></textarea>
                  </div>
    
                  <div class="flex items-start">
                    <div class="flex items-center h-5">
                      <input
                        id="privacy"
                        type="checkbox"
                        v-model="formData.privacy"
                        required
                        class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </div>
                    <div class="ml-3 text-sm">
                      <label for="privacy" class="font-medium text-gray-700">Protection des données</label>
                      <p class="text-gray-500">J'accepte que mes données soient traitées conformément à la 
                        <NuxtLink to="/privacy" class="text-indigo-600 hover:text-indigo-500">politique de confidentialité</NuxtLink>.
                      </p>
                    </div>
                  </div>
    
                  <div>
                    <button
                      type="submit"
                      :disabled="loading"
                      class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {{ loading ? 'Envoi en cours...' : 'Envoyer' }}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </template>
    
    <script setup>
    import { ref } from 'vue'
    import { useToast } from 'vue-toastification'
    import { httpsCallable } from 'firebase/functions'
    
    const toast = useToast()
    const loading = ref(false)
    
    const formData = ref({
      name: '',
      email: '',
      subject: '',
      message: '',
      privacy: false
    })

    const handleSubmit = async () => {
      loading.value = true
      if (!formData.value.name.trim()) return
      if (!formData.value.email.trim()) return
      if (!formData.value.subject.trim()) return
        try {
          const { $firebaseFunctions } = useNuxtApp()
          if (!$firebaseFunctions) throw new Error('Firebase Functions non initialisé')
          const sendEmailCall = httpsCallable($firebaseFunctions, 'sendContactEmail')
          await sendEmailCall({
            subject: formData.value.subject,
            message: formData.value.message,
            sessionId: formData.value.email,
          })
        toast.success('Message envoyé avec succès')
        formData.value = {
          name: '',
          email: '',
          subject: '',
          message: '',
          privacy: false
        }
      } catch (error) {
        console.error('Erreur lors de l\'envoi du message:', error)
        toast.error('Une erreur est survenue lors de l\'envoi du message')
      } finally {
        loading.value = false
      }
    }
    </script>