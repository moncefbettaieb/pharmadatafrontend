<template>
    <div class="bg-white min-h-screen py-12">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <!-- Loading state -->
      <div
        v-if="loading"
        class="flex justify-center items-center min-h-[400px]"
      >
        <div
          class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"
        ></div>
        </div>
    
        <!-- Error state -->
        <div v-else-if="error" class="text-center py-12">
          <p class="text-red-600 mb-4">{{ error }}</p>
          <NuxtLink
            to="/products"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Retour aux produits
          </NuxtLink>
        </div>
    
        <!-- Product details -->
      <div
        v-else-if="product"
        class="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-10"
      >
          <!-- Images section -->
          <div class="relative">
            <!-- Main image -->
            <div class="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg">
              <img
                :src="currentImage || '/images/placeholder-product.png'"
                :alt="product.title"
                class="h-full w-full object-cover object-center"
              />
            </div>
    
            <!-- Thumbnails -->
          <div
            v-if="product.images && product.images.length > 1"
            class="mt-4 grid grid-cols-4 gap-4"
          >
              <button
                v-for="(image, index) in product.images.slice(0, 4)"
                :key="index"
                @click="currentImage = image"
                class="relative aspect-h-1 aspect-w-1 overflow-hidden rounded-md"
                :class="{ 'ring-2 ring-indigo-500': currentImage === image }"
              >
                <img
                  :src="image"
                  :alt="`Vue ${index + 1} de ${product.title}`"
                  class="h-full w-full object-cover object-center"
                />
              </button>
            </div>
          </div>
    
          <!-- Product info -->
          <div>
          <h1 class="text-3xl font-bold tracking-tight text-gray-900">
            {{ product.title }}
          </h1>
            
            <div class="mt-4">
              <h2 class="sr-only">Informations produit</h2>
              <p class="text-lg text-gray-900">0.70€</p>
            </div>
    
            <!-- Brand -->
            <div class="mt-4">
              <h3 class="text-sm font-medium text-gray-900">Marque</h3>
            <NuxtLink
              :to="`/products/brand/${encodeURIComponent(product.brand)}`"
              class="mt-2 text-sm text-indigo-600 hover:text-indigo-800"
            >
              {{ product.brand }}
            </NuxtLink>
            </div>
    
            <!-- CIP -->
            <div class="mt-4">
            <h3 class="text-sm font-medium text-gray-900">
              Code Réferent (CIP ou EAN)
            </h3>
            <p class="mt-2 text-sm text-gray-500">{{ product.codereferent }}</p>
            </div>
    
            <!-- Categories -->
            <div class="mt-4">
              <h3 class="text-sm font-medium text-gray-900">Catégories</h3>
              <div class="mt-2">
              <NuxtLink
                :to="`/products/category/${encodeURIComponent(product.categorie)}`"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mr-2 hover:bg-indigo-200"
              >
                  {{ product.categorie }}
              </NuxtLink>
              <NuxtLink
                v-if="product.sous_categorie_1"
                :to="`/products/category/${encodeURIComponent(product.categorie)}?subCategory1=${encodeURIComponent(product.sous_categorie_1)}`"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2 hover:bg-blue-200"
              >
                  {{ product.sous_categorie_1 }}
              </NuxtLink>
              <NuxtLink
                v-if="product.sous_categorie_2"
                :to="`/products/category/${encodeURIComponent(product.categorie)}?subCategory1=${encodeURIComponent(product.sous_categorie_1)}&subCategory2=${encodeURIComponent(product.sous_categorie_2)}`"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200"
              >
                  {{ product.sous_categorie_2 }}
              </NuxtLink>
              </div>
            </div>
    
            <!-- Description -->
            <div class="mt-4">
              <h3 class="text-sm font-medium text-gray-900">Description</h3>
              <p class="mt-2 text-sm text-gray-500">{{ product.short_desc }}</p>
            </div>
    
            <!-- Add to cart -->
            <div class="mt-8 flex">
              <button
                @click="addToCart"
                :disabled="isInCart"
                class="flex-1 bg-indigo-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-indigo-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
              {{
                isInCart
                  ? "Déjà dans le panier"
                  : "Ajouter la fiche au panier pour 0.70€"
              }}
              </button>
            </div>
    
            <!-- Back button -->
            <div class="mt-8">
              <NuxtLink
                to="/products"
                class="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                ← Retour aux produits
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
    </template>
    
    <script setup lang="ts">
