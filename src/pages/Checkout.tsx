import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useTitle } from '../hooks/useCatalog'
import { formatPrice } from '../lib/format'

type Form = { email: string; phone: string; name: string; address: string; city: string; state: string; pincode: string }
const EMPTY: Form = { email: '', phone: '', name: '', address: '', city: '', state: '', pincode: '' }

export default function Checkout() {
  useTitle('Checkout')
  const { items, subtotal, shipping, total, clear } = useCart()
  const [form, setForm] = useState<Form>(EMPTY)
  const [payment, setPayment] = useState<'upi' | 'card' | 'cod'>('upi')
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({})
  const [placing, setPlacing] = useState(false)
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-32 text-center">
        <h1 className="font-display text-4xl font-black uppercase italic">Your bag is empty</h1>
        <Link to="/shop" className="mt-6 inline-block rounded-full bg-ink px-6 py-3 text-sm font-bold text-white">
          Continue shopping
        </Link>
      </div>
    )
  }

  const cod = payment === 'cod' ? 49 : 0

  const validate = () => {
    const e: typeof errors = {}
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email'
    if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\D/g, '').slice(-10))) e.phone = 'Enter a 10-digit mobile number'
    if (form.name.trim().length < 2) e.name = 'Enter your full name'
    if (form.address.trim().length < 6) e.address = 'Enter your full address'
    if (!form.city.trim()) e.city = 'Required'
    if (!form.state.trim()) e.state = 'Required'
    if (!/^\d{6}$/.test(form.pincode)) e.pincode = 'Enter a 6-digit PIN code'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const place = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validate()) return
    setPlacing(true)
    // Payment gateway hand-off goes here once the merchant account is live.
    await new Promise((r) => setTimeout(r, 900))
    const orderId = `SL${Date.now().toString().slice(-8)}`
    const summary = { orderId, total: total + cod, items: items.length, email: form.email, payment }
    sessionStorage.setItem('stridelab.lastOrder', JSON.stringify(summary))
    clear()
    navigate(`/order/${orderId}`)
  }

  const field = (key: keyof Form, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className="block">
      <span className="text-xs font-semibold text-muted">{label}</span>
      <input
        {...props}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className={`mt-1 w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none focus:border-ink ${errors[key] ? 'border-sale' : 'border-line'}`}
      />
      {errors[key] && <span className="mt-1 block text-xs text-sale">{errors[key]}</span>}
    </label>
  )

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-4xl font-black uppercase italic">Checkout</h1>
      <form onSubmit={place} className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-10">
          <section>
            <h2 className="mb-4 font-semibold">Contact</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {field('email', 'Email', { type: 'email', autoComplete: 'email' })}
              {field('phone', 'Mobile number', { type: 'tel', autoComplete: 'tel' })}
            </div>
          </section>
          <section>
            <h2 className="mb-4 font-semibold">Delivery address</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">{field('name', 'Full name', { autoComplete: 'name' })}</div>
              <div className="sm:col-span-2">{field('address', 'Flat, house no., street, area', { autoComplete: 'street-address' })}</div>
              {field('city', 'City', { autoComplete: 'address-level2' })}
              {field('state', 'State', { autoComplete: 'address-level1' })}
              {field('pincode', 'PIN code', { inputMode: 'numeric', maxLength: 6, autoComplete: 'postal-code' })}
            </div>
          </section>
          <section>
            <h2 className="mb-4 font-semibold">Payment</h2>
            <div className="space-y-2">
              {([
                ['upi', 'UPI', 'Google Pay, PhonePe, Paytm and more'],
                ['card', 'Credit / Debit card', 'Visa, Mastercard, RuPay'],
                ['cod', 'Cash on delivery', '₹49 handling fee'],
              ] as const).map(([id, label, hint]) => (
                <label key={id} className={`flex cursor-pointer items-center gap-3 rounded-xl border bg-white p-4 ${payment === id ? 'border-ink' : 'border-line'}`}>
                  <input type="radio" name="payment" checked={payment === id} onChange={() => setPayment(id)} />
                  <span>
                    <span className="block text-sm font-semibold">{label}</span>
                    <span className="block text-xs text-muted">{hint}</span>
                  </span>
                </label>
              ))}
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-3xl bg-white p-6 lg:sticky lg:top-28">
          <h2 className="font-semibold">Order summary</h2>
          <ul className="mt-4 divide-y divide-line">
            {items.map((i) => (
              <li key={`${i.productId}-${i.size}`} className="flex gap-3 py-3">
                <img src={i.image} alt="" className="h-16 w-16 rounded-lg object-cover" />
                <div className="flex-1 text-sm">
                  <p className="font-semibold">{i.name}</p>
                  <p className="text-muted">UK {i.size} · Qty {i.qty}</p>
                </div>
                <p className="text-sm font-semibold">{formatPrice(i.unitPrice * i.qty)}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatPrice(subtotal)}</dd></div>
            <div className="flex justify-between"><dt>Shipping</dt><dd>{shipping ? formatPrice(shipping) : 'Free'}</dd></div>
            {cod > 0 && <div className="flex justify-between"><dt>COD fee</dt><dd>{formatPrice(cod)}</dd></div>}
            <div className="flex justify-between border-t border-line pt-3 text-base font-bold"><dt>Total</dt><dd>{formatPrice(total + cod)}</dd></div>
          </dl>
          <button disabled={placing} className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-ink py-4 text-sm font-bold uppercase tracking-wide text-white disabled:opacity-60">
            <Lock size={14} /> {placing ? 'Placing order…' : payment === 'cod' ? 'Place order' : `Pay ${formatPrice(total + cod)}`}
          </button>
          <p className="mt-3 text-center text-xs text-muted">Demo store: no payment is taken and no order is shipped.</p>
        </aside>
      </form>
    </div>
  )
}
