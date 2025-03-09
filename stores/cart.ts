import { defineStore } from 'pinia'

interface CartItem {
  productId: string
  title: string
  short_desc: string
  image_url?: string
  cip_code: string
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as CartItem[]
  }),

  getters: {
    totalItems: (state) => state.items.length,
    totalPrice: (state) => state.items.length * 0.70
  },

  actions: {
    addToCart(product: { 
      id: string, 
      title: string, 
      short_desc: string, 
      image_url?: string,
      cip_code: string 
    }) {
      const existingItem = this.items.find(item => item.productId === product.id)
      
      if (!existingItem) {
        this.items.push({
          productId: product.id,
          title: product.title,
          short_desc: product.short_desc,
          image_url: product.image_url,
          cip_code: product.cip_code
        })
      }
    },

    removeFromCart(productId: string) {
      const index = this.items.findIndex(item => item.productId === productId)
      if (index > -1) {
        this.items.splice(index, 1)
      }
    },

    clearCart() {
      this.items = []
    }
  },

  persist: true
})