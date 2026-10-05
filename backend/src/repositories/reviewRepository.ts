import { connectDatabase, isDatabaseConfigured, query } from '../db/pool.js'
import type { CreateReviewInput } from '../validators/reviewSchema.js'
import { HttpError } from '../utils/httpError.js'

function requireDatabase() {
  if (!isDatabaseConfigured()) throw new HttpError(503, 'database_unavailable', 'Database is not configured.')
}

export async function eligibleReviewItems(userId: string, orderId?: string) {
  requireDatabase()
  const values: unknown[] = [userId]
  const orderFilter = orderId ? ` AND o.id=$${values.push(orderId)}` : ''
  const result = await query(`SELECT oi.id AS order_item_id,oi.order_id,oi.product_id,p.name AS product_name,o.created_at AS purchased_at FROM order_items oi JOIN orders o ON o.id=oi.order_id JOIN products p ON p.id=oi.product_id WHERE o.user_id=$1 AND o.payment_status='paid' AND o.status <> 'cancelled' AND p.is_available=TRUE AND oi.review_submitted_at IS NULL${orderFilter} ORDER BY o.created_at DESC`, values)
  return result.rows
}

export async function submitReview(userId: string, input: CreateReviewInput) {
  requireDatabase()
  const client = await connectDatabase()
  try {
    await client.query('BEGIN')
    const eligible = await client.query<{ order_id: string; product_id: string }>(`SELECT oi.order_id,oi.product_id FROM order_items oi JOIN orders o ON o.id=oi.order_id JOIN products p ON p.id=oi.product_id WHERE oi.id=$1 AND o.user_id=$2 AND o.payment_status='paid' AND o.status <> 'cancelled' AND p.is_available=TRUE AND oi.review_submitted_at IS NULL FOR UPDATE OF oi`, [input.orderItemId,userId])
    const purchase = eligible.rows[0]
    if (!purchase) throw new HttpError(403, 'review_not_eligible', 'A review can only be submitted once for a paid purchase you own.')
    const created = await client.query(`INSERT INTO reviews (user_id,product_id,order_id,order_item_id,rating,title,body,status) VALUES ($1,$2,$3,$4,$5,NULLIF($6,''),$7,'pending') RETURNING id,rating,title,body,status,created_at,product_id,order_id,order_item_id`, [userId,purchase.product_id,purchase.order_id,input.orderItemId,input.rating,input.title,input.body])
    await client.query('UPDATE order_items SET review_submitted_at=NOW() WHERE id=$1 AND review_submitted_at IS NULL', [input.orderItemId])
    await client.query('COMMIT')
    return created.rows[0]
  } catch (error) {
    await client.query('ROLLBACK')
    if (error && typeof error === 'object' && 'code' in error && error.code === '23505') throw new HttpError(409, 'review_already_submitted', 'A review has already been submitted for this purchase.')
    throw error
  } finally {
    client.release()
  }
}

export async function listMyReviews(userId: string) {
  requireDatabase()
  const result = await query(`SELECT r.id,r.order_id,r.order_item_id,r.product_id,p.name AS product_name,r.rating,r.title,r.body,r.status,r.created_at FROM reviews r LEFT JOIN products p ON p.id=r.product_id WHERE r.user_id=$1 ORDER BY r.created_at DESC`, [userId])
  return result.rows
}

export async function approvedProductReviews(productId: string) {
  requireDatabase()
  const product = await query<{ id: string }>(`SELECT id FROM products WHERE id=$1 AND is_available=TRUE`, [productId])
  if (!product.rows[0]) throw new HttpError(404, 'product_not_found', 'Product not found.')
  const reviews = await query(`SELECT id,rating,title,body,created_at FROM reviews WHERE product_id=$1 AND status='approved' ORDER BY created_at DESC LIMIT 100`, [productId])
  const aggregate = await query<{ average_rating: string | null; total_reviews: number }>(`SELECT round(avg(rating)::numeric,1)::text AS average_rating,count(*)::int AS total_reviews FROM reviews WHERE product_id=$1 AND status='approved'`, [productId])
  return { averageRating: aggregate.rows[0]?.average_rating ? Number(aggregate.rows[0].average_rating) : null, totalReviews: aggregate.rows[0]?.total_reviews ?? 0, reviews: reviews.rows }
}
