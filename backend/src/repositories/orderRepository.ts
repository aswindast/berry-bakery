import { connectDatabase, isDatabaseConfigured, query } from '../db/pool.js'
import type { CreateOrderInput } from '../validators/orderSchema.js'
import type { CouponApplicationInput } from '../validators/couponApplicationSchema.js'
import { HttpError } from '../utils/httpError.js'

type OrderRow = {
  id: string
  user_id: string
  status: string
  payment_status: string
  payment_provider: string | null
  razorpay_order_id: string | null
  razorpay_payment_id: string | null
  paid_at: Date | null
  coupon_id: string | null
  coupon_code_snapshot: string | null
  fulfillment_type: 'delivery' | 'pickup'
  customer_name: string
  customer_email: string
  customer_phone: string
  delivery_address: string | null
  delivery_city: string | null
  delivery_state: string | null
  delivery_pincode: string | null
  delivery_instructions: string | null
  pickup_instructions: string | null
  subtotal: string
  delivery_fee: string
  discount_amount: string
  total: string
  created_at: Date
}

type OrderItemRow = {
  id: string
  order_id: string
  product_id: string | null
  product_name_snapshot: string
  unit_price: string
  quantity: number
  line_total: string
}

type ProductPriceRow = { id: string; name: string; price: string; is_available: boolean }
type CouponRow = { id: string; code: string; discount_type: 'percentage' | 'fixed'; discount_value: string; minimum_order_value: string; maximum_discount_amount: string | null; is_active: boolean; starts_at: Date; expires_at: Date; usage_limit: number | null; usage_count: number }
type FulfilmentSettings = { delivery_enabled: boolean; pickup_enabled: boolean; delivery_fee: string }

function requireDatabase() {
  if (!isDatabaseConfigured()) throw new HttpError(503, 'database_unavailable', 'Database is not configured.')
}

function asCents(value: string | number) {
  return Math.round(Number(value) * 100)
}

function getDiscountCents(coupon: CouponRow, subtotalCents: number, now = new Date()) {
  if (!coupon.is_active || now < new Date(coupon.starts_at) || now >= new Date(coupon.expires_at)) throw new HttpError(422, 'coupon_invalid', 'This coupon is inactive or outside its valid dates.')
  if (coupon.usage_limit !== null && coupon.usage_count >= coupon.usage_limit) throw new HttpError(422, 'coupon_limit_reached', 'This coupon has reached its usage limit.')
  if (subtotalCents < asCents(coupon.minimum_order_value)) throw new HttpError(422, 'coupon_minimum_not_met', 'Your items do not meet this coupon’s minimum order value.')
  let discount = coupon.discount_type === 'percentage'
    ? Math.round(subtotalCents * Number(coupon.discount_value) / 100)
    : asCents(coupon.discount_value)
  if (coupon.maximum_discount_amount !== null) discount = Math.min(discount, asCents(coupon.maximum_discount_amount))
  return Math.min(subtotalCents, Math.max(0, discount))
}

function serializeOrder(order: OrderRow, items: OrderItemRow[]) {
  return {
    id: order.id,
    status: order.status,
    paymentStatus: order.payment_status,
    paymentProvider: order.payment_provider,
    paidAt: order.paid_at,
    couponCode: order.coupon_code_snapshot,
    fulfillmentType: order.fulfillment_type,
    customerName: order.customer_name,
    customerEmail: order.customer_email,
    customerPhone: order.customer_phone,
    deliveryAddress: order.delivery_address,
    deliveryCity: order.delivery_city,
    deliveryState: order.delivery_state,
    deliveryPincode: order.delivery_pincode,
    deliveryInstructions: order.delivery_instructions,
    pickupInstructions: order.pickup_instructions,
    subtotal: Number(order.subtotal),
    deliveryFee: Number(order.delivery_fee),
    discountAmount: Number(order.discount_amount),
    total: Number(order.total),
    createdAt: order.created_at,
    items: items.map((item) => ({
      id: item.id,
      productId: item.product_id,
      productName: item.product_name_snapshot,
      unitPrice: Number(item.unit_price),
      quantity: item.quantity,
      lineTotal: Number(item.line_total),
    })),
  }
}

