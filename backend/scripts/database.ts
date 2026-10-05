import 'dotenv/config'
import { readdir, readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Client } from 'pg'
import { env } from '../src/config/env.js'

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const migrationsPath = join(projectRoot, 'database', 'migrations')
const seedsPath = join(projectRoot, 'database', 'seeds')
const command = process.argv[2] ?? 'migrate'

async function run() {
  if (!env.databaseUrl) throw new Error('DATABASE_URL is required to run database commands.')
  if (!['migrate', 'seed'].includes(command)) throw new Error(`Unknown database command: ${command}`)

  const client = new Client({ connectionString: env.databaseUrl })
  await client.connect()
  try {
    if (command === 'migrate') await runMigrations(client)
    if (command === 'seed') await runSeeds(client)
  } finally {
    await client.end()
  }
}

async function runMigrations(client: Client) {
  await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (filename TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW())')
  const files = (await readdir(migrationsPath)).filter((file) => file.endsWith('.sql')).sort()
  for (const filename of files) {
    const existing = await client.query('SELECT filename FROM schema_migrations WHERE filename = $1', [filename])
    if (existing.rowCount) continue
    await client.query('BEGIN')
    try {
      await client.query(await readFile(join(migrationsPath, filename), 'utf8'))
      await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [filename])
      await client.query('COMMIT')
      console.log(`Applied migration ${filename}`)
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    }
  }
}

async function runSeeds(client: Client) {
  const files = (await readdir(seedsPath)).filter((file) => file.endsWith('.sql')).sort()
  for (const filename of files) {
    await client.query(await readFile(join(seedsPath, filename), 'utf8'))
    console.log(`Applied seed ${filename}`)
  }
}

function sanitizeError(error: unknown) {
  const message = error instanceof Error ? error.message : 'Unknown database error.'
  return message.replace(/postgres(?:ql)?:\/\/[^\s]+/gi, '[redacted DATABASE_URL]')
}

run().catch((error: unknown) => {
  console.error(sanitizeError(error))
  process.exitCode = 1
})
