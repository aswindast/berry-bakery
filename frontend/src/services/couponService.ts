import { apiConfig } from '../lib/api'

export type CouponQuote = {
  code: string
  subtotal: number
  deliveryFee: number
  discountAmount: number
  total: number
}

export async function validateCoupon(accessToken: string, code: string, fulfillmentType: 'delivery' | 'pickup', items: Array<{ productId: string; quantity: number }>) {
  const response = await fetch(`${apiConfig.baseUrl}/coupons/validate`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ code, fulfillmentType, items }),
  })
  const result = await response.json() as { data?: CouponQuote; error?: { message?: string } }
  if (!response.ok || !result.data) throw new Error(result.error?.message ?? `Coupon validation failed (${response.status}).`)
  return result.data
}
