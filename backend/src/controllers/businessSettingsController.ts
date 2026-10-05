import type { Request, Response } from 'express'
import { isDatabaseConfigured, query } from '../db/pool.js'

export async function publicBusinessSettingsController(_request: Request, response: Response) {
  if (!isDatabaseConfigured()) {
    response.json({ data: null })
    return
  }
  const result = await query(`SELECT bakery_name,phone,whatsapp,email,location,business_hours,delivery_enabled,pickup_enabled,delivery_fee,social_links FROM business_settings WHERE id=1`)
  const row = result.rows[0]
  if (!row) {
    response.json({ data: null })
    return
  }
  response.json({ data: {
    bakeryName: row.bakery_name,
    phone: row.phone,
    whatsapp: row.whatsapp,
    email: row.email,
    location: row.location,
    businessHours: row.business_hours,
    deliveryEnabled: row.delivery_enabled,
    pickupEnabled: row.pickup_enabled,
    deliveryFee: Number(row.delivery_fee),
    socialLinks: row.social_links,
  } })
}
