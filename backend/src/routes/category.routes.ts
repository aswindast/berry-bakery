import { Router } from 'express'
import { getCategoriesController } from '../controllers/categoryController.js'

const router = Router()

router.get('/', getCategoriesController)

export default router