import { useProductsStore } from "~/stores/products";
import { useCartStore } from "~/stores/cart";
import { useToast } from "vue-toastification";
import type { Product } from "~/types/product";
import type { CartItem } from "~/stores/cart";
    
const route = useRoute();
const productsStore = useProductsStore();
const cartStore = useCartStore();
const toast = useToast();
    
const loading = ref(true);
const error = ref<string | null>(null);
const product = ref<Product | null>(null);
const currentImage = ref<string | null>(null);
    
    const isInCart = computed(() => {
  if (!product.value) return false;
  return cartStore.items.some(
    (item: CartItem) => item.productId === product.value?.id
  );
});
    
    const addToCart = () => {
  if (!product.value) return;

      const item = {
        productId: product.value.id,
        title: product.value.title,
        short_desc: product.value.short_desc,
        image_url: product.value.image_url,
    codereferent: product.value.codereferent,
  };

  cartStore.addToCart(item);
};
    
    // Fetch product data
    onMounted(async () => {
      try {
    const productId = route.params.id as string;
    product.value = await productsStore.getProductById(productId);
        
    if (
      product.value?.images &&
      Array.isArray(product.value.images) &&
      product.value.images.length > 0
    ) {
      currentImage.value = product.value.images[0];
        } else if (product.value?.image_url) {
      currentImage.value = product.value.image_url;
        }
      } catch (err) {
    error.value = "Erreur lors du chargement du produit";
    console.error("Error fetching product:", err);
      } finally {
    loading.value = false;
      }
});
    
    // Meta tags
useHead(() => ({
  title: product.value
    ? `${product.value.title} - PharmaData`
    : "Produit - PharmaData",
      meta: [
    {
      name: "description",
      content: product.value?.short_desc || "Détails du produit",
    },
    {
      name: "keywords",
      content: product.value
        ? `${product.value.brand}, ${product.value.categorie}, ${
            product.value.sous_categorie_1 || ""
          }, ${product.value.sous_categorie_2 || ""}, pharmacie, médicament`
        : "pharmacie, médicament",
    },

    // Open Graph tags
    {
      property: "og:title",
      content: product.value
        ? `${product.value.title} - PharmaData`
        : "Produit - PharmaData",
    },
    {
      property: "og:description",
      content: product.value?.short_desc || "Détails du produit",
    },
    { property: "og:type", content: "product" },
    {
      property: "og:image",
      content: currentImage.value || "/images/placeholder-product.png",
    },
    {
      property: "og:url",
      content: `${process.client ? window.location.origin : ""}/products/${
        route.params.id
      }`,
    },

    // Twitter Card tags
    { name: "twitter:card", content: "product" },
    {
      name: "twitter:title",
      content: product.value
        ? `${product.value.title} - PharmaData`
        : "Produit - PharmaData",
    },
    {
      name: "twitter:description",
      content: product.value?.short_desc || "Détails du produit",
    },
    {
      name: "twitter:image",
      content: currentImage.value || "/images/placeholder-product.png",
    },
  ],
  script: [
    {
      type: "application/ld+json",
      children: computed(() => {
        if (!product.value) return "{}";
        return JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.value.title,
          description: product.value.short_desc,
          brand: {
            "@type": "Brand",
            name: product.value.brand,
          },
          sku: product.value.codereferent,
          image:
            product.value.images?.[0] ||
            product.value.image_url ||
            "images/placeholder-product.png",
          category: product.value.categorie,
          offers: {
            "@type": "Offer",
            price: "0.70",
            priceCurrency: "EUR",
            availability: "https://schema.org/InStock",
          },
        });
      }),
    },
  ],
}));
    </script>
