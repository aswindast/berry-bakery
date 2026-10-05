import { z } from 'zod'

export const customCakeRequestSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(120),
  phone: z.string().trim().regex(/^[+\d][\d\s()-]{7,19}$/),
  occasion: z.enum(['Birthday', 'Wedding', 'Anniversary', 'Baby Shower', 'Engagement', 'Graduation', 'Celebration', 'Other']),
  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => !Number.isNaN(new Date(`${value}T00:00:00`).getTime())),
  preferredTime: z.enum(['Flexible', 'Morning', 'Afternoon', 'Evening']),
  servings: z.coerce.number().int().positive().max(999),
  flavor: z.string().trim().max(80).optional().default(''),
  styleDescription: z.string().trim().min(20).max(1000),
  cakeMessage: z.string().trim().max(120).optional().default(''),
  budgetRange: z.enum(['', 'Under ₹1,000', '₹1,000 – ₹2,000', '₹2,000 – ₹4,000', 'Above ₹4,000']).optional().default(''),
  specialInstructions: z.string().trim().max(600).optional().default(''),
})

export type CustomCakeRequestInput = z.infer<typeof customCakeRequestSchema>
