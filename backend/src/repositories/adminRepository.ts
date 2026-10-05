import { isDatabaseConfigured, query } from '../db/pool.js'
import { HttpError } from '../utils/httpError.js'
import type { ApiProduct } from '../types/api.js'
import type { z } from 'zod'
import type { createProductSchema, settingsSchema } from '../validators/adminSchemas.js'
import { publicImageUrl } from '../services/imageStorageService.js'

function requireDatabase() {
  if (!isDatabaseConfigured()) throw new HttpError(503, 'database_unavailable', 'Database is not configured.')
}

function missing(): never { throw new HttpError(404, 'not_found', 'The requested record was not found.') }

function mapProduct(row: Record<string, unknown>): ApiProduct & { categoryId: string; imagePath: string | null } {
  return { id: String(row.id), name: String(row.name), slug: String(row.slug), description: String(row.description), category: String(row.category), categoryId: String(row.category_id), price: Number(row.price), image: publicImageUrl(row.image as string | null), imagePath: row.image as string | null, isFeatured: Boolean(row.is_featured), isAvailable: Boolean(row.is_available), flavor: row.flavor as string | null, eggless: row.eggless as boolean | null, preparationTime: row.preparation_time as string | null, minimumAdvanceNotice: row.minimum_advance_notice as string | null }
}

const productSelect = `SELECT p.id,p.name,p.slug,p.description,c.name AS category,p.price,p.image,p.is_featured,p.is_available,p.flavor,p.eggless,p.preparation_time,p.minimum_advance_notice,p.category_id FROM products p JOIN categories c ON c.id=p.category_id`

export async function adminSummary() {
  requireDatabase()
  const result = await query(`SELECT
    (SELECT count(*)::int FROM orders) AS total_orders,
    (SELECT count(*)::int FROM orders WHERE status='pending') AS pending_orders,
    (SELECT count(*)::int FROM orders WHERE payment_status='paid') AS paid_orders,
    (SELECT count(*)::int FROM products) AS total_products,
    (SELECT count(*)::int FROM custom_cake_requests) AS custom_cake_requests,
    (SELECT count(*)::int FROM auth.users u LEFT JOIN admin_users a ON a.user_id=u.id WHERE a.user_id IS NULL AND u.deleted_at IS NULL) AS customers`)
  const recentOrders = await query(`SELECT id,customer_name,customer_email,total,status,payment_status,fulfillment_type,created_at FROM orders ORDER BY created_at DESC LIMIT 6`)
  const recentRequests = await query(`SELECT id,name,email,occasion,preferred_date,servings,status,created_at FROM custom_cake_requests ORDER BY created_at DESC LIMIT 6`)
  return { counts: result.rows[0], recentOrders: recentOrders.rows, recentRequests: recentRequests.rows }
}

export async function listAdminOrders() {
  requireDatabase()
  const result = await query(`SELECT id,customer_name,customer_email,customer_phone,total,subtotal,delivery_fee,discount_amount,coupon_code_snapshot,status,payment_status,fulfillment_type,created_at FROM orders ORDER BY created_at DESC LIMIT 500`)
  return result.rows
}

export async function getAdminOrder(orderId: string) {
  requireDatabase()
  const result = await query(`SELECT * FROM orders WHERE id=$1`, [orderId])
  const order = result.rows[0]
  if (!order) return undefined
  const items = await query(`SELECT id,product_id,product_name_snapshot,unit_price,quantity,line_total FROM order_items WHERE order_id=$1 ORDER BY created_at`, [orderId])
  return { ...order, items: items.rows }
}

export async function updateAdminOrderStatus(orderId: string, status: string) {
  requireDatabase()
  const result = await query(`UPDATE orders SET status=$2 WHERE id=$1 RETURNING id,status,payment_status`, [orderId, status])
  if (!result.rows[0]) missing()
  return result.rows[0]
}

export async function listAdminProducts(search = '') {
  requireDatabase()
  const result = await query(`${productSelect} WHERE p.name ILIKE $1 OR p.slug ILIKE $1 ORDER BY p.created_at DESC LIMIT 500`, [`%${search}%`])
  return result.rows.map(mapProduct)
}

export async function createAdminProduct(input: z.infer<typeof createProductSchema>) {
  requireDatabase()
  const result = await query(`INSERT INTO products (name,slug,description,category_id,price,image,is_featured,is_available,flavor,eggless,preparation_time,minimum_advance_notice) VALUES ($1,$2,$3,$4,$5,NULLIF($6,''),$7,$8,$9,$10,$11,$12) RETURNING id`, [input.name,input.slug,input.description,input.categoryId,input.price,input.image ?? '',input.isFeatured,input.isAvailable,input.flavor ?? null,input.eggless ?? null,input.preparationTime ?? null,input.minimumAdvanceNotice ?? null])
  const createdId = result.rows[0]?.id
  if (typeof createdId !== 'string') throw new HttpError(500, 'product_creation_failed', 'The product could not be created.')
  const created = await query(`${productSelect} WHERE p.id=$1`, [createdId])
  if (!created.rows[0]) throw new HttpError(500, 'product_creation_failed', 'The product could not be loaded after creation.')
  return mapProduct(created.rows[0])
}

