import { createHmac, timingSafeEqual } from 'node:crypto'

export function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string, secret: string) {
  if (!/^[a-f\d]{64}$/i.test(signature)) return false
  const expected = createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest()
  const received = Buffer.from(signature, 'hex')
  return received.length === expected.length && timingSafeEqual(received, expected)
}
