import { Router } from 'express'
import { validateCouponController } from '../controllers/couponController.js'
import { requireAuth } from '../middleware/requireAuth.js'

const router = Router()
router.use(requireAuth)
router.post('/validate', validateCouponController)
export default router
