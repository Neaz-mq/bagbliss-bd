import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ── Validate MongoDB ObjectId (24 hex chars) ───────────────────────────────
const isValidObjectId = (id: string) =>
  typeof id === 'string' && /^[a-f\d]{24}$/i.test(id)

interface WishlistStore {
  items: string[]
  hasHydrated: boolean
  setHasHydrated: (v: boolean) => void
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
      hasHydrated: false,
      setHasHydrated: (v) => set({ hasHydrated: v }),

      // 1. Fetch from MongoDB — merge with local, never overwrite
      fetchWishlist: async () => {
        try {
          const res = await fetch('/api/wishlist')
          if (!res.ok) return
          const data = await res.json()
          if (Array.isArray(data.items)) {
            const validIds = data.items.filter(isValidObjectId)
            set((state) => ({
              items: [...new Set([...state.items, ...validIds])],
            }))
          }
        } catch (error) {
          console.error('Failed to sync wishlist with DB', error)
        }
      },

      // 2. Add item — reject invalid IDs
      addItem: async (productId) => {
        if (!isValidObjectId(productId)) {
          console.error('Invalid productId rejected by wishlist:', productId)
          return
        }
        set((state) => ({
          items: state.items.includes(productId)
            ? state.items
            : [...state.items, productId],
        }))
        await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, action: 'add' }),
        })
      },

      // 3. Remove item
      removeItem: async (productId) => {
        set((state) => ({
          items: state.items.filter((id) => id !== productId),
        }))
        await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, action: 'remove' }),
        })
      },

      // 4. Toggle
      toggleItem: async (productId) => {
        if (!isValidObjectId(productId)) {
          console.error('Invalid productId rejected by toggleItem:', productId)
          return
        }
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
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.items = state.items.filter(isValidObjectId)
          state.setHasHydrated(true)
        }
      },
    }
  )
)