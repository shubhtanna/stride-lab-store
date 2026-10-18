import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)

  return (
    <footer className="mt-24 bg-ink text-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-display text-3xl font-black uppercase italic">Stride/Lab</p>
          <p className="mt-3 max-w-sm text-sm text-white/60">
            Running and sneaker store from Bengaluru. Authentic pairs from the brands you love, shipped across India.
          </p>
          {done ? (
            <p className="mt-6 text-sm text-volt">You're on the list. Watch your inbox for drops.</p>
          ) : (
            <form
              className="mt-6 flex max-w-sm gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                if (email.includes('@')) setDone(true)
              }}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email for new drops"
                className="flex-1 rounded-full bg-white/10 px-4 py-2 text-sm outline-none placeholder:text-white/40"
              />
              <button className="rounded-full bg-volt px-5 text-sm font-bold text-ink">Join</button>
            </form>
          )}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-white/40">Shop</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/shop?category=running">Running</Link></li>
            <li><Link to="/shop?category=lifestyle">Lifestyle</Link></li>
            <li><Link to="/shop?category=basketball">Basketball</Link></li>
            <li><Link to="/shop?category=skate">Skate</Link></li>
            <li><Link to="/shop?sale=1">Sale</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-white/40">Help</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/help">Shipping &amp; returns</Link></li>
            <li><Link to="/help#sizing">Size guide</Link></li>
            <li><Link to="/about">About us</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-7xl px-4 py-6 text-xs text-white/40 sm:px-6">
          © {new Date().getFullYear()} Stride Lab · Bengaluru, India · Demo store: no real orders or payments are processed.
        </p>
      </div>
    </footer>
  )
}
