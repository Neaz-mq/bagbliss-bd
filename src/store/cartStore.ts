import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ICartItem } from '@/types'

interface CartStore {
  items: ICartItem[]
  isOpen: boolean
  addItem: (item: ICartItem) => void
  removeItem: (productId: string, color: string) => void
  updateQuantity: (productId: string, color: string, qty: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  getItemCount: () => number
  getSubtotal: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (newItem) => {
        set((state) => {
          const existing = state.items.find(
            (i) =>
              i.product._id === newItem.product._id &&
              i.selectedColor === newItem.selectedColor
          )
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product._id === newItem.product._id &&
                i.selectedColor === newItem.selectedColor
                  ? { ...i, quantity: i.quantity + newItem.quantity }
                  : i
              ),
            }
          }
          return { items: [...state.items, newItem] }
        })
      },

      removeItem: (productId, color) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.product._id === productId && i.selectedColor === color)
          ),
        }))
      },

      updateQuantity: (productId, color, qty) => {
        if (qty <= 0) {
          get().removeItem(productId, color)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.product._id === productId && i.selectedColor === color
              ? { ...i, quantity: qty }
              : i
          ),
        }))
      },

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      getItemCount: () => {
        return get().items.reduce((total, i) => total + i.quantity, 0)
      },

      getSubtotal: () => {
        return get().items.reduce((total, i) => total + i.price * i.quantity, 0)
      },
    }),
    {
      name: 'bagbliss-cart',
    }
  )
)
