import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import type { Product } from '../types'
import { formatPrice } from '../lib/format'

export default function ProductCard({ product: p }: { product: Product }) {
  const off = p.salePrice ? Math.round((1 - p.salePrice / p.price) * 100) : 0
  const soldOut = p.sizes.every((s) => !s.inStock)

  return (
    <Link to={`/products/${p.handle}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-white">
        <img
          src={p.image}
          alt={`${p.brand} ${p.name}`}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex gap-1.5">
          {off > 0 && <span className="rounded-full bg-sale px-2.5 py-1 text-[11px] font-bold text-white">-{off}%</span>}
          {p.tags.includes('new') && <span className="rounded-full bg-volt px-2.5 py-1 text-[11px] font-bold">New</span>}
          {soldOut && <span className="rounded-full bg-ink px-2.5 py-1 text-[11px] font-bold text-white">Sold out</span>}
        </div>
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">{p.brand}</p>
          <p className="font-display text-lg font-bold leading-tight">{p.name}</p>
          <p className="text-sm text-muted">{p.colour}</p>
        </div>
        <div className="text-right">
          {p.salePrice ? (
            <>
              <p className="font-semibold text-sale">{formatPrice(p.salePrice)}</p>
              <p className="text-xs text-muted line-through">{formatPrice(p.price)}</p>
            </>
          ) : (
            <p className="font-semibold">{formatPrice(p.price)}</p>
          )}
        </div>
      </div>
      <p className="mt-1 flex items-center gap-1 text-xs text-muted">
        <Star size={12} className="fill-ink text-ink" /> {p.rating.toFixed(1)} ({p.reviewCount})
      </p>
    </Link>
  )
}