export async function updateAdminProduct(id: string, input: Record<string, unknown>) {
  requireDatabase()
  const columnMap: Record<string, string> = { name:'name',slug:'slug',description:'description',categoryId:'category_id',price:'price',image:'image',isFeatured:'is_featured',isAvailable:'is_available',flavor:'flavor',eggless:'eggless',preparationTime:'preparation_time',minimumAdvanceNotice:'minimum_advance_notice' }
  const updates = Object.entries(input).filter(([key]) => columnMap[key])
  if (!updates.length) throw new HttpError(400,'empty_update','Provide at least one product field.')
  const assignments = updates.map(([key], index) => `${columnMap[key]}=$${index + 2}`).join(',')
  const values = updates.map(([key,value]) => key === 'image' && value === '' ? null : value)
  const result = await query(`UPDATE products SET ${assignments},updated_at=NOW() WHERE id=$1 RETURNING id`, [id,...values])
  if (!result.rows[0]) missing()
  const product = await query(`${productSelect} WHERE p.id=$1`, [id])
  const updatedProduct = product.rows[0]
  if (!updatedProduct) throw new HttpError(404, 'not_found', 'The requested record was not found.')
  return mapProduct(updatedProduct)
}

export async function deactivateAdminProduct(id: string) {
  return updateAdminProduct(id, { isAvailable: false })
}

export async function listCakeRequests() {
  requireDatabase()
  const requests = await query(`SELECT id,name,email,phone,occasion,preferred_date,preferred_time,servings,flavor,style_description,cake_message,budget_range,special_instructions,status,created_at FROM custom_cake_requests ORDER BY created_at DESC LIMIT 500`)
  const ids = requests.rows.map((item) => item.id)
  const images = ids.length ? await query(`SELECT custom_cake_request_id,count(*)::int AS reference_image_count FROM custom_cake_reference_images WHERE custom_cake_request_id=ANY($1::uuid[]) GROUP BY custom_cake_request_id`, [ids]) : { rows: [] }
  const imageCounts = new Map(images.rows.map((row) => [row.custom_cake_request_id, row.reference_image_count]))
  return requests.rows.map((item) => ({ ...item, status: item.status === 'pending' ? 'new' : item.status === 'rejected' ? 'declined' : item.status, referenceImageCount: imageCounts.get(item.id) ?? 0 }))
}

export async function updateCakeRequestStatus(id: string, status: string) {
  requireDatabase()
  const storedStatus = status === 'new' ? 'pending' : status === 'declined' ? 'rejected' : status
  const result = await query(`UPDATE custom_cake_requests SET status=$2 WHERE id=$1 RETURNING id,status`, [id,storedStatus])
  if (!result.rows[0]) missing()
  return { ...result.rows[0], status: storedStatus === 'pending' ? 'new' : storedStatus === 'rejected' ? 'declined' : storedStatus }
}

export async function listCustomers(search = '') {
  requireDatabase()
  const result = await query(`SELECT u.id,u.email,u.raw_user_meta_data->>'full_name' AS name,u.created_at,count(o.id)::int AS order_count,max(o.customer_phone) AS phone FROM auth.users u LEFT JOIN admin_users a ON a.user_id=u.id LEFT JOIN orders o ON o.user_id=u.id WHERE a.user_id IS NULL AND u.deleted_at IS NULL AND (u.email ILIKE $1 OR coalesce(u.raw_user_meta_data->>'full_name','') ILIKE $1) GROUP BY u.id ORDER BY u.created_at DESC LIMIT 500`, [`%${search}%`])
  return result.rows
}

export async function listCoupons() {
  requireDatabase()
  const result = await query(`SELECT id,code,discount_type,discount_value,maximum_discount_amount,minimum_order_value,is_active,starts_at,expires_at,usage_limit,usage_count,created_at FROM coupons ORDER BY created_at DESC`)
  return result.rows
}

export async function createCoupon(input: Record<string, unknown>) {
  requireDatabase()
  const result = await query(`INSERT INTO coupons (code,discount_type,discount_value,maximum_discount_amount,minimum_order_value,is_active,starts_at,expires_at,usage_limit) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`, [input.code,input.discountType,input.discountValue,input.maximumDiscountAmount,input.minimumOrderValue,input.isActive,input.startsAt,input.expiresAt,input.usageLimit])
  return result.rows[0]
}

export async function updateCoupon(id: string, input: Record<string, unknown>) {
  requireDatabase()
  const columns: Record<string,string> = { code:'code',discountType:'discount_type',discountValue:'discount_value',maximumDiscountAmount:'maximum_discount_amount',minimumOrderValue:'minimum_order_value',isActive:'is_active',startsAt:'starts_at',expiresAt:'expires_at',usageLimit:'usage_limit' }
  const entries = Object.entries(input).filter(([key]) => columns[key])
  if (!entries.length) throw new HttpError(400,'empty_update','Provide at least one coupon field.')
  const sets = entries.map(([key],i)=>`${columns[key]}=$${i+2}`).join(',')
  const result = await query(`UPDATE coupons SET ${sets},updated_at=NOW() WHERE id=$1 RETURNING *`, [id,...entries.map(([,value])=>value)])
  if (!result.rows[0]) missing()
  return result.rows[0]
}

