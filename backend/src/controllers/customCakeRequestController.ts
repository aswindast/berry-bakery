import type { Request, Response } from 'express'
import { createCustomCakeRequest, getCustomCakeRequest, listCustomCakeRequests } from '../repositories/customCakeRequestRepository.js'
import { customCakeRequestSchema } from '../validators/customCakeRequestSchema.js'
import { HttpError } from '../utils/httpError.js'

export async function createCustomCakeRequestController(request: Request, response: Response) {
  if (!request.authUser?.id) throw new HttpError(401, 'authentication_required', 'Sign in to submit a custom cake request.')
  const parsed = customCakeRequestSchema.safeParse(request.body)
  if (!parsed.success) {
    throw new HttpError(400, 'validation_error', 'Please check the request fields.', parsed.error.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message })))
  }
  const created = await createCustomCakeRequest(request.authUser.id, parsed.data)
  if (!created) throw new HttpError(500, 'request_creation_failed', 'The request could not be created.')
  response.status(201).json({ data: { id: created.id, status: created.status, createdAt: created.created_at } })
}

export async function listCustomCakeRequestsController(request: Request, response: Response) {
  if (!request.authUser?.id) throw new HttpError(401, 'authentication_required', 'Sign in to view your custom cake requests.')
  response.json({ data: await listCustomCakeRequests(request.authUser.id) })
}

export async function getCustomCakeRequestController(request: Request, response: Response) {
  if (!request.authUser?.id) throw new HttpError(401, 'authentication_required', 'Sign in to view this custom cake request.')
  const id = request.params.id
  if (typeof id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) throw new HttpError(400, 'invalid_request_id', 'A valid request ID is required.')
  const record = await getCustomCakeRequest(request.authUser.id, id)
  if (!record) throw new HttpError(404, 'request_not_found', 'Custom cake request not found.')
  response.json({ data: record })
}
