import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { useCatalog, useTitle } from '../hooks/useCatalog'
import { effectivePrice } from '../lib/api'

const PRICE_BANDS = [
  { id: 'u3', label: 'Under ₹3,000', test: (n: number) => n < 3000 },
  { id: '3-7', label: '₹3,000 – ₹7,000', test: (n: number) => n >= 3000 && n <= 7000 },
  { id: '7-10', label: '₹7,000 – ₹10,000', test: (n: number) => n > 7000 && n <= 10000 },
  { id: 'o10', label: 'Over ₹10,000', test: (n: number) => n > 10000 },
]
const SIZES = [6, 7, 8, 9, 10, 11]

export default function Shop() {
  const [params, setParams] = useSearchParams()
  const { products, categories, loading, error } = useCatalog()
  const [filtersOpen, setFiltersOpen] = useState(false)

  const category = params.get('category')
  const q = params.get('q')?.toLowerCase() ?? ''
  const sale = params.get('sale') === '1'
  const sort = params.get('sort') ?? 'featured'
  const price = params.get('price')
  const size = params.get('size') ? Number(params.get('size')) : null
  const brand = params.get('brand')

  const brands = useMemo(() => [...new Set(products.map((p) => p.brand))].sort(), [products])
  const catName = categories.find((c) => c.slug === category)?.name

  useTitle(catName ? `${catName} Shoes` : sale ? 'Sale' : q ? `Search: ${q}` : 'Shop all')

  const set = (key: string, value: string | null) => {
    const next = new URLSearchParams(params)
    if (value === null || next.get(key) === value) next.delete(key)
    else next.set(key, value)
    setParams(next)
  }

  const list = useMemo(() => {
    let out = products.filter((p) => {
      if (category && p.category !== category) return false
      if (sale && !p.salePrice) return false
      if (brand && p.brand !== brand) return false
      if (size && !p.sizes.some((s) => s.uk === size && s.inStock)) return false
      if (price) {
        const band = PRICE_BANDS.find((b) => b.id === price)
        if (band && !band.test(effectivePrice(p))) return false
      }
      if (q && !`${p.brand} ${p.name} ${p.colour} ${p.category}`.toLowerCase().includes(q)) return false
      return true
    })
    if (sort === 'price-asc') out = [...out].sort((a, b) => effectivePrice(a) - effectivePrice(b))
    if (sort === 'price-desc') out = [...out].sort((a, b) => effectivePrice(b) - effectivePrice(a))
    if (sort === 'popular') out = [...out].sort((a, b) => b.reviewCount - a.reviewCount)
    if (sort === 'rating') out = [...out].sort((a, b) => b.rating - a.rating)
    return out
  }, [products, category, sale, brand, size, price, q, sort])

  const heading = catName ?? (sale ? 'Sale' : q ? `Results for “${params.get('q')}”` : 'All shoes')

  const Filters = (
    <div className="space-y-8 text-sm">
      <FilterGroup title="Category">
        {categories.map((c) => (
          <Chip key={c.slug} active={category === c.slug} onClick={() => set('category', c.slug)}>
            {c.name}
          </Chip>
        ))}
      </FilterGroup>
      <FilterGroup title="Price">
        {PRICE_BANDS.map((b) => (
          <Chip key={b.id} active={price === b.id} onClick={() => set('price', b.id)}>
            {b.label}
          </Chip>
        ))}
      </FilterGroup>
      <FilterGroup title="Size (UK)">
        {SIZES.map((s) => (
          <Chip key={s} active={size === s} onClick={() => set('size', String(s))}>
            {s}
          </Chip>
        ))}
      </FilterGroup>
      <FilterGroup title="Brand">
        {brands.map((b) => (
          <Chip key={b} active={brand === b} onClick={() => set('brand', b)}>
            {b}
          </Chip>
        ))}
      </FilterGroup>
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={sale} onChange={() => set('sale', '1')} /> On sale only
      </label>
    </div>
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <h1 className="font-display text-4xl font-black uppercase italic md:text-5xl">{heading}</h1>
          {!loading && <p className="mt-2 text-sm text-muted">{list.length} products</p>}
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm lg:hidden" onClick={() => setFiltersOpen(true)}>
            <SlidersHorizontal size={16} /> Filters
          </button>
          <select
            value={sort}
            onChange={(e) => set('sort', e.target.value === 'featured' ? null : e.target.value)}
            className="rounded-full border border-line bg-white px-4 py-2 text-sm"
            aria-label="Sort by"
          >
            <option value="featured">Featured</option>
            <option value="popular">Most popular</option>
            <option value="rating">Top rated</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </div>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">{Filters}</aside>
        <div>
          {error && <p className="text-sale">Couldn't load products. Please refresh.</p>}
          {!loading && list.length === 0 && (
            <div className="rounded-2xl border border-dashed border-line p-12 text-center">
              <p className="font-semibold">No shoes match these filters.</p>
              <button className="mt-3 text-sm underline" onClick={() => setParams({})}>
                Clear all filters
              </button>
            </div>
          )}
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="aspect-square animate-pulse rounded-2xl bg-line" />)
              : list.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </div>

      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setFiltersOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-3xl bg-paper p-6">
            <div className="mb-6 flex items-center justify-between">
              <p className="font-display text-xl font-extrabold">Filters</p>
              <button onClick={() => setFiltersOpen(false)} aria-label="Close filters">
                <X size={20} />
              </button>
            </div>
            {Filters}
            <button onClick={() => setFiltersOpen(false)} className="mt-8 w-full rounded-full bg-ink py-3.5 text-sm font-bold text-white">
              Show {list.length} results
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">{title}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 ${active ? 'border-ink bg-ink text-white' : 'border-line bg-white hover:border-ink'}`}
    >
      {children}
    </button>
  )
}
