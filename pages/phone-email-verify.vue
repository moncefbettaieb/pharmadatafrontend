<template>
  <div
    class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8"
  >
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2
        class="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900"
      >
        Finaliser votre compte
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Pour compléter votre inscription, veuillez saisir quelques informations
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <form class="space-y-6" @submit.prevent="handleSubmit">
          <!-- Prénom (requis) -->
          <div>
            <label for="firstName" class="block text-sm font-medium text-gray-700">
              Prénom <span class="text-red-500">*</span>
            </label>
            <div class="mt-1">
              <input
                id="firstName"
                v-model="userData.firstName"
                name="firstName"
                type="text"
                required
                class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <!-- Nom -->
          <div>
            <label for="lastName" class="block text-sm font-medium text-gray-700">
              Nom
            </label>
            <div class="mt-1">
              <input
                id="lastName"
                v-model="userData.lastName"
                name="lastName"
                type="text"
                class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <!-- Email (requis) -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              Email <span class="text-red-500">*</span>
            </label>
            <div class="mt-1">
              <input
                id="email"
                v-model="userData.email"
                name="email"
                type="email"
                required
                class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <!-- Téléphone (déjà rempli) -->
          <div>
            <label for="phone" class="block text-sm font-medium text-gray-700">
              Téléphone
            </label>
            <div class="mt-1">
              <input
                id="phone"
                v-model="userData.phoneNumber"
                name="phone"
                type="tel"
                disabled
                class="block w-full appearance-none rounded-md border border-gray-300 bg-gray-100 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div v-if="error" class="text-red-600 text-sm">
            {{ error }}
          </div>

          <div>
            <button
              type="submit"
              :disabled="loading"
              class="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {{ loading ? "Enregistrement..." : "Compléter mon profil" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "~/stores/auth";
import { useToast } from "vue-toastification";
import { doc, collection, setDoc, serverTimestamp } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";

const authStore = useAuthStore();
const router = useRouter();
const toast = useToast();

const userData = ref({
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: authStore.user?.phoneNumber || ""
});

const loading = ref(false);
const error = ref("");

// Vérifier si l'utilisateur est connecté
onMounted(() => {
  if (!authStore.user) {
    router.push("/login");
    return;
  }
  
  // Vérifier si l'utilisateur a déjà un email (ne devrait pas arriver)
  if (authStore.user.email) {
    router.push("/account/api-tokens");
  }
});

const handleSubmit = async () => {
  if (!authStore.user) {
    error.value = "Utilisateur non connecté";
    return;
  }

  loading.value = true;
  error.value = "";

  try {
    const { $firebaseAuth, $firebaseDb } = useNuxtApp();
    if (!$firebaseAuth || !$firebaseDb) {
      throw new Error("Services Firebase non initialisés");
    }

    // 1. Mettre à jour le profil utilisateur avec le displayName
    const displayName = `${userData.value.firstName} ${userData.value.lastName}`.trim();
    
    // 2. Mettre à jour le document Firestore
    const userRef = doc($firebaseDb, "users", authStore.user.uid);
    await setDoc(userRef, {
      displayName,
      firstName: userData.value.firstName,
      lastName: userData.value.lastName,
      email: userData.value.email,
      phoneNumber: authStore.user.phoneNumber,
      needsEmailVerification: false,
      updatedAt: serverTimestamp()
    }, { merge: true });

    // 3. Créer un abonnement gratuit pour l'utilisateur
    const subscriptionRef = doc(collection($firebaseDb, "subscriptions"));
    await setDoc(subscriptionRef, {
      userId: authStore.user.uid,
      planId: "free",
      name: "Gratuit",
      status: "active",
      requestsPerMonth: 100,
      remainingRequests: 100,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
      createdAt: serverTimestamp(),
    });

    // 4. Générer un token API via la fonction cloud
    try {
      const generateTokenCall = httpsCallable($firebaseFunctions, "generateToken");
      const tokenResult = await generateTokenCall();
      if (tokenResult.data && typeof tokenResult.data === "object") {
        const { token, id } = tokenResult.data;
        await setDoc(doc(collection($firebaseDb, "api_usage")), {
          userId: authStore.user.uid,
          tokenId: id,
          token: token,
          requests: 0,
          lastUsed: null,
          createdAt: serverTimestamp(),
        });
      }
    } catch (tokenError) {
      console.error("Erreur lors de la génération du token:", tokenError);
      // Ne pas bloquer le processus si la génération de token échoue
    }

    // 5. Créer une notification de bienvenue
    const notifRef = doc(collection($firebaseDb, "notifications"));
    await setDoc(notifRef, {
      userId: authStore.user.uid,
      title: "Création de compte utilisateur",
      type: "info",
      read: "false",
      message: "Utilisateur créé avec succès",
      createdAt: serverTimestamp(),
    });

    toast.success("Profil complété avec succès");
    router.push("/account/api-tokens");
  } catch (err) {
    console.error("Erreur lors de la mise à jour du profil:", err);
    error.value = "Une erreur est survenue lors de la mise à jour du profil";
    toast.error("Erreur lors de la mise à jour du profil");
  } finally {
    loading.value = false;
  }
};
</script> 