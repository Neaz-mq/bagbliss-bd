import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WishlistStore {
  items: string[]
  addItem: (productId: string) => Promise<void> // Changed to Promise
  removeItem: (productId: string) => Promise<void> // Changed to Promise
  toggleItem: (productId: string) => Promise<void> // Changed to Promise
  fetchWishlist: () => Promise<void> // Added this
  isWishlisted: (productId: string) => boolean
  getCount: () => number
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      // 1. Fetch from MongoDB on load
      fetchWishlist: async () => {
        try {
          const res = await fetch('/api/wishlist')
          const data = await res.json()
          if (data.items) {
            set({ items: data.items })
          }
        } catch (error) {
          console.error("Failed to sync wishlist with DB", error)
        }
      },

      // 2. Add item to both Local State and MongoDB
      addItem: async (productId) => {
        // Update UI immediately (Optimistic Update)
        set((state) => ({
          items: [...state.items, productId],
        }))

        // Sync with Database
        await fetch('/api/wishlist', {
          method: 'POST',
          body: JSON.stringify({ productId, action: 'add' }),
        })
      },

      // 3. Remove item from both Local State and MongoDB
      removeItem: async (productId) => {
        // Update UI immediately
        set((state) => ({
          items: state.items.filter((id) => id !== productId),
        }))

        // Sync with Database
        await fetch('/api/wishlist', {
          method: 'POST',
          body: JSON.stringify({ productId, action: 'remove' }),
        })
      },

      // 4. Toggle handles both Add/Remove
      toggleItem: async (productId) => {
        const { items } = get()
        if (items.includes(productId)) {
          await get().removeItem(productId)
        } else {
          await get().addItem(productId)
        }
      },

      isWishlisted: (productId) => {
        return get().items.includes(productId)
      },

      getCount: () => get().items.length,
    }),
    {
      name: 'bagbliss-wishlist',
    }
  )
)