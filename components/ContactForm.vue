<!-- components/ContactForm.vue -->
<template>
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
            <p class="text-gray-500">
              J'accepte la
              <NuxtLink to="/privacy" class="text-indigo-600 hover:text-indigo-500">
                politique de confidentialité
              </NuxtLink>.
            </p>
          </div>
        </div>
  
        <div>
          <button
            type="submit"
            :disabled="loading"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:opacity-50"
          >
            {{ loading ? 'Envoi en cours...' : 'Envoyer' }}
          </button>
        </div>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useToast } from 'vue-toastification'
  import { httpsCallable } from 'firebase/functions'
  import { useNuxtApp } from '#app'
  
  const toast = useToast()
  const { $functions } = useNuxtApp()
  
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
    try {
      if (!$functions) throw new Error('Firebase Functions non initialisé')
      const sendEmailCall = httpsCallable($functions, 'sendContactEmail')
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
      console.error('Erreur envoi message:', error)
      toast.error('Une erreur est survenue lors de l’envoi du message')
    } finally {
      loading.value = false
    }
  }
  </script>
  