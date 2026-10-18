import { Link } from 'react-router-dom'
import { Minus, Plus, X } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { FREE_SHIPPING_FROM, formatPrice } from '../lib/format'

export default function CartDrawer() {
  const { items, isOpen, close, setQty, remove, subtotal, count } = useCart()
  if (!isOpen) return null

  const toFree = Math.max(0, FREE_SHIPPING_FROM - subtotal)

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-ink/40" onClick={close} />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-paper shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <p className="font-display text-xl font-extrabold">Your bag ({count})</p>
          <button onClick={close} aria-label="Close cart">
            <X size={22} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="text-muted">Your bag is empty.</p>
            <Link to="/shop" onClick={close} className="rounded-full bg-ink px-6 py-3 text-sm font-bold text-white">
              Start shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="border-b border-line px-6 py-3 text-sm">
              {toFree > 0 ? (
                <p>
                  Add <b>{formatPrice(toFree)}</b> more for free shipping
                </p>
              ) : (
                <p className="font-medium">You've unlocked free shipping ✓</p>
              )}
            </div>
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-6">
              {items.map((i) => (
                <li key={`${i.productId}-${i.size}`} className="flex gap-4 py-5">
                  <img src={i.image} alt="" className="h-24 w-24 rounded-xl bg-white object-cover" />
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-2">
                      <div>
                        <p className="text-xs uppercase text-muted">{i.brand}</p>
                        <p className="font-semibold">{i.name}</p>
                        <p className="text-sm text-muted">UK {i.size}</p>
                      </div>
                      <button onClick={() => remove(i.productId, i.size)} aria-label="Remove" className="self-start text-muted">
                        <X size={16} />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center rounded-full border border-line">
                        <button className="p-2" onClick={() => setQty(i.productId, i.size, i.qty - 1)} aria-label="Decrease">
                          <Minus size={14} />
                        </button>
                        <span className="w-6 text-center text-sm">{i.qty}</span>
                        <button className="p-2" onClick={() => setQty(i.productId, i.size, i.qty + 1)} aria-label="Increase">
                          <Plus size={14} />
                        </button>
                      </div>
                      <p className="font-semibold">{formatPrice(i.unitPrice * i.qty)}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-line px-6 py-5">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span className="font-semibold">{formatPrice(subtotal)}</span>
              </div>
              <p className="mt-1 text-xs text-muted">Taxes included. Shipping calculated at checkout.</p>
              <Link
                to="/checkout"
                onClick={close}
                className="mt-4 block rounded-full bg-ink py-4 text-center text-sm font-bold uppercase tracking-wide text-white"
              >
                Checkout
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}
