import cors from 'cors'
import express from 'express'
import { env } from './config/env.js'
import { errorHandler } from './middleware/errorHandler.js'
import categoryRoutes from './routes/category.routes.js'
import customCakeRequestRoutes from './routes/customCakeRequest.routes.js'
import healthRoutes from './routes/health.routes.js'
import productRoutes from './routes/product.routes.js'
import orderRoutes from './routes/order.routes.js'
import adminRoutes from './routes/admin.routes.js'
import reviewRoutes from './routes/review.routes.js'
import couponRoutes from './routes/coupon.routes.js'
import businessSettingsRoutes from './routes/businessSettings.routes.js'
import highlightRoutes from './routes/highlight.routes.js'

const app = express()

app.use(cors({ origin: env.frontendUrl }))
app.use(express.json({ limit: '1mb' }))
app.use('/api/health', healthRoutes)
app.use('/api/products', productRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/custom-cake-requests', customCakeRequestRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/coupons', couponRoutes)
app.use('/api/business-settings', businessSettingsRoutes)
app.use('/api/highlights', highlightRoutes)
app.use('/api/admin', adminRoutes)

app.use((_request, response) => {
	response.status(404).json({ error: { code: 'not_found', message: 'Route not found.' } })
})

app.use(errorHandler)

export default app
