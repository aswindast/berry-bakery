import type { Request, Response } from 'express'
import { createReviewSchema } from '../validators/reviewSchema.js'
import { approvedProductReviews, eligibleReviewItems, listMyReviews, submitReview } from '../repositories/reviewRepository.js'
import { HttpError } from '../utils/httpError.js'
import { z } from 'zod'

function userId(request: Request) {
  if (!request.authUser?.id) throw new HttpError(401, 'authentication_required', 'Sign in to continue.')
  return request.authUser.id
}

export async function createReviewController(request: Request, response: Response) {
  const parsed = createReviewSchema.safeParse(request.body)
  if (!parsed.success) throw new HttpError(400, 'invalid_review', 'Please check the review details.', parsed.error.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message })))
  response.status(201).json({ data: await submitReview(userId(request), parsed.data) })
}

export async function eligibleReviewsController(request: Request, response: Response) {
  const orderId = request.query.orderId
  if (orderId !== undefined && (typeof orderId !== 'string' || !z.string().uuid().safeParse(orderId).success)) throw new HttpError(400, 'invalid_order_id', 'A valid order ID is required.')
  response.json({ data: await eligibleReviewItems(userId(request), orderId as string | undefined) })
}

export async function myReviewsController(request: Request, response: Response) {
  response.json({ data: await listMyReviews(userId(request)) })
}

export async function productReviewsController(request: Request, response: Response) {
  const productId = request.params.id
  if (typeof productId !== 'string' || !z.string().uuid().safeParse(productId).success) throw new HttpError(400, 'invalid_product_id', 'A valid product ID is required.')
  response.json({ data: await approvedProductReviews(productId) })
}
