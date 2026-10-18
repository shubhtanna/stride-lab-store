import { useEffect, useState } from 'react'
import { getCatalog } from '../lib/api'
import type { Category, Product } from '../types'

export function useCatalog() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    getCatalog()
      .then((c) => {
        if (!alive) return
        setProducts(c.products)
        setCategories(c.categories)
      })
      .catch((e: Error) => alive && setError(e.message))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [])

  return { products, categories, loading, error }
}

export function useTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} | Stride Lab` : 'Stride Lab'
  }, [title])
}
