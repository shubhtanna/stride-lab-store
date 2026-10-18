export type Size = { uk: number; inStock: boolean }

export type Product = {
  id: string
  handle: string
  name: string
  brand: string
  category: string
  colour: string
  image: string
  price: number
  salePrice: number | null
  rating: number
  reviewCount: number
  sizes: Size[]
  description: string
  features: string[]
  tags: string[]
}

export type Category = { slug: string; name: string }

export type CartItem = {
  productId: string
  handle: string
  name: string
  brand: string
  image: string
  size: number
  unitPrice: number
  qty: number
}
