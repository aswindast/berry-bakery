import { isDatabaseConfigured, query } from '../db/pool.js'
import { HttpError } from '../utils/httpError.js'

export type CategoryRow = {
  id: string
  name: string
  slug: string
  description: string
  sort_order: number
  is_active: boolean
}

function requireDatabase() {
  if (!isDatabaseConfigured()) throw new HttpError(503, 'database_unavailable', 'Database is not configured.')
}

export async function findActiveCategories() {
  requireDatabase()
  const result = await query<CategoryRow>('SELECT id, name, slug, description, sort_order, is_active FROM categories WHERE is_active = TRUE ORDER BY sort_order ASC')
  return result.rows
}
