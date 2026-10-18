import { Link } from 'react-router-dom'
import { ArrowRight, RotateCcw, ShieldCheck, Truck } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { useCatalog, useTitle } from '../hooks/useCatalog'

const TILES = [
  { slug: 'running', label: 'Running', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&q=75&auto=format&fit=crop' },
  { slug: 'lifestyle', label: 'Lifestyle', img: 'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=900&q=75&auto=format&fit=crop' },
  { slug: 'basketball', label: 'Basketball', img: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=900&q=75&auto=format&fit=crop' },
]

export default function Home() {
  useTitle('Sneakers & Running Shoes Online in India')
  const { products, loading } = useCatalog()
  const bestsellers = [...products].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 4)
  const onSale = products.filter((p) => p.salePrice).slice(0, 4)

  return (
    <div>
      <section className="relative overflow-hidden bg-ink text-white">
        <img
          src="https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=1800&q=75&auto=format&fit=crop"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />
        <div className="relative mx-auto max-w-7xl px-4 py-28 sm:px-6 md:py-40">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-volt">Autumn drop · 2026</p>
          <h1 className="font-display mt-4 max-w-2xl text-5xl font-black uppercase italic leading-[0.95] md:text-7xl">
            Built for the long run.
          </h1>
          <p className="mt-6 max-w-md text-white/80">
            Daily trainers, race-day rockets and the classics you'll wear every day. Authentic pairs, delivered in 2–4 days.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/shop?category=running" className="rounded-full bg-volt px-7 py-3.5 text-sm font-bold uppercase text-ink">
              Shop running
            </Link>
            <Link to="/shop" className="rounded-full border border-white/40 px-7 py-3.5 text-sm font-bold uppercase">
              Shop all
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-white">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-6 text-sm sm:grid-cols-3 sm:px-6">
          <p className="flex items-center gap-3"><Truck size={18} /> Free shipping over ₹1,999</p>
          <p className="flex items-center gap-3"><RotateCcw size={18} /> 15-day easy returns</p>
          <p className="flex items-center gap-3"><ShieldCheck size={18} /> 100% authentic, sourced from brands</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          {TILES.map((t) => (
            <Link key={t.slug} to={`/shop?category=${t.slug}`} className="group relative aspect-[4/5] overflow-hidden rounded-3xl">
              <img src={t.img} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
              <p className="font-display absolute bottom-6 left-6 flex items-center gap-2 text-3xl font-black uppercase italic text-white">
                {t.label} <ArrowRight className="transition group-hover:translate-x-1" />
              </p>
            </Link>
          ))}
        </div>
      </section>

      <Shelf title="Bestsellers" href="/shop?sort=popular" loading={loading} items={bestsellers} />
      <Shelf title="On sale now" href="/shop?sale=1" loading={loading} items={onSale} />

      <section className="mx-auto mt-24 max-w-7xl px-4 sm:px-6">
        <div className="grid items-center gap-10 rounded-3xl bg-volt p-10 md:grid-cols-2 md:p-16">
          <div>
            <h2 className="font-display text-4xl font-black uppercase italic">Not sure about your size?</h2>
            <p className="mt-4 max-w-md">
              Most of our running shoes fit true to size. Between sizes? Go half a size up for long runs. Free exchanges if it's not right.
            </p>
            <Link to="/help#sizing" className="mt-6 inline-block rounded-full bg-ink px-7 py-3.5 text-sm font-bold uppercase text-white">
              Size guide
            </Link>
          </div>
          <img
            src="https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=1000&q=75&auto=format&fit=crop"
            alt=""
            className="aspect-[4/3] w-full rounded-2xl object-cover"
          />
        </div>
      </section>
    </div>
  )
}

function Shelf({ title, href, items, loading }: { title: string; href: string; items: ReturnType<typeof useCatalog>['products']; loading: boolean }) {
  return (
    <section className="mx-auto mt-24 max-w-7xl px-4 sm:px-6">
      <div className="mb-8 flex items-end justify-between">
        <h2 className="font-display text-3xl font-black uppercase italic md:text-4xl">{title}</h2>
        <Link to={href} className="text-sm font-semibold underline underline-offset-4">
          View all
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="aspect-square animate-pulse rounded-2xl bg-line" />)
          : items.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  )
}
