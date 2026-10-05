import type { Request, Response } from 'express'
import { listCategories } from '../services/categoryService.js'

export async function getCategoriesController(_request: Request, response: Response) {
  response.json({ data: await listCategories() })
}
