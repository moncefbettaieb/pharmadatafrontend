import { defineStore } from "pinia";
import { httpsCallable, getFunctions } from "firebase/functions";
import type { Product } from "~/types/product";
import { getProductByCip } from "~/services/api";

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

interface ProductsState {
  products: Product[];
  pagination: Pagination | null;
  loading: boolean;
  error: string | null;
  totalProducts: number;
  searchResults: Product[];
  searchLoading: boolean;
  searchError: string | null;
}

interface FetchProductsParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  categorie?: string;
  sous_categorie_1?: string;
  sous_categorie_2?: string;
  brand?: string;
}

const ALLOWED_ORIGINS = [
  "https://pharmadataapi.fr",
  "https://www.pharmadataapi.fr",
  "https://pharmadata-frontend-staging-383194447870.europe-west9.run.app",
  "https://pharmadata-frontend-dev-383194447870.europe-west9.run.app",
  "http://localhost:3000",
];

const validateRequest = async (req: any) => {
  // Vérifier l'origine de la requête
  const origin = req.headers.origin || req.headers.referer;
  if (
    !origin ||
    !ALLOWED_ORIGINS.some((allowed) => origin.startsWith(allowed))
  ) {
    throw new HttpsError("permission-denied", "Origin not allowed");
  }

  // Vérifier le token Bearer
  const tokenId = await validateAndExtractToken(req.headers.authorization);
  if (!tokenId) {
    throw new HttpsError("unauthenticated", "Invalid or missing token");
  }

  return tokenId;
};

