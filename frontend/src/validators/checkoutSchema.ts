import { z } from 'zod'

export const checkoutSchema = z.object({
  customerName: z.string().trim().min(2, 'Enter your full name.').max(80, 'Name must be 80 characters or fewer.'),
  customerEmail: z.string().trim().email('Enter a valid email address.').max(120),
  customerPhone: z.string().trim().regex(/^[+\d][\d\s()-]{7,19}$/, 'Enter a valid phone number.'),
  fulfillmentType: z.enum(['delivery', 'pickup']),
  deliveryAddress: z.string().trim().max(240).optional().default(''),
  deliveryCity: z.string().trim().max(100).optional().default(''),
  deliveryState: z.string().trim().max(100).optional().default(''),
  deliveryPincode: z.string().trim().optional().default(''),
  deliveryInstructions: z.string().trim().max(500).optional().default(''),
  pickupInstructions: z.string().trim().max(500).optional().default(''),
}).superRefine((value, context) => {
  if (value.fulfillmentType === 'delivery') {
    if (value.deliveryAddress.length < 5) context.addIssue({ code: 'custom', path: ['deliveryAddress'], message: 'Enter your delivery address.' })
    if (value.deliveryCity.length < 2) context.addIssue({ code: 'custom', path: ['deliveryCity'], message: 'Enter your city.' })
    if (value.deliveryState.length < 2) context.addIssue({ code: 'custom', path: ['deliveryState'], message: 'Enter your state.' })
    if (!/^\d{6}$/.test(value.deliveryPincode)) context.addIssue({ code: 'custom', path: ['deliveryPincode'], message: 'Enter a 6-digit PIN code.' })
  }
})

export type CheckoutValues = z.infer<typeof checkoutSchema>
