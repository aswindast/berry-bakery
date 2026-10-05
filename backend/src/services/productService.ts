import { findProductBySlug, findProducts } from '../repositories/productRepository.js'
import type { ApiProduct, ProductFilters } from '../types/api.js'
import { publicImageUrl } from './imageStorageService.js'

function toApiProduct(product: Awaited<ReturnType<typeof findProducts>>[number]): ApiProduct {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    category: product.category,
    price: Number(product.price),
    image: publicImageUrl(product.image),
    isFeatured: product.is_featured,
    isAvailable: product.is_available,
    flavor: product.flavor,
    eggless: product.eggless,
    preparationTime: product.preparation_time,
    minimumAdvanceNotice: product.minimum_advance_notice,
  }
}

export async function listProducts(filters: ProductFilters) {
  const products = await findProducts(filters)
  return products.map(toApiProduct)
}

export async function getProduct(slug: string) {
  const product = await findProductBySlug(slug)
  return product ? toApiProduct(product) : undefined
}
