<template>
  <div
    class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="w-full max-w-md space-y-8">
      <div class="bg-white py-8 px-6 shadow sm:rounded-lg sm:px-10">
        <div class="text-center">
          <!-- Icône de statut -->
          <div
            class="mx-auto flex items-center justify-center h-12 w-12 rounded-full"
            :class="{
              'bg-indigo-100': status === 'loading',
              'bg-green-100': status === 'success',
              'bg-red-100': status === 'error',
            }"
          >
            <!-- Loading -->
            <svg
              v-if="status === 'loading'"
              class="h-6 w-6 text-indigo-600 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4zm2 5.3A8 8 0 014 12H0c0 3 1.1 5.8 3 7.9l3-2.6z"
              ></path>
            </svg>

            <!-- Success -->
            <svg
              v-else-if="status === 'success'"
              class="h-6 w-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>

            <!-- Error -->
            <svg
              v-else
              class="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>

          <!-- Titre -->
          <h2 class="mt-6 text-2xl sm:text-3xl font-bold text-gray-900">
            {{ messageTitle }}
          </h2>

          <!-- Message -->
          <p class="mt-2 text-sm text-gray-600">
            {{ messageBody }}
          </p>

          <!-- Actions -->
          <div class="mt-6 space-y-4">
            <button
              v-if="status === 'error'"
              @click="handleRetry"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "~/stores/auth";
import { useToast } from "vue-toastification";
import {
  applyActionCode,
  signInWithEmailLink,
  isSignInWithEmailLink,
  getAuth,
  onAuthStateChanged,
  sendEmailVerification
} from "firebase/auth";

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const toast = useToast();
const { $firebaseAuth } = useNuxtApp();

const messageTitle = ref("Vérification en cours...");
const messageBody = ref(
  "Veuillez patienter pendant que nous vérifions votre email..."
);
const status = ref<"loading" | "success" | "error">("loading");

const handleRetry = async () => {
  status.value = "loading";
  messageTitle.value = "Vérification en cours...";
  messageBody.value =
    "Veuillez patienter pendant que nous vérifions votre email...";

  await verifyEmail();
};

const verifyEmail = async () => {
  try {
    if (!$firebaseAuth) {
      throw new Error("Firebase Auth n'est pas initialisé");
    }

    const oobCode = route.query.oobCode as string;
    
    if (!oobCode) {
      throw new Error("Code de vérification manquant");
    }

    // Appliquer le code de vérification
    await applyActionCode($firebaseAuth, oobCode);

    // Attendre un peu pour que les changements soient propagés
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Recharger l'utilisateur courant
    if ($firebaseAuth.currentUser) {
      await $firebaseAuth.currentUser.reload();
      
      if ($firebaseAuth.currentUser.emailVerified) {
        // Mettre à jour le document utilisateur avec le statut vérifié
        await authStore.createUserDocument($firebaseAuth.currentUser, true);
        
        status.value = "success";
        messageTitle.value = "Email vérifié avec succès";
        messageBody.value = "Votre compte a été vérifié. Vous allez être redirigé...";

        // Redirection après un court délai
        setTimeout(() => {
          router.push("/account/api-tokens");
        }, 2000);
      } else {
        throw new Error("L'email n'a pas pu être vérifié");
      }
    } else {
      // Si l'utilisateur n'est pas connecté, rediriger vers la connexion
      status.value = "success";
      messageTitle.value = "Email vérifié";
      messageBody.value = "Votre email a été vérifié. Veuillez vous connecter pour continuer.";
      
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    }
  } catch (error: any) {
    console.error("Erreur de vérification:", error);
    status.value = "error";
    messageTitle.value = "Erreur de vérification";
    messageBody.value = "Une erreur est survenue lors de la vérification de votre email. " + 
      (error.message || "Veuillez réessayer.");
    toast.error("Erreur lors de la vérification de l'email");
  }
};

// Vérifier l'email au chargement de la page
onMounted(() => {
  verifyEmail();
});
</script>

<script lang="ts">
// Définir les options de la page
definePageMeta({
  layout: "auth",
  middleware: "guest",
});
</script>