export async function listReviews() {
  requireDatabase()
  const result = await query(`SELECT r.id,r.product_id,p.name AS product_name,r.rating,r.title,r.body,r.status,r.created_at FROM reviews r LEFT JOIN products p ON p.id=r.product_id ORDER BY r.created_at DESC LIMIT 500`)
  return result.rows
}

export async function updateReviewStatus(id: string, status: string) {
  requireDatabase()
  const result = await query(`UPDATE reviews SET status=$2,updated_at=NOW() WHERE id=$1 RETURNING id,status`, [id,status])
  if (!result.rows[0]) missing()
  return result.rows[0]
}

export async function deleteReview(id: string) {
  requireDatabase()
  const result = await query(`DELETE FROM reviews WHERE id=$1 RETURNING id`, [id])
  if (!result.rows[0]) missing()
  return result.rows[0]
}

export async function getBusinessSettings() {
  requireDatabase()
  const result = await query(`SELECT bakery_name,phone,whatsapp,email,location,business_hours,delivery_enabled,pickup_enabled,delivery_fee,social_links,updated_at FROM business_settings WHERE id=1`)
  return result.rows[0] ?? null
}

export async function saveBusinessSettings(input: z.infer<typeof settingsSchema>) {
  requireDatabase()
  const result = await query(`INSERT INTO business_settings (id,bakery_name,phone,whatsapp,email,location,business_hours,delivery_enabled,pickup_enabled,delivery_fee,social_links) VALUES (1,$1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT (id) DO UPDATE SET bakery_name=EXCLUDED.bakery_name,phone=EXCLUDED.phone,whatsapp=EXCLUDED.whatsapp,email=EXCLUDED.email,location=EXCLUDED.location,business_hours=EXCLUDED.business_hours,delivery_enabled=EXCLUDED.delivery_enabled,pickup_enabled=EXCLUDED.pickup_enabled,delivery_fee=EXCLUDED.delivery_fee,social_links=EXCLUDED.social_links,updated_at=NOW() RETURNING *`, [input.bakeryName,input.phone,input.whatsapp,input.email,input.location,input.businessHours,input.deliveryEnabled,input.pickupEnabled,input.deliveryFee,input.socialLinks])
  return result.rows[0]
}

export async function listPublicHighlights() {
  requireDatabase()
  const result = await query(`SELECT id,title,description,image_path,display_order,is_active,created_at,updated_at FROM homepage_highlights WHERE is_active=TRUE ORDER BY display_order,created_at`)
  return result.rows.map((row) => ({ id: row.id, title: row.title, description: row.description, image: publicImageUrl(String(row.image_path)), displayOrder: row.display_order }))
}

export async function listAdminHighlights() {
  requireDatabase()
  return (await query(`SELECT id,title,description,image_path,display_order,is_active,created_at,updated_at FROM homepage_highlights ORDER BY display_order,created_at`)).rows.map((row) => ({ ...row, image: publicImageUrl(String(row.image_path)) }))
}

export async function createHighlight(input: { title: string; description: string; imagePath: string; displayOrder: number; isActive: boolean }) {
  requireDatabase()
  const result = await query(`INSERT INTO homepage_highlights(title,description,image_path,display_order,is_active) VALUES($1,$2,$3,$4,$5) RETURNING *`, [input.title,input.description,input.imagePath,input.displayOrder,input.isActive])
  const row = result.rows[0]
  if (!row) throw new HttpError(500, 'highlight_creation_failed', 'The highlight could not be created.')
  return { ...row, image: publicImageUrl(String(row.image_path)) }
}

export async function updateHighlight(id: string, input: Partial<{ title: string; description: string; imagePath: string; displayOrder: number; isActive: boolean }>) {
  requireDatabase()
  const columns: Record<string,string> = { title:'title',description:'description',imagePath:'image_path',displayOrder:'display_order',isActive:'is_active' }
  const entries = Object.entries(input).filter(([key]) => columns[key])
  if (!entries.length) throw new HttpError(400,'empty_update','Provide at least one highlight field.')
  const sets = entries.map(([key],i)=>`${columns[key]}=$${i+2}`).join(',')
  const result = await query(`UPDATE homepage_highlights SET ${sets},updated_at=NOW() WHERE id=$1 RETURNING *`, [id,...entries.map(([,value])=>value)])
  if (!result.rows[0]) missing()
  return { ...result.rows[0], image: publicImageUrl(String(result.rows[0].image_path)) }
}

export async function deleteHighlight(id: string) {
  requireDatabase()
  const result = await query(`DELETE FROM homepage_highlights WHERE id=$1 RETURNING *`, [id])
  if (!result.rows[0]) missing()
  return result.rows[0]
}
