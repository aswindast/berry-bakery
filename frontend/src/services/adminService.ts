import { apiConfig } from '../lib/api'

async function request<T>(path: string, accessToken: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiConfig.baseUrl}/admin${path}`, {
    ...init,
    headers: { 'content-type': 'application/json', authorization: `Bearer ${accessToken}`, ...init?.headers },
  })
  const result = await response.json() as { data?: T; error?: { message?: string } }
  if (!response.ok || result.data === undefined) {
    const error = new Error(result.error?.message ?? `Admin request failed (${response.status}).`)
    Object.assign(error, { status: response.status })
    throw error
  }
  return result.data
}

export const adminApi = {
  request,
  session: (token: string) => request<{ userId: string; email?: string }>('/session', token),
  summary: (token: string) => request<AdminSummary>('/summary', token),
  orders: (token: string) => request<AdminOrder[]>('/orders', token),
  order: (token: string, id: string) => request<AdminOrder & { items: AdminOrderItem[] }>(`/orders/${id}`, token),
  updateOrderStatus: (token: string, id: string, status: string) => request(`/orders/${id}/status`, token, { method: 'PATCH', body: JSON.stringify({ status }) }),
  products: (token: string, search = '') => request<AdminProduct[]>(`/products?search=${encodeURIComponent(search)}`, token),
  createProduct: (token: string, value: Record<string, unknown>) => request<AdminProduct>('/products', token, { method: 'POST', body: JSON.stringify(value) }),
  updateProduct: (token: string, id: string, value: Record<string, unknown>) => request<AdminProduct>(`/products/${id}`, token, { method: 'PATCH', body: JSON.stringify(value) }),
  deactivateProduct: (token: string, id: string) => request(`/products/${id}`, token, { method: 'DELETE' }),
  cakeRequests: (token: string) => request<AdminCakeRequest[]>('/custom-cake-requests', token),
  updateCakeStatus: (token: string, id: string, status: string) => request(`/custom-cake-requests/${id}/status`, token, { method: 'PATCH', body: JSON.stringify({ status }) }),
  customers: (token: string, search = '') => request<AdminCustomer[]>(`/customers?search=${encodeURIComponent(search)}`, token),
  coupons: (token: string) => request<AdminCoupon[]>('/coupons', token),
  createCoupon: (token: string, value: Record<string, unknown>) => request('/coupons', token, { method: 'POST', body: JSON.stringify(value) }),
  updateCoupon: (token: string, id: string, value: Record<string, unknown>) => request(`/coupons/${id}`, token, { method: 'PATCH', body: JSON.stringify(value) }),
  reviews: (token: string) => request<AdminReview[]>('/reviews', token),
  updateReview: (token: string, id: string, status: string) => request(`/reviews/${id}/status`, token, { method: 'PATCH', body: JSON.stringify({ status }) }),
  deleteReview: (token: string, id: string) => request(`/reviews/${id}`, token, { method: 'DELETE' }),
  settings: (token: string) => request<BusinessSettings | null>('/settings', token),
  saveSettings: (token: string, value: BusinessSettings) => request<BusinessSettings>('/settings', token, { method: 'PUT', body: JSON.stringify(value) }),
  uploadImage: async (token: string, kind: 'product' | 'highlight', file: File) => {
    const response = await fetch(`${apiConfig.baseUrl}/admin/images/${kind}`, { method: 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': file.type }, body: file })
    const result = await response.json() as { data?: { path: string }; error?: { message?: string } }
    if (!response.ok || !result.data) throw new Error(result.error?.message ?? 'The image could not be uploaded.')
    return result.data.path
  },
  deleteImage: (token: string, path: string) => request('/images', token, { method: 'DELETE', body: JSON.stringify({ path }) }),
  highlights: (token: string) => request<AdminHighlight[]>('/highlights', token),
  createHighlight: (token: string, value: Record<string, unknown>) => request<AdminHighlight>('/highlights', token, { method: 'POST', body: JSON.stringify(value) }),
  updateHighlight: (token: string, id: string, value: Record<string, unknown>) => request<AdminHighlight>(`/highlights/${id}`, token, { method: 'PATCH', body: JSON.stringify(value) }),
  deleteHighlight: (token: string, id: string) => request(`/highlights/${id}`, token, { method: 'DELETE' }),
}

export type AdminSummary = { counts: { total_orders: number; pending_orders: number; paid_orders: number; total_products: number; custom_cake_requests: number; customers: number }; recentOrders: AdminOrder[]; recentRequests: AdminCakeRequest[] }
export type AdminOrder = { id: string; customer_name: string; customer_email: string; customer_phone: string; total: number | string; subtotal?: number | string; delivery_fee?: number | string; discount_amount?: number | string; coupon_code_snapshot?: string | null; status: string; payment_status: string; fulfillment_type: 'delivery' | 'pickup'; created_at: string; delivery_address?: string | null; delivery_city?: string | null; delivery_state?: string | null; delivery_pincode?: string | null; delivery_instructions?: string | null; pickup_instructions?: string | null; payment_provider?: string | null; razorpay_payment_id?: string | null; paid_at?: string | null }
export type AdminOrderItem = { id: string; product_id: string | null; product_name_snapshot: string; unit_price: number | string; quantity: number; line_total: number | string }
export type AdminProduct = { id: string; name: string; slug: string; description: string; category: string; categoryId?: string; price: number; image: string | null; imagePath?: string | null; isFeatured: boolean; isAvailable: boolean; flavor: string | null; eggless: boolean | null; preparationTime: string | null; minimumAdvanceNotice: string | null }
export type AdminHighlight = { id: string; title: string; description: string; image_path: string; image: string; display_order: number; is_active: boolean; created_at: string }
export type AdminCakeRequest = { id: string; name: string; email: string; phone: string; occasion: string; preferred_date: string; preferred_time: string; servings: number; flavor: string | null; style_description: string; cake_message: string | null; budget_range: string | null; special_instructions: string | null; status: string; created_at: string; referenceImageCount: number }
export type AdminCustomer = { id: string; email: string; name: string | null; phone: string | null; created_at: string; order_count: number }
export type AdminCoupon = { id: string; code: string; discount_type: 'percentage' | 'fixed'; discount_value: number | string; maximum_discount_amount: number | string | null; minimum_order_value: number | string; is_active: boolean; starts_at: string; expires_at: string; usage_limit: number | null; usage_count: number }
export type AdminReview = { id: string; product_id: string | null; product_name: string | null; rating: number; title: string | null; body: string; status: string; created_at: string }
export type BusinessSettings = { bakeryName: string; phone: string | null; whatsapp: string | null; email: string | null; location: string | null; businessHours: Record<string, string>; deliveryEnabled: boolean; pickupEnabled: boolean; deliveryFee: number; socialLinks: Array<{ label: string; href: string }> }
