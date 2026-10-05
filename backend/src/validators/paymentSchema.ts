import { z } from 'zod'

export const verifyPaymentSchema = z.object({
  razorpayOrderId: z.string().min(1).max(100),
  razorpayPaymentId: z.string().min(1).max(100),
  razorpaySignature: z.string().regex(/^[a-f\d]{64}$/i),
}).strict()

export const failedPaymentSchema = z.object({
  razorpayOrderId: z.string().min(1).max(100),
  razorpayPaymentId: z.string().min(1).max(100),
}).strict()
