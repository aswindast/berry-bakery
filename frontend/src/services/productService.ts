import { categories as mockCategories, type ProductCategory } from '../data/categories'
export type { ProductCategory }
import { featuredProducts as mockProducts, type Product } from '../data/products'
import { apiConfig } from '../lib/api'

export type ProductFilters = {
  search?: string
  category?: string
  available?: boolean
  featured?: boolean
  sort?: 'featured' | 'newest' | 'price-low' | 'price-high' | 'name'
}

type ApiProduct = {
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

type ApiCategory = {
  id: string
  name: string
  slug: string
  description: string
  sortOrder: number
  isActive: boolean
}

export function mapApiProductToProduct(apiProduct: ApiProduct): Product {
  return {
    id: apiProduct.id,
    name: apiProduct.name,
    slug: apiProduct.slug,
    description: apiProduct.description,
    category: apiProduct.category,
    price: Number(apiProduct.price),
    image: apiProduct.image ?? undefined,
    imageLabel: apiProduct.flavor || apiProduct.category || apiProduct.name,
    isFeatured: apiProduct.isFeatured,
    isAvailable: apiProduct.isAvailable,
    flavor: apiProduct.flavor ?? undefined,
    eggless: apiProduct.eggless ?? undefined,
    preparationTime: apiProduct.preparationTime ?? undefined,
    minimumAdvanceNotice: apiProduct.minimumAdvanceNotice ?? undefined,
  }
}

export function mapApiCategoryToProductCategory(apiCat: ApiCategory): ProductCategory {
  return {
    id: apiCat.slug,
    name: apiCat.name,
    description: apiCat.description,
    imageLabel: apiCat.name.split(' ')[0] ?? apiCat.name,
    href: apiCat.slug === 'custom-cakes' ? '/custom-cakes' : `/menu?category=${apiCat.slug}`,
  }
}

export async function fetchProducts(filters?: ProductFilters): Promise<Product[]> {
  const queryParams = new URLSearchParams()
  if (filters?.search) queryParams.set('search', filters.search)
  if (filters?.category) queryParams.set('category', filters.category)
  if (filters?.available !== undefined) queryParams.set('available', String(filters.available))
  if (filters?.featured !== undefined) queryParams.set('featured', String(filters.featured))
  if (filters?.sort) queryParams.set('sort', filters.sort)

  const queryString = queryParams.toString()
  const url = `${apiConfig.baseUrl}/products${queryString ? `?${queryString}` : ''}`

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.statusText}`)
  }

  const json = (await response.json()) as { data: ApiProduct[] }
  return json.data.map(mapApiProductToProduct)
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const response = await fetch(`${apiConfig.baseUrl}/products/${encodeURIComponent(slug)}`)
  if (response.status === 404) {
    return null
  }
  if (!response.ok) {
    throw new Error(`Failed to fetch product: ${response.statusText}`)
  }

  const json = (await response.json()) as { data: ApiProduct }
  return mapApiProductToProduct(json.data)
}

export async function fetchCategories(): Promise<ProductCategory[]> {
  const response = await fetch(`${apiConfig.baseUrl}/categories`)
  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.statusText}`)
  }

  const json = (await response.json()) as { data: ApiCategory[] }
  return json.data.map(mapApiCategoryToProductCategory)
}

export function getProducts(): Product[] {
  return mockProducts
}

export function getProductBySlug(slug: string): Product | undefined {
  return getProducts().find((product) => product.slug === slug)
}

export function getCategories(): ProductCategory[] {
  return mockCategories
}
