import { defineStore } from "pinia";
import persistedState from "pinia-plugin-persistedstate";

export interface CartItem {
  productId: string;
  title: string;
  short_desc: string;
  image_url?: string;
  codereferent: string;
}

export const useCartStore = defineStore("cart", {
  state: () => ({
    items: [] as CartItem[],
  }),

  getters: {
    totalItems: (state) => state.items.length,
    totalPrice: (state) => state.items.length * 0.7,
  },

  actions: {
    addToCart(product: {
      productId: string;
      title: string;
      short_desc: string;
      image_url?: string;
      codereferent: string;
    }) {
      if (!product.productId) {
        console.error(
          "Tentative d'ajout d'un produit sans ID au panier:",
          product
        );
        return;
      }

      const existingItem = this.items.find(
        (item) => item.productId === product.productId
      );

      if (!existingItem) {
        this.items.push({
          productId: product.productId,
          title: product.title,
          short_desc: product.short_desc,
          image_url: product.image_url,
          codereferent: product.codereferent,
        });
      }
    },

    removeFromCart(productId: string) {
      const index = this.items.findIndex(
        (item) => item.productId === productId
      );
      if (index > -1) {
        this.items.splice(index, 1);
      }
    },

    clearCart() {
      this.items = [];
    },
  },

  persist: {
    key: "pharma-cart",
    storage: localStorage,
  },
});
