import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WishlistStore {
  items: string[]
  addItem: (productId: string) => Promise<void>
  removeItem: (productId: string) => Promise<void>
  toggleItem: (productId: string) => Promise<void>
  fetchWishlist: () => Promise<void>
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
          // eslint-disable-next-line no-console
          console.error('Failed to sync wishlist with DB', error)
        }
      },

      // 2. Add item to both Local State and MongoDB
      addItem: async (productId) => {
        set((state) => ({
          items: [...state.items, productId],
        }))

        await fetch('/api/wishlist', {
          method: 'POST',
          body: JSON.stringify({ productId, action: 'add' }),
        })
      },

      // 3. Remove item from both Local State and MongoDB
      removeItem: async (productId) => {
        set((state) => ({
          items: state.items.filter((id) => id !== productId),
        }))

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

      isWishlisted: (productId) => get().items.includes(productId),

      getCount: () => get().items.length,
    }),
    {
      name: 'bagbliss-wishlist',
    }
  )
)