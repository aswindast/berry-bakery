import { z } from 'zod'

export const orderStatusSchema = z.object({ status: z.enum(['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled']) }).strict()

const productFields = {
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(140),
  description: z.string().trim().min(5).max(2000),
  categoryId: z.string().uuid(),
  price: z.number().finite().min(0).max(1000000),
  image: z.union([z.string().url().max(1000), z.string().regex(/^product-images\/[0-9a-f-]{36}\.(jpg|png|webp)$/i), z.literal(''), z.null()]).optional(),
  isFeatured: z.boolean(),
  isAvailable: z.boolean(),
  flavor: z.string().trim().max(120).nullable().optional(),
  eggless: z.boolean().nullable().optional(),
  preparationTime: z.string().trim().max(120).nullable().optional(),
  minimumAdvanceNotice: z.string().trim().max(120).nullable().optional(),
}
export const createProductSchema = z.object(productFields).strict()
export const updateProductSchema = z.object(productFields).partial().strict().refine((value) => Object.keys(value).length > 0)

export const cakeRequestStatusSchema = z.object({ status: z.enum(['pending', 'reviewing', 'quoted', 'approved', 'completed', 'rejected']) }).strict()

const couponFields = {
  code: z.string().trim().toUpperCase().regex(/^[A-Z0-9_-]{3,40}$/),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.number().finite().positive().max(1000000),
  maximumDiscountAmount: z.number().finite().positive().nullable().default(null),
  minimumOrderValue: z.number().finite().min(0).max(1000000).default(0),
  isActive: z.boolean().default(true),
  startsAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
  usageLimit: z.number().int().positive().nullable().default(null),
}
const couponObject = z.object(couponFields).strict()
export const couponSchema = couponObject.superRefine((value, context) => {
  if (new Date(value.startsAt) >= new Date(value.expiresAt)) context.addIssue({ code: 'custom', path: ['expiresAt'], message: 'Expiry must be after the start date.' })
  if (value.discountType === 'percentage' && value.discountValue > 100) context.addIssue({ code: 'custom', path: ['discountValue'], message: 'Percentage discounts cannot exceed 100.' })
})

export const couponUpdateSchema = couponObject.partial().strict().superRefine((value, context) => {
  if (value.startsAt && value.expiresAt && new Date(value.startsAt) >= new Date(value.expiresAt)) context.addIssue({ code: 'custom', path: ['expiresAt'], message: 'Expiry must be after the start date.' })
  if (value.discountType === 'percentage' && value.discountValue !== undefined && value.discountValue > 100) context.addIssue({ code: 'custom', path: ['discountValue'], message: 'Percentage discounts cannot exceed 100.' })
  if (Object.keys(value).length === 0) context.addIssue({ code: 'custom', message: 'At least one coupon field is required.' })
})
export const reviewStatusSchema = z.object({ status: z.enum(['approved', 'hidden']) }).strict()

export const highlightSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(1000).default(''),
  imagePath: z.string().trim().min(1).max(500).regex(/^homepage-highlights\/[\w.-]+$/),
  displayOrder: z.number().int().min(0).max(10000).default(0),
  isActive: z.boolean().default(true),
}).strict()
export const highlightUpdateSchema = highlightSchema.partial().strict().refine((value) => Object.keys(value).length > 0)

const hoursSchema = z.record(z.string(), z.string().max(100)).refine((value) => Object.keys(value).length <= 14)
const socialLinkSchema = z.object({ label: z.string().trim().min(1).max(50), href: z.string().url().max(500) }).strict()
export const settingsSchema = z.object({
  bakeryName: z.string().trim().min(2).max(120),
  phone: z.string().trim().max(30).nullable(),
  whatsapp: z.string().trim().max(30).nullable(),
  email: z.string().trim().email().max(120).nullable(),
  location: z.string().trim().max(500).nullable(),
  businessHours: hoursSchema,
  deliveryEnabled: z.boolean(),
  pickupEnabled: z.boolean(),
  deliveryFee: z.number().finite().min(0).max(100000),
  socialLinks: z.array(socialLinkSchema).max(12),
}).strict()
