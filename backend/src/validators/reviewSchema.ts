import { z } from 'zod'

export const createReviewSchema = z.object({
  orderItemId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(120).optional().default(''),
  body: z.string().trim().min(10).max(2000),
}).strict()

export type CreateReviewInput = z.infer<typeof createReviewSchema>
