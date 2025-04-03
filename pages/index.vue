<template>
  <main>
    <!-- Hero Section -->
    <div class="relative isolate">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
        <div class="mx-auto max-w-2xl text-center">
          <h1 class="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900">
            Plateforme de Données Pharmaceutiques Professionnelles
          </h1>
          <p class="mt-6 text-base sm:text-lg md:text-xl leading-7 text-gray-600">
            Accédez à des données complètes sur les produits pharmaceutiques et parapharmaceutiques. Achetez des fiches produits individuelles ou abonnez-vous à notre API pour une intégration transparente.
          </p>
          <div class="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <NuxtLink
              to="/products"
              class="rounded-md bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Parcourir les Fiches Produits
            </NuxtLink>
            <NuxtLink
              to="/api-plans"
              class="text-sm font-semibold leading-6 text-gray-900"
            >
              Voir les Plans API <span aria-hidden="true">→</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div class="bg-white py-16 sm:py-24 lg:py-32">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="mx-auto max-w-2xl text-center lg:text-left">
          <h2 class="text-base font-semibold leading-7 text-indigo-600">Plateforme de Données</h2>
          <p class="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            Tout ce dont vous avez besoin pour vos données pharmaceutiques
          </p>
        </div>

        <!-- Custom Illustration Section -->
        <div class="mt-12 flex flex-col-reverse lg:flex-row items-center gap-10">
          <div class="w-full lg:w-1/2 text-center lg:text-left">
            <h3 class="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">
              Offrez un accès API à vos fiches de données pharmaceutiques
            </h3>
            <p class="text-gray-600 text-base sm:text-lg">
              Centralisez, structurez et exposez vos données produits grâce à notre API. Simple à intégrer, rapide à consommer.
            </p>
            <NuxtLink
              to="/api-plans"
              class="mt-6 inline-block rounded-md bg-indigo-600 px-5 py-2.5 text-white font-semibold shadow hover:bg-indigo-500"
            >
              En savoir plus
            </NuxtLink>
          </div>
          <div class="w-full lg:w-1/2">
            <img
              src="/images/pharma-api.png"
              alt="Illustration API pharmaceutique"
              class="w-full max-w-md mx-auto rounded-xl shadow"
            />
          </div>
        </div>

        <!-- Feature Cards -->
        <div class="mt-16 sm:mt-20 lg:mt-24">
          <dl class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <div class="flex flex-col">
              <dt class="text-base font-semibold leading-7 text-gray-900">Fiches Produits</dt>
              <dd class="mt-4 text-base leading-7 text-gray-600">
                Accédez aux informations détaillées des produits pharmaceutiques à 0,70€ par fiche
              </dd>
            </div>
            <div class="flex flex-col">
              <dt class="text-base font-semibold leading-7 text-gray-900">Accès API</dt>
              <dd class="mt-4 text-base leading-7 text-gray-600">
                Choisissez parmi différents quotas API en commençant par 100 requêtes gratuites
              </dd>
            </div>
            <div class="flex flex-col">
              <dt class="text-base font-semibold leading-7 text-gray-900">Plateforme Sécurisée</dt>
              <dd class="mt-4 text-base leading-7 text-gray-600">
                Authentification et paiements sécurisés avec Firebase et Stripe
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  </main>
</template>