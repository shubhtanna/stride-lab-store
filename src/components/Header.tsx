import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, Search, ShoppingBag, X } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { FREE_SHIPPING_FROM, formatPrice } from '../lib/format'

const NAV = [
  { to: '/shop', label: 'Shop all' },
  { to: '/shop?category=running', label: 'Running' },
  { to: '/shop?category=lifestyle', label: 'Lifestyle' },
  { to: '/shop?category=basketball', label: 'Basketball' },
  { to: '/shop?sale=1', label: 'Sale' },
]

export default function Header() {
  const { count, open } = useCart()
  const [menu, setMenu] = useState(false)
  const [searching, setSearching] = useState(false)
  const [q, setQ] = useState('')
  const navigate = useNavigate()

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(`/shop?q=${encodeURIComponent(q.trim())}`)
    setSearching(false)
  }

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-ink text-center text-xs font-medium tracking-wide text-white">
        <p className="px-4 py-2">
          Free shipping on orders over {formatPrice(FREE_SHIPPING_FROM)} · Easy 15-day returns
        </p>
      </div>
      <div className="border-b border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <button className="lg:hidden" onClick={() => setMenu(true)} aria-label="Open menu">
            <Menu size={22} />
          </button>
          <Link to="/" className="font-display text-2xl font-black uppercase italic">
            Stride<span className="text-ink/40">/</span>Lab
          </Link>
          <nav className="ml-8 hidden gap-6 lg:flex">
            {NAV.map((n) => (
              <NavLink
                key={n.label}
                to={n.to}
                className={`text-sm font-semibold ${n.label === 'Sale' ? 'text-sale' : 'text-ink hover:text-ink/60'}`}
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-4">
            {searching ? (
              <form onSubmit={submit} className="flex items-center gap-2">
                <input
                  autoFocus
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search shoes, brands…"
                  className="w-40 rounded-full border border-line bg-white px-4 py-1.5 text-sm outline-none focus:border-ink sm:w-64"
                />
                <button type="button" onClick={() => setSearching(false)} aria-label="Close search">
                  <X size={18} />
                </button>
              </form>
            ) : (
              <button onClick={() => setSearching(true)} aria-label="Search">
                <Search size={20} />
              </button>
            )}
            <button onClick={open} className="relative" aria-label="Open cart">
              <ShoppingBag size={21} />
              {count > 0 && (
                <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-volt px-1 text-[11px] font-bold text-ink">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {menu && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setMenu(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-paper p-6">
            <button onClick={() => setMenu(false)} aria-label="Close menu" className="mb-8">
              <X size={22} />
            </button>
            <nav className="flex flex-col gap-5">
              {NAV.map((n) => (
                <Link key={n.label} to={n.to} onClick={() => setMenu(false)} className="font-display text-2xl font-extrabold">
                  {n.label}
                </Link>
              ))}
              <Link to="/about" onClick={() => setMenu(false)} className="text-sm text-muted">
                About us
              </Link>
              <Link to="/help" onClick={() => setMenu(false)} className="text-sm text-muted">
                Help &amp; returns
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
