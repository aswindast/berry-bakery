import Razorpay from 'razorpay'
import { connectDatabase, isDatabaseConfigured, query } from '../db/pool.js'
import { env } from '../config/env.js'
import { HttpError } from '../utils/httpError.js'
import { verifyRazorpaySignature } from '../utils/razorpaySignature.js'

type PayableOrder = {
  id: string
  status: string
  payment_status: 'pending' | 'paid' | 'failed'
  payment_provider: string | null
  razorpay_order_id: string | null
  razorpay_payment_id: string | null
  total: string
}

type GatewayPayment = {
  id: string
  order_id: string
  amount: number
  currency: string
  status: string
}

function requireDatabase() {
  if (!isDatabaseConfigured()) throw new HttpError(503, 'database_unavailable', 'Database is not configured.')
}

function getGateway() {
  if (!env.razorpayKeyId || !env.razorpayKeySecret) {
    throw new HttpError(503, 'payment_unavailable', 'Online payment is not configured yet. Your order is saved and can be paid later.')
  }
  return new Razorpay({ key_id: env.razorpayKeyId, key_secret: env.razorpayKeySecret })
}

function amountInPaise(value: string) {
  return Math.round(Number(value) * 100)
}

async function getOwnedOrder(userId: string, orderId: string) {
  requireDatabase()
  const client = await connectDatabase()
  try {
    const result = await client.query<PayableOrder>('SELECT id, status, payment_status, payment_provider, razorpay_order_id, razorpay_payment_id, total FROM orders WHERE user_id = $1 AND id = $2', [userId, orderId])
    const order = result.rows[0]
    if (!order) throw new HttpError(404, 'order_not_found', 'Order not found.')
    return order
  } finally {
    client.release()
  }
}

async function fetchGatewayPayment(razorpayPaymentId: string): Promise<GatewayPayment> {
  try {
    return await getGateway().payments.fetch(razorpayPaymentId) as unknown as GatewayPayment
  } catch {
    throw new HttpError(502, 'payment_provider_unavailable', 'Could not verify the payment with Razorpay. Please retry.')
  }
}

function assertGatewayPaymentMatches(order: PayableOrder, payment: GatewayPayment, razorpayOrderId: string) {
  if (payment.order_id !== razorpayOrderId || payment.amount !== amountInPaise(order.total) || payment.currency !== 'INR') {
    throw new HttpError(400, 'payment_mismatch', 'The payment details do not match this order.')
  }
}

