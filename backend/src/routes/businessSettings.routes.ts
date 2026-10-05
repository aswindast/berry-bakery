import { Router } from 'express'
import { publicBusinessSettingsController } from '../controllers/businessSettingsController.js'

const router = Router()
router.get('/', publicBusinessSettingsController)
export default router
