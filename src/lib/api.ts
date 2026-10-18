import type { Category, Product } from '../types'

type Catalog = { products: Product[]; categories: Category[] }

let cache: Promise<Catalog> | null = null

// The storefront reads its catalogue from the store API. Today that is a
// static export; it is swapped for the inventory service later.
export function getCatalog(): Promise<Catalog> {
  if (!cache) {
    cache = fetch('/api/products.json').then((res) => {
      if (!res.ok) throw new Error(`Catalogue request failed (${res.status})`)
      return res.json() as Promise<Catalog>
    })
    cache.catch(() => {
      cache = null
    })
  }
  return cache
}

export async function getProduct(handle: string): Promise<Product | undefined> {
  const { products } = await getCatalog()
  return products.find((p) => p.handle === handle)
}

export function effectivePrice(p: Product): number {
  return p.salePrice ?? p.price
}
