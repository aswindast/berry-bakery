import { z } from 'zod'

export const couponApplicationSchema = z.object({
  code: z.string().trim().toUpperCase().regex(/^[A-Z0-9_-]{3,40}$/),
  fulfillmentType: z.enum(['delivery', 'pickup']),
  items: z.array(z.object({ productId: z.string().uuid(), quantity: z.number().int().min(1).max(50) }).strict()).min(1).max(30),
}).strict().superRefine((value, context) => {
  if (new Set(value.items.map((item) => item.productId)).size !== value.items.length) context.addIssue({ code: 'custom', path: ['items'], message: 'Each product must appear only once.' })
})

export type CouponApplicationInput = z.infer<typeof couponApplicationSchema>