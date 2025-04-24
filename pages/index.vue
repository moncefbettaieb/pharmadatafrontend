<template>
  <main>
    <!-- Hero Section -->
    <div class="relative isolate">
      <div
        class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32"
      >
        <div class="mx-auto max-w-2xl text-center">
          <h1
            class="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900"
          >
            La plateforme API des données&nbsp;<span class="text-indigo-600"
              >pharmaceutiques &amp; parapharmaceutiques</span
            >
          </h1>
          <p
            class="mt-6 text-base sm:text-lg md:text-xl leading-8 text-gray-600"
          >
            Intégrez, en quelques minutes, les données essentielles (CIP 13,
            EAN, composition, catégorie…) de plus de
            <span class="font-semibold text-gray-900">{{
              totalProducts.toLocaleString()
            }}</span>
            médicaments, dispositifs médicaux et produits de santé et
            parapharmacie — mises à jour régulière. Achetez une fiche détaillée
            à l'unité ou branchez-vous à notre API REST haute disponibilité pour
            alimenter directement vos applications.
          </p>
          <div
            class="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
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
          <h2 class="text-base font-semibold leading-7 text-indigo-600">
            Plateforme de Données
          </h2>
          <p
            class="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-gray-900"
          >
            Tout ce dont votre S.I. a besoin pour exploiter les données de santé
          </p>
        </div>

        <!-- Custom Illustration Section -->
        <div
          class="mt-12 flex flex-col-reverse lg:flex-row items-center gap-10"
        >
          <div class="w-full lg:w-1/2 text-center lg:text-left">
            <h3 class="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">
              Un accès&nbsp;API instantané et sécurisé à vos fiches produits
            </h3>
            <p class="text-gray-600 text-base sm:text-lg">
              Centralisez, structurez et exposez vos données médicaments grâce à
              notre API. Réduisez votre time‑to‑market&nbsp;: une seule
              connexion, zéro maintenance.
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
              <dt class="text-base font-semibold leading-7 text-gray-900">
                Fiches Produits
              </dt>
              <dd class="mt-4 text-base leading-7 text-gray-600">
                Accédez aux informations détaillées des produits pharmaceutiques
                à 0,70€ par fiche
              </dd>
            </div>
            <div class="flex flex-col">
              <dt class="text-base font-semibold leading-7 text-gray-900">
                Accès API
              </dt>
              <dd class="mt-4 text-base leading-7 text-gray-600">
                Choisissez parmi différents quotas API en commençant par 100
                requêtes gratuites
              </dd>
            </div>
            <div class="flex flex-col">
              <dt class="text-base font-semibold leading-7 text-gray-900">
                Plateforme Sécurisée
              </dt>
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

<script setup>
import { useHead } from "#imports";
import { useProductsStore } from "~/stores/products";

const productsStore = useProductsStore();
const totalProducts = ref(0);

onMounted(async () => {
  try {
    totalProducts.value = await productsStore.getTotalProducts();
  } catch (error) {
    console.error("Error fetching total products:", error);
  }
});

useHead({
  title: "PharmaData | API & Fiches Produits Médicaments & Parapharmacie",
  meta: [
    {
      name: "description",
      content:
        "PharmaData fournit une API REST sécurisée et des fiches produits détaillées sur plus de 30 000 médicaments, dispositifs médicaux et articles de parapharmacie — mises à jour quotidiennes, intégration rapide, conformité RGPD.",
    },
    {
      name: "keywords",
      content:
        "données pharmaceutiques, API médicament, fiche produit, base de données, parapharmacie, intégration SI, pharmacie, santé, CIP, DCI",
    },
    {
      property: "og:title",
      content: "PharmaData • Accès API aux données pharmaceutiques",
    },
    {
      property: "og:description",
      content:
        "Connectez votre système d'information à notre API sécurisée et obtenez en temps réel des données fiables sur les médicaments et produits de santé.",
    },
  ],
  script: [
    {
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Dataset",
        name: "PharmaData — Base de données pharmaceutiques",
        description:
          "API et fiches produits détaillées sur les médicaments et la parapharmacie pour les professionnels de santé et les éditeurs de S.I.",
        license: "https://pharmadata.com/terms",
      }),
    },
  ],
});
</script>
