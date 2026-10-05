import { findActiveCategories } from '../repositories/categoryRepository.js'
import type { ApiCategory } from '../types/api.js'

export async function listCategories(): Promise<ApiCategory[]> {
  const categories = await findActiveCategories()
  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    sortOrder: category.sort_order,
    isActive: category.is_active,
  }))
}