async function loadItems(orderIds: string[]) {
  if (!orderIds.length) return new Map<string, OrderItemRow[]>()
  const result = await query<OrderItemRow>(`SELECT id, order_id, product_id, product_name_snapshot, unit_price, quantity, line_total FROM order_items WHERE order_id = ANY($1::uuid[]) ORDER BY created_at`, [orderIds])
  const byOrder = new Map<string, OrderItemRow[]>()
  for (const item of result.rows) {
    const orderItems = byOrder.get(item.order_id) ?? []
    orderItems.push(item)
    byOrder.set(item.order_id, orderItems)
  }
  return byOrder
}

export async function createOrder(userId: string, input: CreateOrderInput) {
  requireDatabase()
  const client = await connectDatabase()
  try {
    await client.query('BEGIN')
    const productIds = input.items.map((item) => item.productId)
    const productResult = await client.query<ProductPriceRow>(`SELECT id, name, price, is_available FROM products WHERE id = ANY($1::uuid[]) FOR SHARE`, [productIds])
    if (productResult.rowCount !== productIds.length) {
      throw new HttpError(422, 'invalid_products', 'One or more cart products are no longer available.')
    }
    const products = new Map(productResult.rows.map((product) => [product.id, product]))
    for (const item of input.items) {
      const product = products.get(item.productId)
      if (!product || !product.is_available) {
        throw new HttpError(409, 'product_unavailable', 'One or more cart products are currently unavailable.')
      }
    }

    const subtotalCents = input.items.reduce((total, item) => total + asCents(products.get(item.productId)!.price) * item.quantity, 0)
    const settingsResult = await client.query<FulfilmentSettings>('SELECT delivery_enabled,pickup_enabled,delivery_fee FROM business_settings WHERE id=1 FOR SHARE')
    const settings = settingsResult.rows[0]
    if (settings && input.fulfillmentType === 'delivery' && !settings.delivery_enabled) throw new HttpError(409, 'delivery_unavailable', 'Delivery is not currently available.')
    if (settings && input.fulfillmentType === 'pickup' && !settings.pickup_enabled) throw new HttpError(409, 'pickup_unavailable', 'Pickup is not currently available.')
    const deliveryFeeCents = input.fulfillmentType === 'delivery' ? asCents(settings?.delivery_fee ?? 0) : 0

    let coupon: CouponRow | null = null
    let discountCents = 0
    if (input.couponCode) {
      const couponResult = await client.query<CouponRow>('SELECT id,code,discount_type,discount_value,minimum_order_value,maximum_discount_amount,is_active,starts_at,expires_at,usage_limit,usage_count FROM coupons WHERE code=$1 FOR UPDATE', [input.couponCode])
      coupon = couponResult.rows[0] ?? null
      if (!coupon) throw new HttpError(422, 'coupon_invalid', 'This coupon code is not valid.')
      discountCents = getDiscountCents(coupon, subtotalCents)
    }
    const totalCents = subtotalCents + deliveryFeeCents - discountCents
    if (totalCents < 0) throw new HttpError(422, 'invalid_order_total', 'The order total cannot be negative.')
    const orderResult = await client.query<OrderRow>(`INSERT INTO orders (user_id, fulfillment_type, customer_name, customer_email, customer_phone, delivery_address, delivery_city, delivery_state, delivery_pincode, delivery_instructions, pickup_instructions, subtotal, delivery_fee, discount_amount, total, coupon_id, coupon_code_snapshot) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17) RETURNING *`, [userId,input.fulfillmentType,input.customerName,input.customerEmail,input.customerPhone,input.fulfillmentType === 'delivery' ? input.deliveryAddress : null,input.fulfillmentType === 'delivery' ? input.deliveryCity : null,input.fulfillmentType === 'delivery' ? input.deliveryState : null,input.fulfillmentType === 'delivery' ? input.deliveryPincode : null,input.fulfillmentType === 'delivery' ? input.deliveryInstructions ?? null : null,input.fulfillmentType === 'pickup' ? input.pickupInstructions ?? null : null,(subtotalCents/100).toFixed(2),(deliveryFeeCents/100).toFixed(2),(discountCents/100).toFixed(2),(totalCents/100).toFixed(2),coupon?.id ?? null,coupon?.code ?? null])
    const order = orderResult.rows[0]
    if (!order) throw new Error('Order insert returned no record.')
    const itemRows: OrderItemRow[] = []
    for (const item of input.items) {
      const product = products.get(item.productId)!
      const unitPriceCents = asCents(product.price)
      const lineTotal = ((unitPriceCents * item.quantity) / 100).toFixed(2)
      const itemResult = await client.query<OrderItemRow>(`INSERT INTO order_items (order_id, product_id, product_name_snapshot, unit_price, quantity, line_total) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, order_id, product_id, product_name_snapshot, unit_price, quantity, line_total`, [order.id, product.id, product.name, (unitPriceCents / 100).toFixed(2), item.quantity, lineTotal])
      const createdItem = itemResult.rows[0]
      if (!createdItem) throw new Error('Order item insert returned no record.')
      itemRows.push(createdItem)
    }
    if (coupon) {
      const used = await client.query('UPDATE coupons SET usage_count=usage_count+1,updated_at=NOW() WHERE id=$1 AND is_active=TRUE AND (usage_limit IS NULL OR usage_count<usage_limit) RETURNING id', [coupon.id])
      if (!used.rows[0]) throw new HttpError(422, 'coupon_limit_reached', 'This coupon has reached its usage limit.')
    }
    await client.query('COMMIT')
    return serializeOrder(order, itemRows)
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function previewCoupon(input: CouponApplicationInput) {
  requireDatabase()
  const productIds = input.items.map((item) => item.productId)
  const products = await query<ProductPriceRow>('SELECT id,name,price,is_available FROM products WHERE id=ANY($1::uuid[])', [productIds])
  if (products.rowCount !== productIds.length || products.rows.some((product) => !product.is_available)) throw new HttpError(409, 'product_unavailable', 'One or more cart products are currently unavailable.')
  const productMap = new Map(products.rows.map((product) => [product.id,product]))
  const subtotalCents = input.items.reduce((total,item) => total + asCents(productMap.get(item.productId)!.price)*item.quantity,0)
  const settingsResult = await query<FulfilmentSettings>('SELECT delivery_enabled,pickup_enabled,delivery_fee FROM business_settings WHERE id=1')
  const settings = settingsResult.rows[0]
  if (settings && input.fulfillmentType === 'delivery' && !settings.delivery_enabled) throw new HttpError(409, 'delivery_unavailable', 'Delivery is not currently available.')
  if (settings && input.fulfillmentType === 'pickup' && !settings.pickup_enabled) throw new HttpError(409, 'pickup_unavailable', 'Pickup is not currently available.')
  const deliveryFeeCents = input.fulfillmentType === 'delivery' ? asCents(settings?.delivery_fee ?? 0) : 0
  const couponResult = await query<CouponRow>('SELECT id,code,discount_type,discount_value,minimum_order_value,maximum_discount_amount,is_active,starts_at,expires_at,usage_limit,usage_count FROM coupons WHERE code=$1', [input.code])
  const coupon = couponResult.rows[0]
  if (!coupon) throw new HttpError(422, 'coupon_invalid', 'This coupon code is not valid.')
  const discountCents = getDiscountCents(coupon, subtotalCents)
  return { code: coupon.code, subtotal: subtotalCents / 100, deliveryFee: deliveryFeeCents / 100, discountAmount: discountCents / 100, total: (subtotalCents + deliveryFeeCents - discountCents) / 100 }
}

export async function listOrders(userId: string) {
  requireDatabase()
  const result = await query<OrderRow>(`SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC`, [userId])
  const items = await loadItems(result.rows.map((order) => order.id))
  return result.rows.map((order) => serializeOrder(order, items.get(order.id) ?? []))
}

export async function getOrder(userId: string, orderId: string) {
  requireDatabase()
  const result = await query<OrderRow>(`SELECT * FROM orders WHERE user_id = $1 AND id = $2`, [userId, orderId])
  const order = result.rows[0]
  if (!order) return undefined
  const items = await loadItems([order.id])
  return serializeOrder(order, items.get(order.id) ?? [])
}
