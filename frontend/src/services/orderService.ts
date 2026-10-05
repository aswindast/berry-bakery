import { apiConfig } from '../lib/api'
import type { Order } from '../types/order'

async function request<T>(path: string, accessToken: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiConfig.baseUrl}${path}`, {
    ...init,
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${accessToken}`,
      ...init?.headers,
    },
  })
  const body = await response.json() as { data?: T; error?: { message?: string } }
  if (!response.ok || body.data === undefined) {
    throw new Error(body.error?.message ?? `Order request failed (${response.status}).`)
  }
  return body.data
}

export type CreateOrderRequest = {
  customerName: string
  customerEmail: string
  customerPhone: string
  fulfillmentType: 'delivery' | 'pickup'
  deliveryAddress?: string
  deliveryCity?: string
  deliveryState?: string
  deliveryPincode?: string
  deliveryInstructions?: string
  pickupInstructions?: string
  couponCode?: string
  items: Array<{ productId: string; quantity: number }>
}

export function createOrder(accessToken: string, order: CreateOrderRequest) {
  return request<Order>('/orders', accessToken, { method: 'POST', body: JSON.stringify(order) })
}

export function fetchOrders(accessToken: string) {
  return request<Order[]>('/orders', accessToken)
}

export function fetchOrder(accessToken: string, orderId: string) {
  return request<Order>(`/orders/${encodeURIComponent(orderId)}`, accessToken)
}
