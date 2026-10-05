import { Router } from 'express'
import * as controller from '../controllers/adminController.js'

const router = Router()
router.get('/', controller.publicHighlights)
export default router
