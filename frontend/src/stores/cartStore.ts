import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product } from '../data/products'

export type CartItem = {
  product: Product
  quantity: number
}

type CartState = {
  items: CartItem[]
  itemCount: number
  addProduct: (product: Product) => void
  removeProduct: (productId: string) => void
  increaseQuantity: (productId: string) => void
  decreaseQuantity: (productId: string) => void
  clearCart: () => void
  clearCartIfMatches: (items: Array<{ productId: string | null; quantity: number }>) => void
}

export const useCartStore = create<CartState>()(persist((set) => ({
  items: [],
  itemCount: 0,
  addProduct: (product) => set((state) => {
    const existing = state.items.find((item) => item.product.id === product.id)
    const items = existing
      ? state.items.map((item) => item.product.id === product.id ? { ...item, quantity: Math.min(50, item.quantity + 1) } : item)
      : [...state.items, { product, quantity: 1 }]
    return { items, itemCount: items.reduce((count, item) => count + item.quantity, 0) }
  }),
  removeProduct: (productId) => set((state) => {
    const items = state.items.filter((item) => item.product.id !== productId)
    return { items, itemCount: items.reduce((count, item) => count + item.quantity, 0) }
  }),
  increaseQuantity: (productId) => set((state) => {
    const items = state.items.map((item) => item.product.id === productId ? { ...item, quantity: Math.min(50, item.quantity + 1) } : item)
    return { items, itemCount: items.reduce((count, item) => count + item.quantity, 0) }
  }),
  decreaseQuantity: (productId) => set((state) => {
    const items = state.items.map((item) => item.product.id === productId ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item)
    return { items, itemCount: items.reduce((count, item) => count + item.quantity, 0) }
  }),
  clearCart: () => set({ items: [], itemCount: 0 }),
  clearCartIfMatches: (orderItems) => set((state) => {
    const orderQuantities = new Map(orderItems.map((item) => [item.productId, item.quantity]))
    const matches = orderItems.length === state.items.length && state.items.every((item) => orderQuantities.get(item.product.id) === item.quantity)
    return matches ? { items: [], itemCount: 0 } : state
  }),
}), { name: 'berry-cart', version: 1 }))
