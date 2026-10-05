import type { Request, Response } from 'express'
import { z } from 'zod'
import { HttpError } from '../utils/httpError.js'
import { createProductSchema, updateProductSchema, orderStatusSchema, cakeRequestStatusSchema, couponSchema, couponUpdateSchema, reviewStatusSchema, settingsSchema, highlightSchema, highlightUpdateSchema } from '../validators/adminSchemas.js'
import * as admin from '../repositories/adminRepository.js'
import { deletePublicImage, uploadPublicImage } from '../services/imageStorageService.js'

function parse<T>(schema: z.ZodType<T>, body: unknown) {
  const result = schema.safeParse(body)
  if (!result.success) throw new HttpError(400, 'validation_error', 'Please check the submitted values.', result.error.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message })))
  return result.data
}

function uuid(request: Request) {
  const id = request.params.id
  if (typeof id !== 'string' || !z.string().uuid().safeParse(id).success) throw new HttpError(400, 'invalid_id', 'A valid record ID is required.')
  return id
}

function search(request: Request) {
  const value = request.query.search
  return typeof value === 'string' ? value.trim().slice(0, 100) : ''
}

export async function adminSession(request: Request, response: Response) { response.json({ data: { userId: request.authUser?.id, email: request.authUser?.email } }) }
export async function summary(_request: Request, response: Response) { response.json({ data: await admin.adminSummary() }) }
export async function orders(_request: Request, response: Response) { response.json({ data: await admin.listAdminOrders() }) }
export async function orderDetails(request: Request, response: Response) { const result = await admin.getAdminOrder(uuid(request)); if (!result) throw new HttpError(404,'not_found','Order not found.'); response.json({ data: result }) }
export async function changeOrderStatus(request: Request, response: Response) { response.json({ data: await admin.updateAdminOrderStatus(uuid(request),parse(orderStatusSchema,request.body).status) }) }
export async function products(request: Request, response: Response) { response.json({ data: await admin.listAdminProducts(search(request)) }) }
export async function addProduct(request: Request, response: Response) { response.status(201).json({ data: await admin.createAdminProduct(parse(createProductSchema,request.body)) }) }
export async function editProduct(request: Request, response: Response) { response.json({ data: await admin.updateAdminProduct(uuid(request),parse(updateProductSchema,request.body)) }) }
export async function removeProduct(request: Request, response: Response) { response.json({ data: await admin.deactivateAdminProduct(uuid(request)) }) }
export async function cakeRequests(_request: Request, response: Response) { response.json({ data: await admin.listCakeRequests() }) }
export async function changeCakeRequestStatus(request: Request, response: Response) { response.json({ data: await admin.updateCakeRequestStatus(uuid(request),parse(cakeRequestStatusSchema,request.body).status) }) }
export async function customers(request: Request, response: Response) { response.json({ data: await admin.listCustomers(search(request)) }) }
export async function coupons(_request: Request, response: Response) { response.json({ data: await admin.listCoupons() }) }
export async function addCoupon(request: Request, response: Response) { response.status(201).json({ data: await admin.createCoupon(parse(couponSchema,request.body)) }) }
export async function editCoupon(request: Request, response: Response) { response.json({ data: await admin.updateCoupon(uuid(request),parse(couponUpdateSchema,request.body)) }) }
export async function reviews(_request: Request, response: Response) { response.json({ data: await admin.listReviews() }) }
export async function changeReviewStatus(request: Request, response: Response) { response.json({ data: await admin.updateReviewStatus(uuid(request),parse(reviewStatusSchema,request.body).status) }) }
export async function removeReview(request: Request, response: Response) { response.json({ data: await admin.deleteReview(uuid(request)) }) }
export async function settings(_request: Request, response: Response) { response.json({ data: await admin.getBusinessSettings() }) }
export async function updateSettings(request: Request, response: Response) { response.json({ data: await admin.saveBusinessSettings(parse(settingsSchema,request.body)) }) }
export async function uploadImage(request: Request, response: Response) {
  if (!Buffer.isBuffer(request.body)) throw new HttpError(400, 'invalid_image_file', 'An image file is required.')
  const kind = typeof request.params.kind === 'string' ? request.params.kind : ''
  const mime = request.header('content-type')?.split(';')[0]?.trim() ?? ''
  const token = request.header('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1]
  if (!token) throw new HttpError(401, 'authentication_required', 'Sign in to continue.')
  response.status(201).json({ data: { path: await uploadPublicImage(kind, request.body, mime, token) } })
}
export async function deleteImage(request: Request, response: Response) {
  const { path } = parse(z.object({ path: z.string().min(1).max(500) }).strict(), request.body)
  const token = request.header('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1]
  if (!token) throw new HttpError(401, 'authentication_required', 'Sign in to continue.')
  await deletePublicImage(path, token)
  response.json({ data: { deleted: true } })
}
export async function publicHighlights(_request: Request, response: Response) { response.json({ data: await admin.listPublicHighlights() }) }
export async function highlights(_request: Request, response: Response) { response.json({ data: await admin.listAdminHighlights() }) }
export async function addHighlight(request: Request, response: Response) { response.status(201).json({ data: await admin.createHighlight(parse(highlightSchema, request.body)) }) }
export async function editHighlight(request: Request, response: Response) { response.json({ data: await admin.updateHighlight(uuid(request), parse(highlightUpdateSchema, request.body)) }) }
export async function removeHighlight(request: Request, response: Response) {
  const removed = await admin.deleteHighlight(uuid(request))
  if (!removed) throw new HttpError(404, 'not_found', 'The requested record was not found.')
  const token = request.header('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1]
  if (token) await deletePublicImage(String(removed.image_path), token)
  response.json({ data: { id: removed.id } })
}
