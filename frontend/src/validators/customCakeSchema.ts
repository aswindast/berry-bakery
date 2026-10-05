import { z } from 'zod'
import type { CustomCakeFormValues } from '../types/customCake'

export const customCakeSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name.').max(80, 'Name is too long.'),
  email: z.string().trim().email('Please enter a valid email address.').max(120, 'Email is too long.'),
  phone: z.string().trim().regex(/^[+\d][\d\s()-]{7,19}$/, 'Please enter a valid phone number.'),
  occasion: z.enum(['Birthday', 'Wedding', 'Anniversary', 'Baby Shower', 'Engagement', 'Graduation', 'Celebration', 'Other'], { error: 'Please choose an occasion.' }),
  preferredDate: z.string().refine((value) => { const date = new Date(`${value}T00:00:00`); return value.length > 0 && !Number.isNaN(date.getTime()) }, 'Please choose a preferred date.'),
  preferredTime: z.enum(['Flexible', 'Morning', 'Afternoon', 'Evening'], { error: 'Please choose a preferred time.' }),
  servings: z.string().regex(/^[1-9]\d{0,2}$/, 'Enter a serving count between 1 and 999.'),
  flavor: z.string().trim().max(80, 'Flavor is too long.'),
  styleDescription: z.string().trim().min(20, 'Please share a little more about your cake idea.').max(1000, 'Description is too long.'),
  cakeMessage: z.string().trim().max(120, 'Cake message is too long.'),
  budgetRange: z.enum(['', 'Under ₹1,000', '₹1,000 – ₹2,000', '₹2,000 – ₹4,000', 'Above ₹4,000'], { error: 'Please choose a budget range.' }),
  specialInstructions: z.string().trim().max(600, 'Special instructions are too long.'),
})

export type CustomCakeSchemaValues = z.infer<typeof customCakeSchema>

export const defaultCustomCakeValues: CustomCakeFormValues = {
  name: '',
  email: '',
  phone: '',
  occasion: '',
  preferredDate: '',
  preferredTime: '',
  servings: '',
  flavor: '',
  styleDescription: '',
  cakeMessage: '',
  budgetRange: '',
  specialInstructions: '',
}
