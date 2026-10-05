import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

const configDirectory = dirname(fileURLToPath(import.meta.url))
const rootEnvPath = resolve(configDirectory, '../../../.env')
const backendEnvPath = resolve(configDirectory, '../../.env')
dotenv.config({ path: existsSync(rootEnvPath) ? rootEnvPath : backendEnvPath, override: true })

const port = Number(process.env.PORT ?? 4000)

if (!Number.isInteger(port) || port <= 0) {
  throw new Error('PORT must be a positive integer')
}

export const env = {
  port,
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  databaseUrl: process.env.DATABASE_URL,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  razorpayKeyId: process.env.RAZORPAY_KEY_ID,
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET,
} as const
