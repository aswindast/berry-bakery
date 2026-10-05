export type OrderItem = {
  id: string
  productId: string | null
  productName: string
  unitPrice: number
  quantity: number
  lineTotal: number
}

export type Order = {
  id: string
  status: string
  paymentStatus: string
  paymentProvider: string | null
  paidAt: string | null
  couponCode: string | null
  fulfillmentType: 'delivery' | 'pickup'
  customerName: string
  customerEmail: string
  customerPhone: string
  deliveryAddress: string | null
  deliveryCity: string | null
  deliveryState: string | null
  deliveryPincode: string | null
  deliveryInstructions: string | null
  pickupInstructions: string | null
  subtotal: number
  deliveryFee: number
  discountAmount: number
  total: number
  createdAt: string
  items: OrderItem[]
}
