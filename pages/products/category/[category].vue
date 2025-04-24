<template>
  <div class="bg-white">
    <div
      class="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8"
    >
      <h1
        class="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 mb-8"
      >
        Produits de la catégorie {{ category }}
        <template v-if="subCategory1">
          <span class="text-xl sm:text-2xl font-semibold text-gray-700">
            > {{ subCategory1 }}
          </span>
          <template v-if="subCategory2">
            <span class="text-lg sm:text-xl font-medium text-gray-600">
              > {{ subCategory2 }}
            </span>
          </template>
        </template>
      </h1>

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

      <!-- Products grid -->
      <div
        v-else
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
      >
        <NuxtLink
          v-for="product in products"
          :key="product.codereferent"
          :to="`/products/${product.id}`"
          class="group flex flex-col justify-between border rounded-md p-4 bg-white shadow-sm h-full min-h-[450px] hover:shadow-md transition-shadow duration-200"
        >
          <!-- Image -->
          <div
            class="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md bg-gray-200"
          >
            <img
              :src="product.image_url || '/images/placeholder-product.png'"
              :alt="product.title"
              class="h-full w-full object-cover object-center"
            />
          </div>

          <!-- Product info -->
          <div class="mt-4 flex-1 flex flex-col">
            <div>
              <h3 class="text-sm font-medium text-gray-700">
                {{ product.title }}
              </h3>
              <p class="mt-1 text-sm text-gray-500">{{ product.brand }}</p>
              <p class="mt-1 text-xs text-gray-400">
                Code Réferent (CIP ou EAN): {{ product.codereferent }}
              </p>
            </div>
            <p class="mt-2 text-sm text-gray-600 line-clamp-2">
              {{ product.short_desc }}
            </p>
            <p class="mt-2 text-xs text-gray-500">
              {{ product.categorie }}
              <template v-if="product.sous_categorie_1">
                > {{ product.sous_categorie_1 }}
                <template v-if="product.sous_categorie_2">
                  > {{ product.sous_categorie_2 }}
                </template>
              </template>
            </p>

            <!-- Price + Button -->
            <div class="mt-auto pt-4 flex items-center justify-between">
              <p class="text-sm font-medium text-gray-900">0.70€</p>
              <button
                @click.prevent="addToCart(product)"
                class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                :disabled="isInCart(product.id)"
              >
                {{
                  isInCart(product.id)
                    ? "Déjà dans le panier"
                    : "Ajouter au panier"
                }}
              </button>
            </div>
          </div>
        </NuxtLink>
      </div>

      <!-- Pagination -->
      <div
        v-if="pagination"
        class="mt-8 flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6"
      >
        <div class="flex flex-1 justify-between sm:hidden">
          <button
            :disabled="currentPage === 1"
            @click="currentPage--"
            class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            :class="{ 'opacity-50 cursor-not-allowed': currentPage === 1 }"
          >
            Précédent
          </button>
          <button
            :disabled="!pagination.hasMore"
            @click="currentPage++"
            class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            :class="{ 'opacity-50 cursor-not-allowed': !pagination.hasMore }"
          >
            Suivant
          </button>
        </div>
        <div
          class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between"
        >
          <div>
            <p class="text-sm text-gray-700">
              Affichage de
              <span class="font-medium">{{
                (currentPage - 1) * limit + 1
              }}</span>
              à
              <span class="font-medium">{{
                Math.min(currentPage * limit, pagination.total)
              }}</span>
              sur
              <span class="font-medium">{{ pagination.total }}</span> résultats
            </p>
          </div>
          <div>
            <nav
              class="isolate inline-flex -space-x-px rounded-md shadow-sm"
              aria-label="Pagination"
            >
              <button
                @click="currentPage > 1 ? currentPage-- : null"
                :disabled="currentPage === 1"
                class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                :class="{ 'opacity-50 cursor-not-allowed': currentPage === 1 }"
              >
                Précédent
              </button>
              <button
                @click="pagination.hasMore ? currentPage++ : null"
                :disabled="!pagination.hasMore"
                class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                :class="{
                  'opacity-50 cursor-not-allowed': !pagination.hasMore,
                }"
              >
                Suivant
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import { useCartStore } from "~/stores/cart";
import { useProductsStore } from "~/stores/products";
import { useToast } from "vue-toastification";

const route = useRoute();
const cartStore = useCartStore();
const productsStore = useProductsStore();
const toast = useToast();

const loading = ref(false);
const error = ref(null);
const currentPage = ref(1);
const limit = 12;

const category = computed(() => decodeURIComponent(route.params.category));
const subCategory1 = computed(() => route.query.subCategory1?.toString() || "");
const subCategory2 = computed(() => route.query.subCategory2?.toString() || "");
const products = computed(() => productsStore.products);
const pagination = computed(() => productsStore.pagination);

// Charger les produits au montage et quand la page change
onMounted(async () => {
  await fetchProducts();
});

watch([currentPage, category, subCategory1, subCategory2], async () => {
  await fetchProducts();
});

const fetchProducts = async () => {
  loading.value = true;
  error.value = null;

  try {
    if (subCategory2.value) {
      await productsStore.fetchProductsBySubCategory2(
        category.value,
        subCategory1.value,
        subCategory2.value,
        currentPage.value,
        limit
      );
    } else if (subCategory1.value) {
      await productsStore.fetchProductsBySubCategory1(
        category.value,
        subCategory1.value,
        currentPage.value,
        limit
      );
    } else {
      await productsStore.fetchProductsByCategory(
        category.value,
        currentPage.value,
        limit
      );
    }
  } catch (err) {
    console.error("Erreur lors du chargement des produits:", err);
    error.value = "Erreur lors du chargement des produits";
  } finally {
    loading.value = false;
  }
};

const addToCart = (product) => {
  if (!isInCart(product.id)) {
    try {
      cartStore.addToCart({
        productId: product.id,
        title: product.title,
        short_desc: product.short_desc,
        image_url: product.image_url,
        codereferent: product.codereferent,
        price: 0.7,
        quantity: 1
      });
      toast.success("Produit ajouté au panier");
    } catch (error) {
      console.error("Erreur lors de l'ajout au panier:", error);
      toast.error("Erreur lors de l'ajout au panier");
    }
  }
};

const isInCart = (productId) => {
  return cartStore.items.some((item) => item.productId === productId);
};
</script>
