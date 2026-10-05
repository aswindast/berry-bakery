import type { Request, Response } from 'express'
import { listProducts, getProduct } from '../services/productService.js'
import type { ProductFilters } from '../types/api.js'
import { HttpError } from '../utils/httpError.js'

function queryValue(value: unknown) {
  return typeof value === 'string' ? value : undefined
}

function booleanQuery(value: unknown, key: string) {
  const parsed = queryValue(value)
  if (parsed === undefined) return undefined
  if (parsed === 'true') return true
  if (parsed === 'false') return false
  throw new HttpError(400, 'invalid_query', `${key} must be true or false.`)
}

export async function getProductsController(request: Request, response: Response) {
  const sort = queryValue(request.query.sort)
  const allowedSorts = ['featured', 'newest', 'price-low', 'price-high', 'name'] as const
  if (sort && !allowedSorts.includes(sort as typeof allowedSorts[number])) throw new HttpError(400, 'invalid_query', 'sort is not supported.')
  const filters: ProductFilters = { search: queryValue(request.query.search), category: queryValue(request.query.category), available: booleanQuery(request.query.available, 'available'), featured: booleanQuery(request.query.featured, 'featured'), sort: sort as ProductFilters['sort'] }
  response.json({ data: await listProducts(filters) })
}

export async function getProductController(request: Request, response: Response) {
  const slug = typeof request.params.slug === 'string' ? request.params.slug : undefined
  if (!slug) throw new HttpError(400, 'invalid_slug', 'A product slug is required.')
  const product = await getProduct(slug)
  if (!product) throw new HttpError(404, 'product_not_found', 'Product not found.')
  response.json({ data: product })
}
