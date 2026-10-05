import { isDatabaseConfigured, query } from '../db/pool.js'
import type { CustomCakeRequestInput } from '../validators/customCakeRequestSchema.js'
import { HttpError } from '../utils/httpError.js'

function requireDatabase() {
  if (!isDatabaseConfigured()) throw new HttpError(503, 'database_unavailable', 'Database is not configured.')
}

export async function createCustomCakeRequest(userId: string, input: CustomCakeRequestInput) {
  requireDatabase()
  const result = await query<{ id: string; status: string; created_at: Date }>(`INSERT INTO custom_cake_requests (user_id, name, email, phone, occasion, preferred_date, preferred_time, servings, flavor, style_description, cake_message, budget_range, special_instructions) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NULLIF($9, ''), $10, NULLIF($11, ''), NULLIF($12, ''), NULLIF($13, '')) RETURNING id, status, created_at`, [userId, input.name, input.email, input.phone, input.occasion, input.preferredDate, input.preferredTime, input.servings, input.flavor, input.styleDescription, input.cakeMessage, input.budgetRange, input.specialInstructions])
  return result.rows[0]
}

export async function listCustomCakeRequests(userId: string) {
  requireDatabase()
  const result = await query(`SELECT id, name, email, phone, occasion, preferred_date, preferred_time, servings, flavor, style_description, cake_message, budget_range, special_instructions, status, created_at, updated_at FROM custom_cake_requests WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100`, [userId])
  return result.rows
}

export async function getCustomCakeRequest(userId: string, requestId: string) {
  requireDatabase()
  const result = await query(`SELECT id, name, email, phone, occasion, preferred_date, preferred_time, servings, flavor, style_description, cake_message, budget_range, special_instructions, status, created_at, updated_at FROM custom_cake_requests WHERE user_id = $1 AND id = $2`, [userId, requestId])
  return result.rows[0]
}
