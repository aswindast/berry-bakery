import { apiConfig } from '../lib/api'

export type EligibleReviewItem = { order_item_id: string; order_id: string; product_id: string; product_name: string; purchased_at: string }
export type CustomerReview = { id: string; order_id: string | null; order_item_id: string | null; product_id: string | null; product_name: string | null; rating: number; title: string | null; body: string; status: string; created_at: string }
export type ProductReviews = { averageRating: number | null; totalReviews: number; reviews: Array<{ id: string; rating: number; title: string | null; body: string; created_at: string }> }

async function request<T>(url: string, accessToken?: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}), ...(init?.headers ?? {}) },
  })
  const result = await response.json() as { data?: T; error?: { message?: string } }
  if (!response.ok || result.data === undefined) throw new Error(result.error?.message ?? `Review request failed (${response.status}).`)
  return result.data
}

export function getEligibleReviews(accessToken: string, orderId?: string) {
  const query = orderId ? `?orderId=${encodeURIComponent(orderId)}` : ''
  return request<EligibleReviewItem[]>(`${apiConfig.baseUrl}/reviews/eligible${query}`, accessToken)
}

export function getMyReviews(accessToken: string) {
  return request<CustomerReview[]>(`${apiConfig.baseUrl}/reviews/my`, accessToken)
}

export function submitCustomerReview(accessToken: string, value: { orderItemId: string; rating: number; title?: string; body: string }) {
  return request<CustomerReview>(`${apiConfig.baseUrl}/reviews`, accessToken, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(value) })
}

export function getProductReviews(productId: string) {
  return request<ProductReviews>(`${apiConfig.baseUrl}/products/${encodeURIComponent(productId)}/reviews`)
}
