import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Check, ChevronRight, RotateCcw, Star, Truck } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { useCart } from '../context/CartContext'
import { useCatalog, useTitle } from '../hooks/useCatalog'
import { effectivePrice } from '../lib/api'
import { formatPrice } from '../lib/format'

export default function ProductPage() {
  const { handle } = useParams()
  const { products, categories, loading } = useCatalog()
  const { add } = useCart()
  const [size, setSize] = useState<number | null>(null)
  const [warn, setWarn] = useState(false)

  const p = products.find((x) => x.handle === handle)
  useTitle(p ? `${p.brand} ${p.name} – ${p.colour}` : '')
  useEffect(() => {
    setSize(null)
    setWarn(false)
    window.scrollTo(0, 0)
  }, [handle])

  if (loading) {
    return (
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2">
        <div className="aspect-square animate-pulse rounded-3xl bg-line" />
        <div className="space-y-4">
          <div className="h-8 w-2/3 animate-pulse rounded bg-line" />
          <div className="h-6 w-1/3 animate-pulse rounded bg-line" />
        </div>
      </div>
    )
  }

  if (!p) {
    return (
      <div className="mx-auto max-w-xl px-4 py-32 text-center">
        <h1 className="font-display text-4xl font-black uppercase italic">Shoe not found</h1>
        <p className="mt-3 text-muted">It may have sold out or moved.</p>
        <Link to="/shop" className="mt-6 inline-block rounded-full bg-ink px-6 py-3 text-sm font-bold text-white">
          Back to shop
        </Link>
      </div>
    )
  }

  const price = effectivePrice(p)
  const cat = categories.find((c) => c.slug === p.category)
  const related = products.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4)

  const addToBag = () => {
    if (!size) {
      setWarn(true)
      return
    }
    add({ productId: p.id, handle: p.handle, name: p.name, brand: p.brand, image: p.image, size, unitPrice: price })
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <nav className="mb-6 flex items-center gap-1 text-xs text-muted">
        <Link to="/">Home</Link> <ChevronRight size={12} />
        <Link to={`/shop?category=${p.category}`}>{cat?.name}</Link> <ChevronRight size={12} />
        <span className="text-ink">{p.name}</span>
      </nav>

      <div className="grid gap-10 md:grid-cols-2 lg:gap-16">
        <div className="aspect-square overflow-hidden rounded-3xl bg-white">
          <img src={p.image} alt={`${p.brand} ${p.name} in ${p.colour}`} className="h-full w-full object-cover" />
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-muted">{p.brand}</p>
          <h1 className="font-display mt-1 text-4xl font-black uppercase italic md:text-5xl">{p.name}</h1>
          <p className="mt-1 text-muted">{p.colour}</p>
          <p className="mt-3 flex items-center gap-1 text-sm">
            <Star size={14} className="fill-ink" /> {p.rating.toFixed(1)}
            <span className="text-muted">· {p.reviewCount} reviews</span>
          </p>

          <div className="mt-6 flex items-baseline gap-3">
            <p className={`text-2xl font-bold ${p.salePrice ? 'text-sale' : ''}`}>{formatPrice(price)}</p>
            {p.salePrice && <p className="text-muted line-through">{formatPrice(p.price)}</p>}
          </div>
          <p className="text-xs text-muted">MRP inclusive of all taxes</p>

          <div className="mt-8">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Select size (UK)</p>
              <Link to="/help#sizing" className="text-xs underline">
                Size guide
              </Link>
            </div>
            <div className="mt-3 grid grid-cols-6 gap-2">
              {p.sizes.map((s) => (
                <button
                  key={s.uk}
                  disabled={!s.inStock}
                  onClick={() => {
                    setSize(s.uk)
                    setWarn(false)
                  }}
                  className={`rounded-xl border py-3 text-sm font-semibold ${
                    size === s.uk
                      ? 'border-ink bg-ink text-white'
                      : s.inStock
                        ? 'border-line bg-white hover:border-ink'
                        : 'cursor-not-allowed border-line bg-line/50 text-muted line-through'
                  }`}
                >
                  {s.uk}
                </button>
              ))}
            </div>
            {warn && <p className="mt-2 text-sm text-sale">Please pick a size first.</p>}
          </div>

          <button onClick={addToBag} className="mt-6 w-full rounded-full bg-ink py-4 text-sm font-bold uppercase tracking-wide text-white hover:bg-ink/85">
            Add to bag
          </button>

          <div className="mt-6 space-y-2 rounded-2xl bg-white p-5 text-sm">
            <p className="flex items-center gap-3"><Truck size={16} /> Delivery in 2–4 working days. Free over ₹1,999.</p>
            <p className="flex items-center gap-3"><RotateCcw size={16} /> Free returns & exchanges within 15 days.</p>
          </div>

          <div className="mt-8">
            <p className="font-semibold">About this shoe</p>
            <p className="mt-2 text-sm leading-relaxed text-ink/80">{p.description}</p>
            <ul className="mt-4 space-y-1.5 text-sm">
              {p.features.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <Check size={14} /> {f}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-muted">Style code: {p.id}</p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="font-display mb-8 text-3xl font-black uppercase italic">You may also like</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
            {related.map((r) => (
              <ProductCard key={r.id} product={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
