<template>
  <div
    class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="w-full max-w-md space-y-8">
      <div class="bg-white py-8 px-6 shadow sm:rounded-lg sm:px-10">
        <div class="text-center">
          <!-- Icône Email -->
          <div
            class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100"
          >
            <svg
              class="h-6 w-6 text-indigo-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>

          <h2 class="mt-6 text-2xl sm:text-3xl font-bold text-gray-900">
            Vérification de l'email
          </h2>

          <p class="mt-2 text-sm text-gray-600">
            Un email de vérification a été envoyé à votre adresse. Veuillez
            cliquer sur le lien pour activer votre compte.
          </p>

          <div class="mt-6">
            <button
              @click="resendVerificationEmail"
              :disabled="loading"
              class="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {{
                loading
                  ? "Envoi en cours..."
                  : "Renvoyer l'email de vérification"
              }}
            </button>
          </div>

          <div v-if="error" class="mt-4 text-sm text-red-600">
            {{ error }}
          </div>

          <div class="mt-6 text-sm text-gray-500">
            <p>
              Vous n'avez pas reçu l'email ?
              <br class="block sm:hidden" />
              Vérifiez vos spams ou
              <button
                @click="handleLogout"
                class="ml-1 font-medium text-indigo-600 hover:text-indigo-500"
              >
                essayez une autre adresse
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useAuthStore } from "~/stores/auth";
import { useToast } from "vue-toastification";

const authStore = useAuthStore();
const router = useRouter();
const toast = useToast();

const loading = ref(false);
const error = ref(null);

const resendVerificationEmail = async () => {
  loading.value = true;
  error.value = null;

  try {
    await authStore.resendVerificationEmail();
    toast.success("Email de vérification renvoyé");
  } catch (err) {
    error.value = err.message;
    toast.error("Erreur lors de l'envoi de l'email");
  } finally {
    loading.value = false;
  }
};

const handleLogout = async () => {
  try {
    await authStore.logout();
    router.push("/login");
  } catch (err) {
    toast.error("Erreur lors de la déconnexion");
  }
};

// Rediriger si l'email est déjà vérifié
onMounted(() => {
  if (authStore.user?.emailVerified) {
    router.push("/account/api-tokens");
  }
});

// Observer les changements de l'état de vérification
watch(
  () => authStore.user?.emailVerified,
  (isVerified) => {
    if (isVerified) {
      router.push("/account/api-tokens");
    }
  }
);
</script>