export const useProductsStore = defineStore("products", {
  state: (): ProductsState => ({
    products: [],
    pagination: null,
    loading: false,
    error: null,
    totalProducts: 0,
    searchResults: [],
    searchLoading: false,
    searchError: null,
  }),

  getters: {
    getCategories: (state) => {
      const categories = new Set<string>();
      state.products.forEach((product) => {
        if (product.categorie) {
          categories.add(product.categorie);
        }
      });
      return Array.from(categories).sort();
    },

    getBrands: (state) => {
      const brands = new Set<string>();
      state.products.forEach((product) => {
        if (product.brand) {
          brands.add(product.brand);
        }
      });
      return Array.from(brands).sort();
    },

    getSubCategories1: (state) => (category: string) => {
      const subCategories = new Set<string>();
      state.products
        .filter((product) => product.categorie === category)
        .forEach((product) => {
          if (product.sous_categorie_1) {
            subCategories.add(product.sous_categorie_1);
          }
        });
      return Array.from(subCategories).sort();
    },

    getSubCategories2: (state) => (category: string, subCategory1: string) => {
      const subCategories = new Set<string>();
      state.products
        .filter(
          (product) =>
            product.categorie === category &&
            product.sous_categorie_1 === subCategory1
        )
        .forEach((product) => {
          if (product.sous_categorie_2) {
            subCategories.add(product.sous_categorie_2);
          }
        });
      return Array.from(subCategories).sort();
    },

    getProductsByCategory:
      (state) =>
      (category: string, subCategory1?: string, subCategory2?: string) => {
        return state.products.filter((product) => {
          if (product.categorie !== category) return false;
          if (subCategory1 && product.sous_categorie_1 !== subCategory1)
            return false;
          if (subCategory2 && product.sous_categorie_2 !== subCategory2)
            return false;
          return true;
        });
      },

    getProductsByBrand: (state) => (brand: string) => {
      return state.products.filter((product) => product.brand === brand);
    },
  },

  actions: {
    async fetchProducts(params: FetchProductsParams = {}) {
      this.loading = true;
      this.error = null;

      try {
        const functions = getFunctions(undefined, "europe-west9");
        const getProductsCall = httpsCallable(functions, "getProducts");
        const result = await getProductsCall(params);

        if (!result.data || typeof result.data !== "object") {
          throw new Error("Réponse invalide du serveur");
        }

        const data = result.data as {
          products: Product[];
          pagination: Pagination;
        };

        this.products = data.products;
        this.pagination = data.pagination;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Une erreur est survenue";
        this.error = errorMessage;
        if (error instanceof Error) {
          console.error(
            `Erreur lors du chargement des fiches produits: ${error.message}`,
            {
              error,
              params,
            }
          );
        } else {
          console.error(
            "Erreur inconnue lors du chargement des fiches produits:",
            {
              error,
              params,
            }
          );
        }
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async getProductById(id: string): Promise<Product> {
      this.loading = true;
      this.error = null;

      try {
        const functions = getFunctions(undefined, "europe-west9");
        const getProductCall = httpsCallable(functions, "getProductById");
        const result = await getProductCall({ id });

        if (!result.data || typeof result.data !== "object") {
          throw new Error("Réponse invalide du serveur");
        }

        return result.data as Product;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Une erreur est survenue";
        this.error = errorMessage;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchProductsByCategory(category: string, page = 1, limit = 12) {
      this.loading = true;
      this.error = null;

      try {
        const functions = getFunctions(undefined, "europe-west9");
        const getProductsByCategoryCall = httpsCallable(
          functions,
          "getProductsByCategory"
        );
        const result = await getProductsByCategoryCall({
          category,
          page,
          limit,
        });

        if (!result.data || typeof result.data !== "object") {
          throw new Error("Réponse invalide du serveur");
        }

        const data = result.data as {
          products: Product[];
          pagination: Pagination;
        };

        this.products = data.products;
        this.pagination = data.pagination;
      } catch (error) {
        console.error("Error fetching products by category:", error);
        this.error = "Error fetching products by category";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchProductsByBrand(brand: string, page = 1, limit = 12) {
      this.loading = true;
      this.error = null;

      try {
        const functions = getFunctions(undefined, "europe-west9");
        const getProductsByBrandCall = httpsCallable(
          functions,
          "getProductsByBrand"
        );
        const result = await getProductsByBrandCall({
          brand,
          page,
          limit,
        });

        if (!result.data || typeof result.data !== "object") {
          throw new Error("Réponse invalide du serveur");
        }

        const data = result.data as {
          products: Product[];
          pagination: Pagination;
        };

        this.products = data.products;
        this.pagination = data.pagination;
      } catch (error) {
        console.error("Error fetching products by brand:", error);
        this.error = "Error fetching products by brand";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchProductsBySubCategory1(
      category: string,
      subCategory1: string,
      page = 1,
      limit = 12
    ) {
      this.loading = true;
      this.error = null;

      try {
        const functions = getFunctions(undefined, "europe-west9");
        const getProductsByCategoryCall = httpsCallable(
          functions,
          "getProductsByCategory"
        );
        const result = await getProductsByCategoryCall({
          category,
          subCategory1,
          page,
          limit,
        });

        if (!result.data || typeof result.data !== "object") {
          throw new Error("Réponse invalide du serveur");
        }

        const data = result.data as {
          products: Product[];
          pagination: Pagination;
        };

        this.products = data.products;
        this.pagination = data.pagination;
      } catch (error) {
        console.error("Error fetching products by subcategory1:", error);
        this.error = "Error fetching products by subcategory1";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchProductsBySubCategory2(
      category: string,
      subCategory1: string,
      subCategory2: string,
      page = 1,
      limit = 12
    ) {
      this.loading = true;
      this.error = null;

      try {
        const functions = getFunctions(undefined, "europe-west9");
        const getProductsByCategoryCall = httpsCallable(
          functions,
          "getProductsByCategory"
        );
        const result = await getProductsByCategoryCall({
          category,
          subCategory1,
          subCategory2,
          page,
          limit,
        });

        if (!result.data || typeof result.data !== "object") {
          throw new Error("Réponse invalide du serveur");
        }

        const data = result.data as {
          products: Product[];
          pagination: Pagination;
        };

        this.products = data.products;
        this.pagination = data.pagination;
      } catch (error) {
        console.error("Error fetching products by subcategory2:", error);
        this.error = "Error fetching products by subcategory2";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async getTotalProducts() {
      try {
        const functions = getFunctions(undefined, "europe-west9");
        const getProductsCall = httpsCallable(functions, "getProducts");
        const result = await getProductsCall({ page: 1, limit: 1 });

        if (!result.data || typeof result.data !== "object") {
          throw new Error("Réponse invalide du serveur");
        }

        const data = result.data as {
          pagination: Pagination;
        };

        this.totalProducts = data.pagination.total;
        return this.totalProducts;
      } catch (error) {
        console.error("Error fetching total products:", error);
        throw error;
      }
    },

    async searchByCodeReferent(codeReferent: string) {
      if (!codeReferent || codeReferent.length < 3) {
        this.searchResults = [];
        return;
      }

      this.searchLoading = true;
      this.searchError = null;

      try {
        const functions = getFunctions(undefined, 'europe-west9');
        const searchProductsCall = httpsCallable(functions, "searchProducts");
        const result = await searchProductsCall({ query: codeReferent });

        if (!result.data || typeof result.data !== "object") {
          throw new Error("Réponse invalide du serveur");
        }

        const data = result.data as {
          products: Product[];
        };

        this.searchResults = data.products;
      } catch (error: any) {
        console.error("Error searching products:", error);
        this.searchError = error.message;
        this.searchResults = [];
      } finally {
        this.searchLoading = false;
      }
    },
  },
});
