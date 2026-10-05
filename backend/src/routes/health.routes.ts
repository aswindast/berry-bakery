import { Router } from 'express'
import { checkDatabaseConnection } from '../db/pool.js'

const router = Router()

router.get('/', async (_request, response) => {
  response.json({ status: 'ok', service: 'berry-backend', database: await checkDatabaseConnection() })
})

export default router
