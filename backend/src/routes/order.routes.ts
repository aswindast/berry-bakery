import { Router } from 'express'
import { createOrderController, getOrderController, listOrdersController } from '../controllers/orderController.js'
import { requireAuth } from '../middleware/requireAuth.js'
import paymentRoutes from './payment.routes.js'

const router = Router()

router.use(requireAuth)
router.use('/:id/payment', paymentRoutes)
router.post('/', createOrderController)
router.get('/', listOrdersController)
router.get('/:id', getOrderController)

export default router
