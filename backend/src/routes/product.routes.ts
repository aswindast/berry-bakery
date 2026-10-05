import { Router } from 'express'
import { getProductController, getProductsController } from '../controllers/productController.js'
import { productReviewsController } from '../controllers/reviewController.js'

const router = Router()

router.get('/', getProductsController)
router.get('/:id/reviews', productReviewsController)
router.get('/:slug', getProductController)

export default router
