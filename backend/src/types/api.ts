export type ProductFilters = {
  search?: string
  category?: string
  available?: boolean
  featured?: boolean
  sort?: 'featured' | 'newest' | 'price-low' | 'price-high' | 'name'
}

export type ApiProduct = {
  id: string
  name: string
  slug: string
  description: string
  category: string
  price: number
  image: string | null
  isFeatured: boolean
  isAvailable: boolean
  flavor: string | null
  eggless: boolean | null
  preparationTime: string | null
  minimumAdvanceNotice: string | null
}

export type ApiCategory = {
  id: string
  name: string
  slug: string
  description: string
  sortOrder: number
  isActive: boolean
}
