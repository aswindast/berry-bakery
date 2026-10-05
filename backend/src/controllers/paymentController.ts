import type { Request, Response } from 'express'
import { z } from 'zod'
import { createPaymentOrder, recordFailedPayment, verifyPayment } from '../services/paymentService.js'
import { failedPaymentSchema, verifyPaymentSchema } from '../validators/paymentSchema.js'
import { HttpError } from '../utils/httpError.js'

function requireUserId(request: Request) {
  if (!request.authUser?.id) throw new HttpError(401, 'authentication_required', 'Sign in to continue.')
  return request.authUser.id
}

function orderIdFrom(request: Request) {
  const orderId = request.params.id
  if (typeof orderId !== 'string' || !z.string().uuid().safeParse(orderId).success) throw new HttpError(400, 'invalid_order_id', 'A valid order ID is required.')
  return orderId
}

function parseBody<T>(schema: z.ZodType<T>, body: unknown) {
  const result = schema.safeParse(body)
  if (!result.success) throw new HttpError(400, 'invalid_payment_request', 'Payment verification details are invalid.', result.error.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message })))
  return result.data
}

export async function createPaymentController(request: Request, response: Response) {
  if (request.body && (typeof request.body !== 'object' || Array.isArray(request.body) || Object.keys(request.body).length > 0)) {
    throw new HttpError(400, 'invalid_payment_request', 'Payment amount and details are calculated by the server; no request body is accepted.')
  }
  const data = await createPaymentOrder(requireUserId(request), orderIdFrom(request))
  response.status(201).json({ data })
}

export async function verifyPaymentController(request: Request, response: Response) {
  const input = parseBody(verifyPaymentSchema, request.body)
  const order = await verifyPayment(requireUserId(request), orderIdFrom(request), input)
  response.json({ data: order })
}

export async function failedPaymentController(request: Request, response: Response) {
  const input = parseBody(failedPaymentSchema, request.body)
  const order = await recordFailedPayment(requireUserId(request), orderIdFrom(request), input)
  response.json({ data: order })
}
