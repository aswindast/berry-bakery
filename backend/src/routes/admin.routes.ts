import { raw, Router } from 'express'
import { requireAuth } from '../middleware/requireAuth.js'
import { requireAdmin } from '../middleware/requireAdmin.js'
import * as controller from '../controllers/adminController.js'

const router = Router()
router.use(requireAuth, requireAdmin)

router.get('/session', controller.adminSession)
router.get('/summary', controller.summary)
router.get('/orders', controller.orders)
router.get('/orders/:id', controller.orderDetails)
router.patch('/orders/:id/status', controller.changeOrderStatus)
router.get('/products', controller.products)
router.post('/products', controller.addProduct)
router.patch('/products/:id', controller.editProduct)
router.delete('/products/:id', controller.removeProduct)
router.get('/custom-cake-requests', controller.cakeRequests)
router.patch('/custom-cake-requests/:id/status', controller.changeCakeRequestStatus)
router.get('/customers', controller.customers)
router.get('/coupons', controller.coupons)
router.post('/coupons', controller.addCoupon)
router.patch('/coupons/:id', controller.editCoupon)
router.get('/reviews', controller.reviews)
router.patch('/reviews/:id/status', controller.changeReviewStatus)
router.delete('/reviews/:id', controller.removeReview)
router.get('/settings', controller.settings)
router.put('/settings', controller.updateSettings)
router.post('/images/:kind', raw({ type: ['image/jpeg', 'image/png', 'image/webp'], limit: '5mb' }), controller.uploadImage)
router.delete('/images', controller.deleteImage)
router.get('/highlights', controller.highlights)
router.post('/highlights', controller.addHighlight)
router.patch('/highlights/:id', controller.editHighlight)
router.delete('/highlights/:id', controller.removeHighlight)

export default router
