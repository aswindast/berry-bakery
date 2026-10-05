import { Router } from 'express'
import { createReviewController, eligibleReviewsController, myReviewsController } from '../controllers/reviewController.js'
import { requireAuth } from '../middleware/requireAuth.js'

const router = Router()
router.use(requireAuth)
router.post('/', createReviewController)
router.get('/eligible', eligibleReviewsController)
router.get('/my', myReviewsController)
export default router
