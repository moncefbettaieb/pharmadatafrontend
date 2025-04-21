<template>
  <div class="bg-white">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <div class="mx-auto max-w-4xl text-center">
        <h1 class="text-base font-semibold leading-7 text-indigo-600">Tarification</h1>
        <p class="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Plans d'accès à l'API
        </p>
        <p class="mt-6 text-lg leading-8 text-gray-600">
          Choisissez le plan qui correspond à vos besoins.
        </p>

        <!-- Toggle annuel/mensuel -->
        <div class="mt-8 flex flex-wrap items-center justify-center gap-x-4">
          <span class="text-sm font-semibold" :class="isAnnual ? 'text-gray-500' : 'text-gray-900'">Mensuel</span>
          <button
            @click="toggleBillingPeriod"
            type="button"
            class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
            :class="isAnnual ? 'bg-indigo-600' : 'bg-gray-200'"
            role="switch"
            :aria-checked="isAnnual"
          >
            <span
              aria-hidden="true"
              class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
              :class="isAnnual ? 'translate-x-5' : 'translate-x-0'"
            />
          </button>
          <span class="text-sm font-semibold" :class="isAnnual ? 'text-gray-900' : 'text-gray-500'">
            Annuel (2 mois offerts)
          </span>
        </div>
      </div>
  
      <div class="isolate mx-auto mt-16 grid grid-cols-1 gap-y-8 gap-x-6 sm:mt-20 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <!-- Plan Gratuit -->
        <div class="rounded-3xl p-8 ring-1 ring-gray-200 bg-white flex flex-col h-full">
          <div class="flex-1">
            <h3 class="text-lg font-semibold leading-8 text-gray-900">Gratuit</h3>
            <p class="mt-4 text-sm leading-6 text-gray-600">
              100 requêtes par mois
            </p>
            <p class="mt-6 flex items-baseline gap-x-1">
              <span class="text-4xl font-bold tracking-tight text-gray-900">0€</span>
              <span class="text-sm font-semibold leading-6 text-gray-600">/mois</span>
            </p>
            <ul role="list" class="mt-8 space-y-3 text-sm leading-6 text-gray-600">
              <li v-for="feature in plansStore.plans[0].features" :key="feature" class="flex gap-x-3">
                <CheckIcon class="h-6 w-5 flex-none text-gray-600" aria-hidden="true" />
                {{ feature }}
              </li>
            </ul>
          </div>
          <button
            @click="selectPlan(plansStore.plans[0])"
            :disabled="loading"
            class="mt-8 block w-full rounded-md bg-gray-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-gray-500"
          >
            Commencer gratuitement
          </button>
        </div>
  
        <!-- Plan Basic -->
        <div class="rounded-3xl p-8 ring-1 ring-gray-200 bg-blue-50 flex flex-col h-full">
          <div class="flex-1">
            <h3 class="text-lg font-semibold leading-8 text-blue-900">Basic</h3>
            <p class="mt-4 text-sm leading-6 text-blue-600">
              1 000 requêtes par mois
            </p>
            <p class="mt-6 flex items-baseline gap-x-1">
              <span class="text-4xl font-bold tracking-tight text-blue-900">
                {{ isAnnual ? '299.90€' : '29.99€' }}
              </span>
              <span class="text-sm font-semibold leading-6 text-blue-600">
                /{{ isAnnual ? 'an' : 'mois' }}
              </span>
            </p>
            <ul role="list" class="mt-8 space-y-3 text-sm leading-6 text-blue-600">
              <li v-for="feature in plansStore.plans[1].features" :key="feature" class="flex gap-x-3">
                <CheckIcon class="h-6 w-5 flex-none text-blue-600" aria-hidden="true" />
                {{ feature }}
              </li>
            </ul>
          </div>
          <button
            @click="selectPlan(plansStore.plans[1])"
            :disabled="loading"
            class="mt-8 block w-full rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-blue-500"
          >
            Sélectionner
          </button>
        </div>
  
        <!-- Plan Pro (Popular) -->
        <div class="rounded-3xl p-8 ring-2 ring-indigo-600 bg-indigo-50 lg:z-10 lg:rounded-b-none relative flex flex-col h-full">
          <div class="absolute -top-4 left-0 right-0 flex justify-center">
            <span class="rounded-full bg-indigo-600 px-4 py-1 text-xs font-semibold leading-5 text-white">Le plus populaire</span>
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-semibold leading-8 text-indigo-900">Pro</h3>
            <p class="mt-4 text-sm leading-6 text-indigo-600">
              5 000 requêtes par mois
            </p>
            <p class="mt-6 flex items-baseline gap-x-1">
              <span class="text-4xl font-bold tracking-tight text-indigo-900">
                {{ isAnnual ? '799.90€' : '79.99€' }}
              </span>
              <span class="text-sm font-semibold leading-6 text-indigo-600">
                /{{ isAnnual ? 'an' : 'mois' }}
              </span>
            </p>
            <ul role="list" class="mt-8 space-y-3 text-sm leading-6 text-indigo-600">
              <li v-for="feature in plansStore.plans[2].features" :key="feature" class="flex gap-x-3">
                <CheckIcon class="h-6 w-5 flex-none text-indigo-600" aria-hidden="true" />
                {{ feature }}
              </li>
            </ul>
          </div>
          <button
            @click="selectPlan(plansStore.plans[2])"
            :disabled="loading"
            class="mt-8 block w-full rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            Sélectionner
          </button>
        </div>
  
        <!-- Plan Enterprise -->
        <div class="rounded-3xl p-8 ring-1 ring-gray-200 bg-purple-50 flex flex-col h-full">
          <div class="flex-1">
            <h3 class="text-lg font-semibold leading-8 text-purple-900">Enterprise</h3>
            <p class="mt-4 text-sm leading-6 text-purple-600">
              20 000 requêtes par mois
            </p>
            <p class="mt-6 flex items-baseline gap-x-1">
              <span class="text-4xl font-bold tracking-tight text-purple-900">
                {{ isAnnual ? '1999.90€' : '199.99€' }}
              </span>
              <span class="text-sm font-semibold leading-6 text-purple-600">
                /{{ isAnnual ? 'an' : 'mois' }}
              </span>
            </p>
            <ul role="list" class="mt-8 space-y-3 text-sm leading-6 text-purple-600">
              <li v-for="feature in plansStore.plans[3].features" :key="feature" class="flex gap-x-3">
                <CheckIcon class="h-6 w-5 flex-none text-purple-600" aria-hidden="true" />
                {{ feature }}
              </li>
            </ul>
          </div>
          <button
            @click="selectPlan(plansStore.plans[3])"
            :disabled="loading"
            class="mt-8 block w-full rounded-md bg-purple-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-purple-500"
          >
            Sélectionner
          </button>
        </div>
  
        <!-- Plan Lifetime -->
        <div class="rounded-3xl p-8 ring-1 ring-gray-200 bg-gradient-to-br from-green-50 to-emerald-50 flex flex-col h-full">
          <div class="flex-1">
            <h3 class="text-lg font-semibold leading-8 text-emerald-900">Lifetime</h3>
            <p class="mt-4 text-sm leading-6 text-emerald-600">
              Accès illimité à vie
            </p>
            <p class="mt-6 flex items-baseline gap-x-1">
              <span class="text-4xl font-bold tracking-tight text-emerald-900">4999€</span>
              <span class="text-sm font-semibold leading-6 text-emerald-600">une fois</span>
            </p>
            <ul role="list" class="mt-8 space-y-3 text-sm leading-6 text-emerald-600">
              <li class="flex gap-x-3">
                <CheckIcon class="h-6 w-5 flex-none text-emerald-600" aria-hidden="true" />
                Requêtes illimitées
              </li>
              <li class="flex gap-x-3">
                <CheckIcon class="h-6 w-5 flex-none text-emerald-600" aria-hidden="true" />
                Support prioritaire à vie
              </li>
              <li class="flex gap-x-3">
                <CheckIcon class="h-6 w-5 flex-none text-emerald-600" aria-hidden="true" />
                Accès aux futures fonctionnalités
              </li>
              <li class="flex gap-x-3">
                <CheckIcon class="h-6 w-5 flex-none text-emerald-600" aria-hidden="true" />
                API personnalisée
              </li>
              <li class="flex gap-x-3">
                <CheckIcon class="h-6 w-5 flex-none text-emerald-600" aria-hidden="true" />
                SLA garanti
              </li>
            </ul>
          </div>
          <button
            @click="selectLifetimePlan"
            :disabled="loading"
            class="mt-8 block w-full rounded-md bg-gradient-to-r from-emerald-600 to-green-600 px-3 py-2 text-center text-sm font-semibold text-white hover:from-emerald-500 hover:to-green-500"
          >
            Accès à vie
          </button>
        </div>
      </div>
    </div>
  </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useAuthStore } from '~/stores/auth'
  import { usePlansStore } from '~/stores/plans'
  import { useToast } from 'vue-toastification'
  import { loadStripe } from '@stripe/stripe-js'
  import { httpsCallable } from 'firebase/functions'
  import { CheckIcon } from '@heroicons/vue/24/solid'
  import { storeToRefs } from 'pinia'
  
  const authStore = useAuthStore()
  const plansStore = usePlansStore()
  const { user } = storeToRefs(authStore)
  const toast = useToast()
  const loading = ref(false)
  const { $firebaseFunctions } = useNuxtApp()
  const router = useRouter()
  const isAnnual = ref(false)
  
  const toggleBillingPeriod = () => {
    isAnnual.value = !isAnnual.value
  }
  
  const selectPlan = async (plan) => {
    if (!user.value) {
      router.push('/login')
      return
    }
  
    loading.value = true
    if (plan.id === 'free') {
      router.push('/account/api-tokens')
      return
    }
  
    try {
      if (!$firebaseFunctions) {
        throw new Error('Firebase Functions non initialisé')
      }
  
      const createSubscriptionCall = httpsCallable($firebaseFunctions, 'createSubscription')
      const result = await createSubscriptionCall({
        priceId: plan.id,
        requestsLimit: plan.requestsPerMonth,
        isAnnual: isAnnual.value,
        successUrl: `${window.location.origin}/payment/success`,
        cancelUrl: `${window.location.origin}/payment/cancel`
      })
  
      const { sessionId } = result.data
      if (!sessionId) {
        throw new Error('Session ID manquant dans la réponse')
      }
  
      // Obtenir la clé publique Stripe depuis la Cloud Function
      const getStripeInfoCall = httpsCallable($firebaseFunctions, 'getStripeRedirectUrl')
      const stripeInfoResult = await getStripeInfoCall({ sessionId })
      
      if (!stripeInfoResult.data || typeof stripeInfoResult.data !== 'object') {
        throw new Error('Réponse invalide du serveur')
      }
      
      const stripeInfo = stripeInfoResult.data
      if (!stripeInfo.publicKey || !stripeInfo.sessionId) {
        throw new Error('Informations Stripe incomplètes')
      }
  
      // Initialiser Stripe avec la clé publique récupérée du serveur
      const stripe = await loadStripe(stripeInfo.publicKey)
      if (!stripe) {
        throw new Error('Erreur lors du chargement de Stripe')
      }
  
      // Rediriger vers la page de paiement Stripe
      const { error } = await stripe.redirectToCheckout({ 
        sessionId: stripeInfo.sessionId 
      })
      
      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Erreur complète:', error)
      toast.error(error.message || "Une erreur s'est produite lors de la redirection vers le paiement")
    } finally {
      loading.value = false
    }
  }
  
  const selectLifetimePlan = async () => {
    if (!user.value) {
      router.push('/login')
      return
    }
  
    loading.value = true
    try {
      if (!$firebaseFunctions) {
        throw new Error('Firebase Functions non initialisé')
      }
  
      const createLifetimeSessionCall = httpsCallable($firebaseFunctions, 'createLifetimeSession')
      const result = await createLifetimeSessionCall({
        successUrl: `${window.location.origin}/payment/success`,
        cancelUrl: `${window.location.origin}/payment/cancel`
      })
  
      const { sessionId } = result.data
      if (!sessionId) {
        throw new Error('Session ID manquant dans la réponse')
      }
  
      // Obtenir la clé publique Stripe depuis la Cloud Function
      const getStripeInfoCall = httpsCallable($firebaseFunctions, 'getStripeRedirectUrl')
      const stripeInfoResult = await getStripeInfoCall({ sessionId })
      
      if (!stripeInfoResult.data || typeof stripeInfoResult.data !== 'object') {
        throw new Error('Réponse invalide du serveur')
      }
      
      const stripeInfo = stripeInfoResult.data
      if (!stripeInfo.publicKey || !stripeInfo.sessionId) {
        throw new Error('Informations Stripe incomplètes')
      }
  
      // Initialiser Stripe avec la clé publique récupérée du serveur
      const stripe = await loadStripe(stripeInfo.publicKey)
      if (!stripe) {
        throw new Error('Erreur lors du chargement de Stripe')
      }
  
      // Rediriger vers la page de paiement Stripe
      const { error } = await stripe.redirectToCheckout({ 
        sessionId: stripeInfo.sessionId 
      })
      
      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Erreur lors de l\'achat du plan lifetime:', error)
      toast.error(error.message || "Une erreur s'est produite lors de la redirection vers le paiement")
    } finally {
      loading.value = false
    }
  }
  </script>