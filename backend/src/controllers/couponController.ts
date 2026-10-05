import type { Request, Response } from 'express'
import { couponApplicationSchema } from '../validators/couponApplicationSchema.js'
import { previewCoupon } from '../repositories/orderRepository.js'
import { HttpError } from '../utils/httpError.js'

export async function validateCouponController(request: Request, response: Response) {
  if (!request.authUser?.id) throw new HttpError(401, 'authentication_required', 'Sign in to apply a coupon.')
  const parsed = couponApplicationSchema.safeParse(request.body)
  if (!parsed.success) throw new HttpError(400, 'invalid_coupon_request', 'Please check the coupon and cart items.', parsed.error.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message })))
  response.json({ data: await previewCoupon(parsed.data) })
}
