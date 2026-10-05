import { isDatabaseConfigured, query } from '../db/pool.js'
import type { ProductFilters } from '../types/api.js'
import { HttpError } from '../utils/httpError.js'

export type ProductRow = {
  id: string
  name: string
  slug: string
  description: string
  category: string
  price: string
  image: string | null
  is_featured: boolean
  is_available: boolean
  flavor: string | null
  eggless: boolean | null
  preparation_time: string | null
  minimum_advance_notice: string | null
}

function requireDatabase() {
  if (!isDatabaseConfigured()) throw new HttpError(503, 'database_unavailable', 'Database is not configured.')
}

function buildProductQuery(filters: ProductFilters, slug?: string) {
  const conditions: string[] = []
  const values: unknown[] = []
  const add = (condition: string, value: unknown) => { values.push(value); conditions.push(condition.replace('?', `$${values.length}`)) }

  if (slug) add('p.slug = ?', slug)
  if (filters.search) {
    const searchValue = `%${filters.search}%`
    const firstParameter = values.length + 1
    values.push(searchValue, searchValue, searchValue)
    conditions.push(`(p.name ILIKE $${firstParameter} OR p.description ILIKE $${firstParameter + 1} OR p.flavor ILIKE $${firstParameter + 2})`)
  }
  if (filters.category) add('c.slug = ?', filters.category)
  if (filters.available !== undefined) add('p.is_available = ?', filters.available)
  if (filters.featured !== undefined) add('p.is_featured = ?', filters.featured)

  const orderBy = filters.sort === 'price-low' ? 'p.price ASC' : filters.sort === 'price-high' ? 'p.price DESC' : filters.sort === 'name' ? 'p.name ASC' : filters.sort === 'newest' ? 'p.created_at DESC' : 'p.is_featured DESC, p.created_at DESC'
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  return { text: `SELECT p.id, p.name, p.slug, p.description, c.name AS category, p.price, p.image, p.is_featured, p.is_available, p.flavor, p.eggless, p.preparation_time, p.minimum_advance_notice FROM products p JOIN categories c ON c.id = p.category_id ${where} ORDER BY ${orderBy}`, values }
}

export async function findProducts(filters: ProductFilters) {
  requireDatabase()
  const statement = buildProductQuery(filters)
  const result = await query<ProductRow>(statement.text, statement.values)
  return result.rows
}

export async function findProductBySlug(slug: string) {
  requireDatabase()
  const statement = buildProductQuery({}, slug)
  const result = await query<ProductRow>(statement.text, statement.values)
  return result.rows[0]
}
