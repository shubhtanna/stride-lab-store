import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { CartItem } from '../types'
import { FREE_SHIPPING_FROM, SHIPPING_FEE } from '../lib/format'

type CartState = {
  items: CartItem[]
  count: number
  subtotal: number
  shipping: number
  total: number
  isOpen: boolean
  open: () => void
  close: () => void
  add: (item: Omit<CartItem, 'qty'>, qty?: number) => void
  setQty: (productId: string, size: number, qty: number) => void
  remove: (productId: string, size: number) => void
  clear: () => void
}

const CartContext = createContext<CartState | null>(null)
const STORAGE_KEY = 'stridelab.cart.v1'

function load(): CartItem[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(load)
  const [isOpen, setOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const value = useMemo<CartState>(() => {
    const subtotal = items.reduce((s, i) => s + i.unitPrice * i.qty, 0)
    const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_FEE
    return {
      items,
      count: items.reduce((s, i) => s + i.qty, 0),
      subtotal,
      shipping,
      total: subtotal + shipping,
      isOpen,
      open: () => setOpen(true),
      close: () => setOpen(false),
      add: (item, qty = 1) => {
        setItems((prev) => {
          const hit = prev.find((p) => p.productId === item.productId && p.size === item.size)
          if (hit) return prev.map((p) => (p === hit ? { ...p, qty: Math.min(p.qty + qty, 5) } : p))
          return [...prev, { ...item, qty }]
        })
        setOpen(true)
      },
      setQty: (productId, size, qty) =>
        setItems((prev) =>
          prev
            .map((p) => (p.productId === productId && p.size === size ? { ...p, qty: Math.max(0, Math.min(qty, 5)) } : p))
            .filter((p) => p.qty > 0),
        ),
      remove: (productId, size) => setItems((prev) => prev.filter((p) => !(p.productId === productId && p.size === size))),
      clear: () => setItems([]),
    }
  }, [items, isOpen])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
