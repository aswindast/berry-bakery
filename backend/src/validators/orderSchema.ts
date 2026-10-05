import { z } from 'zod'

const orderItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).max(50),
})

export const createOrderSchema = z.object({
  customerName: z.string().trim().min(2).max(80),
  customerEmail: z.string().trim().email().max(120),
  customerPhone: z.string().trim().regex(/^[+\d][\d\s()-]{7,19}$/),
  fulfillmentType: z.enum(['delivery', 'pickup']),
  deliveryAddress: z.string().trim().min(5).max(240).optional(),
  deliveryCity: z.string().trim().min(2).max(100).optional(),
  deliveryState: z.string().trim().min(2).max(100).optional(),
  deliveryPincode: z.string().trim().regex(/^\d{6}$/).optional(),
  deliveryInstructions: z.string().trim().max(500).optional(),
  pickupInstructions: z.string().trim().max(500).optional(),
  couponCode: z.string().trim().toUpperCase().regex(/^[A-Z0-9_-]{3,40}$/).optional(),
  items: z.array(orderItemSchema).min(1).max(30),
}).strict().superRefine((value, context) => {
  const productIds = value.items.map((item) => item.productId)
  if (new Set(productIds).size !== productIds.length) {
    context.addIssue({ code: 'custom', path: ['items'], message: 'Each product must appear only once.' })
  }
  if (value.fulfillmentType === 'delivery') {
    for (const field of ['deliveryAddress', 'deliveryCity', 'deliveryState', 'deliveryPincode'] as const) {
      if (!value[field]) context.addIssue({ code: 'custom', path: [field], message: 'This field is required for delivery.' })
    }
    if (value.pickupInstructions) context.addIssue({ code: 'custom', path: ['pickupInstructions'], message: 'Pickup instructions are not allowed for delivery.' })
  } else if (value.deliveryAddress || value.deliveryCity || value.deliveryState || value.deliveryPincode || value.deliveryInstructions) {
    context.addIssue({ code: 'custom', path: ['fulfillmentType'], message: 'Delivery details are not allowed for pickup.' })
  }
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>
