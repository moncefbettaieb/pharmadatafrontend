<template>
    <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8.485 3.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 3.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-yellow-700">
            Veuillez vérifier votre adresse email. Un lien de vérification a été envoyé à {{ email }}.
          </p>
          <div class="mt-4">
            <div class="flex space-x-3">
              <button
                @click="resendEmail"
                :disabled="loading"
                class="text-sm font-medium text-yellow-700 hover:text-yellow-600 focus:outline-none focus:underline"
              >
                {{ loading ? 'Envoi en cours...' : 'Renvoyer le lien' }}
              </button>
              <button
                @click="checkVerification"
                :disabled="loading"
                class="text-sm font-medium text-yellow-700 hover:text-yellow-600 focus:outline-none focus:underline"
              >
                Vérifier le statut
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useAuthStore } from '~/stores/auth'
  import { useToast } from 'vue-toastification'
  
  const props = defineProps({
    email: {
      type: String,
      required: true
    }
  })
  
  const authStore = useAuthStore()
  const toast = useToast()
  const loading = ref(false)
  
  const resendEmail = async () => {
    loading.value = true
    try {
      await authStore.resendVerificationEmail()
      toast.success('Email de vérification renvoyé')
    } catch (error) {
      toast.error(error.message)
    } finally {
      loading.value = false
    }
  }
  
  const checkVerification = async () => {
    loading.value = true
    try {
      await authStore.user?.reload()
      if (authStore.user?.emailVerified) {
        await authStore.createUserDocument(authStore.user, true)
        toast.success('Email vérifié avec succès')
        window.location.reload()
      } else {
        toast.info('Email non encore vérifié')
      }
    } catch (error) {
      toast.error('Erreur lors de la vérification')
    } finally {
      loading.value = false
    }
  }
  </script>
  