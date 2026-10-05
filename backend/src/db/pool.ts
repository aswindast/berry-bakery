import { Pool, type QueryResultRow } from 'pg'
import { env } from '../config/env.js'

let pool: Pool | undefined

if (env.databaseUrl) {
  pool = new Pool({ connectionString: env.databaseUrl, max: 5 })
}

export function isDatabaseConfigured() {
  return Boolean(pool)
}

export async function query<T extends QueryResultRow>(text: string, values: unknown[] = []) {
  if (!pool) throw new Error('Database is not configured')
  return pool.query<T>(text, values)
}

export async function connectDatabase() {
  if (!pool) throw new Error('Database is not configured')
  return pool.connect()
}

export async function checkDatabaseConnection() {
  if (!pool) return 'unconfigured' as const
  try {
    await pool.query('SELECT 1')
    return 'connected' as const
  } catch {
    return 'unavailable' as const
  }
}

export async function closeDatabasePool() {
  await pool?.end()
}
