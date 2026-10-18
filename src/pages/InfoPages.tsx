import { Link, useParams } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { useTitle } from '../hooks/useCatalog'
import { formatPrice } from '../lib/format'

export function OrderConfirmed() {
  useTitle('Order confirmed')
  const { orderId } = useParams()
  let order: { total: number; email: string; payment: string } | null = null
  try {
    const saved = JSON.parse(sessionStorage.getItem('stridelab.lastOrder') || 'null')
    if (saved?.orderId === orderId) order = saved
  } catch {
    /* ignore */
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <CheckCircle2 size={56} className="mx-auto" />
      <h1 className="font-display mt-6 text-4xl font-black uppercase italic">Thank you!</h1>
      <p className="mt-3">Your order <b>#{orderId}</b> is confirmed.</p>
      {order && (
        <p className="mt-2 text-sm text-muted">
          {formatPrice(order.total)} · {order.payment === 'cod' ? 'Cash on delivery' : 'Paid'} · Confirmation sent to {order.email}
        </p>
      )}
      <p className="mt-6 text-sm text-muted">We'll message you when it ships, usually within 24 hours.</p>
      <Link to="/shop" className="mt-8 inline-block rounded-full bg-ink px-7 py-3.5 text-sm font-bold uppercase text-white">
        Keep shopping
      </Link>
    </div>
  )
}

export function About() {
  useTitle('About us')
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-5xl font-black uppercase italic">About Stride Lab</h1>
      <div className="mt-8 space-y-5 leading-relaxed text-ink/80">
        <p>
          Stride Lab started in 2019 as a weekend run club in Cubbon Park. A lot of us were buying shoes that didn't suit how we ran,
          so we opened a small store in Indiranagar where you could try on pairs and talk to people who actually run.
        </p>
        <p>
          Today we ship across India from our Bengaluru warehouse. Every pair is sourced directly from the brand or its authorised
          distributor, and we still run with the club every Sunday at 6 am.
        </p>
        <p>
          Our store is in Indiranagar, Bengaluru, open every day from 11 am to 9 pm.
        </p>
      </div>
    </article>
  )
}

export function Help() {
  useTitle('Help, shipping & returns')
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-5xl font-black uppercase italic">Help</h1>
      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-bold">Shipping</h2>
        <p className="text-ink/80">Orders ship within 24 hours and arrive in 2–4 working days in metros, 4–7 days elsewhere. Shipping is free over ₹1,999, otherwise ₹99.</p>
      </section>
      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-bold">Returns &amp; exchanges</h2>
        <p className="text-ink/80">Unworn pairs in the original box can be returned or exchanged within 15 days of delivery. Pickup is free. Refunds reach your original payment method in 5–7 days.</p>
      </section>
      <section id="sizing" className="mt-10 space-y-3">
        <h2 className="text-xl font-bold">Size guide</h2>
        <table className="w-full overflow-hidden rounded-xl bg-white text-sm">
          <thead className="bg-ink text-white">
            <tr><th className="p-3 text-left">UK</th><th className="p-3 text-left">US (men)</th><th className="p-3 text-left">EU</th><th className="p-3 text-left">Foot length</th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {[[6, 7, 40, '24.5 cm'], [7, 8, 41, '25.4 cm'], [8, 9, 42, '26.2 cm'], [9, 10, 43, '27.1 cm'], [10, 11, 44.5, '27.9 cm'], [11, 12, 46, '28.8 cm']].map((r) => (
              <tr key={r[0]}>{r.map((c, i) => <td key={i} className="p-3">{c}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-bold">Contact</h2>
        <p className="text-ink/80">Our support team replies 10 am – 7 pm, Monday to Saturday.</p>
      </section>
    </article>
  )
}

export function NotFound() {
  useTitle('Page not found')
  return (
    <div className="mx-auto max-w-xl px-4 py-32 text-center">
      <h1 className="font-display text-6xl font-black uppercase italic">404</h1>
      <p className="mt-3 text-muted">This page went for a run and didn't come back.</p>
      <Link to="/" className="mt-6 inline-block rounded-full bg-ink px-6 py-3 text-sm font-bold text-white">
        Go home
      </Link>
    </div>
  )
}
