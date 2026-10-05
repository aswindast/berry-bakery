import type { Request, Response } from 'express'
import { createOrderSchema } from '../validators/orderSchema.js'
import { createOrder, getOrder, listOrders } from '../repositories/orderRepository.js'
import { HttpError } from '../utils/httpError.js'
import { z } from 'zod'

function requireUserId(request: Request) {
  if (!request.authUser?.id) throw new HttpError(401, 'authentication_required', 'Sign in to continue.')
  return request.authUser.id
}

export async function createOrderController(request: Request, response: Response) {
  const parsed = createOrderSchema.safeParse(request.body)
  if (!parsed.success) {
    throw new HttpError(400, 'invalid_order', 'Check the order details and try again.', parsed.error.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message })))
  }
  const order = await createOrder(requireUserId(request), parsed.data)
  response.status(201).json({ data: order })
}

export async function listOrdersController(request: Request, response: Response) {
  response.json({ data: await listOrders(requireUserId(request)) })
}

export async function getOrderController(request: Request, response: Response) {
  const orderId = request.params.id
  if (typeof orderId !== 'string' || !z.string().uuid().safeParse(orderId).success) throw new HttpError(400, 'invalid_order_id', 'A valid order ID is required.')
  const order = await getOrder(requireUserId(request), orderId)
  if (!order) throw new HttpError(404, 'order_not_found', 'Order not found.')
  response.json({ data: order })
}
