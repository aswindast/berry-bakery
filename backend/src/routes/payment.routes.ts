import { Router } from 'express'
import { createPaymentController, failedPaymentController, verifyPaymentController } from '../controllers/paymentController.js'

const router = Router({ mergeParams: true })

router.post('/create', createPaymentController)
router.post('/verify', verifyPaymentController)
router.post('/failure', failedPaymentController)

export default router
