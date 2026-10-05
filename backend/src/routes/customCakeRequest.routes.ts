import { Router } from 'express'
import { createCustomCakeRequestController, getCustomCakeRequestController, listCustomCakeRequestsController } from '../controllers/customCakeRequestController.js'
import { requireAuth } from '../middleware/requireAuth.js'

const router = Router()

router.use(requireAuth)
router.post('/', createCustomCakeRequestController)
router.get('/', listCustomCakeRequestsController)
router.get('/:id', getCustomCakeRequestController)

export default router