export async function createPaymentOrder(userId: string, orderId: string) {
  requireDatabase()
  const client = await connectDatabase()
  try {
    await client.query('BEGIN')
    const result = await client.query<PayableOrder>('SELECT id, status, payment_status, payment_provider, razorpay_order_id, razorpay_payment_id, total FROM orders WHERE user_id = $1 AND id = $2 FOR UPDATE', [userId, orderId])
    const order = result.rows[0]
    if (!order) throw new HttpError(404, 'order_not_found', 'Order not found.')
    if (order.status !== 'pending' || order.payment_status === 'paid') {
      throw new HttpError(409, 'order_not_payable', 'This order is not awaiting payment.')
    }
    const amount = amountInPaise(order.total)
    if (!Number.isSafeInteger(amount) || amount <= 0) throw new HttpError(409, 'invalid_payment_amount', 'This order cannot be paid online.')

    const gateway = getGateway()
    if (order.payment_status === 'pending' && order.payment_provider === 'razorpay' && order.razorpay_order_id) {
      await client.query('COMMIT')
      return { orderId: order.id, razorpayKeyId: env.razorpayKeyId, razorpayOrderId: order.razorpay_order_id, amount, currency: 'INR' as const }
    }
    let created: { id: string; amount: number; currency: string }
    try {
      created = await gateway.orders.create({ amount, currency: 'INR', receipt: order.id, notes: { berry_order_id: order.id } }) as { id: string; amount: number; currency: string }
    } catch {
      throw new HttpError(502, 'payment_provider_unavailable', 'Could not start payment. Your order is saved; please retry.')
    }
    if (created.amount !== amount || created.currency !== 'INR' || !created.id) {
      throw new HttpError(502, 'payment_provider_mismatch', 'Razorpay returned an invalid payment order.')
    }

    await client.query("UPDATE orders SET payment_status = 'pending', payment_provider = 'razorpay', razorpay_order_id = $3, razorpay_payment_id = NULL, paid_at = NULL WHERE id = $1 AND user_id = $2", [order.id, userId, created.id])
    await client.query('COMMIT')
    return { orderId: order.id, razorpayKeyId: env.razorpayKeyId, razorpayOrderId: created.id, amount, currency: 'INR' as const }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function verifyPayment(userId: string, orderId: string, input: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }) {
  const order = await getOwnedOrder(userId, orderId)
  if (order.razorpay_order_id !== input.razorpayOrderId || order.payment_provider !== 'razorpay') {
    throw new HttpError(400, 'payment_order_mismatch', 'This Razorpay order does not belong to the selected BERRY order.')
  }
  if (!verifyRazorpaySignature(input.razorpayOrderId, input.razorpayPaymentId, input.razorpaySignature, env.razorpayKeySecret!)) {
    throw new HttpError(400, 'invalid_payment_signature', 'Payment verification failed.')
  }

  let payment = await fetchGatewayPayment(input.razorpayPaymentId)
  assertGatewayPaymentMatches(order, payment, input.razorpayOrderId)
  if (payment.status === 'authorized') {
    try {
      await getGateway().payments.capture(input.razorpayPaymentId, amountInPaise(order.total), 'INR')
    } catch {
      throw new HttpError(502, 'payment_capture_pending', 'The payment is authorized but could not be captured yet. Your order remains unpaid; please retry.')
    }
    payment = await fetchGatewayPayment(input.razorpayPaymentId)
    assertGatewayPaymentMatches(order, payment, input.razorpayOrderId)
  }
  if (payment.status !== 'captured') {
    throw new HttpError(409, payment.status === 'failed' ? 'payment_failed' : 'payment_not_captured', payment.status === 'failed' ? 'Razorpay reports that this payment failed.' : 'Payment has not been captured yet.')
  }

  const client = await connectDatabase()
  try {
    const result = await client.query<PayableOrder>("UPDATE orders SET payment_status = 'paid', razorpay_payment_id = $3, paid_at = NOW(), status = CASE WHEN status = 'pending' THEN 'confirmed' ELSE status END WHERE id = $1 AND user_id = $2 AND razorpay_order_id = $4 AND payment_status <> 'paid' RETURNING id, status, payment_status, payment_provider, razorpay_order_id, razorpay_payment_id, total", [orderId, userId, input.razorpayPaymentId, input.razorpayOrderId])
    if (result.rowCount === 0) {
      const current = await getOwnedOrder(userId, orderId)
      if (current.payment_status === 'paid' && current.razorpay_payment_id === input.razorpayPaymentId) return current
      throw new HttpError(409, 'payment_already_processed', 'This order payment has already been processed.')
    }
    return result.rows[0]
  } finally {
    client.release()
  }
}

export async function recordFailedPayment(userId: string, orderId: string, input: { razorpayOrderId: string; razorpayPaymentId: string }) {
  const order = await getOwnedOrder(userId, orderId)
  if (order.razorpay_order_id !== input.razorpayOrderId || order.payment_provider !== 'razorpay' || order.payment_status === 'paid') {
    throw new HttpError(409, 'payment_order_mismatch', 'This payment attempt cannot update the selected order.')
  }
  const payment = await fetchGatewayPayment(input.razorpayPaymentId)
  assertGatewayPaymentMatches(order, payment, input.razorpayOrderId)
  if (payment.status !== 'failed') throw new HttpError(409, 'payment_not_failed', 'Razorpay has not confirmed a failed payment.')

  const result = await query<PayableOrder>("UPDATE orders SET payment_status = 'failed', razorpay_payment_id = $3 WHERE id = $1 AND user_id = $2 AND razorpay_order_id = $4 AND payment_status <> 'paid' RETURNING id, status, payment_status, payment_provider, razorpay_order_id, razorpay_payment_id, total", [orderId, userId, input.razorpayPaymentId, input.razorpayOrderId])
  if (result.rowCount === 0) throw new HttpError(409, 'payment_already_processed', 'This order payment has already been processed.')
  return result.rows[0]
}
