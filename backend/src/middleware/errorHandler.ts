import type { ErrorRequestHandler } from 'express'
import { HttpError } from '../utils/httpError.js'

export const errorHandler: ErrorRequestHandler = (error, _request, response, next) => {
  if (response.headersSent) {
    next(error)
    return
  }

  if (error instanceof HttpError) {
    response.status(error.statusCode).json({ error: { code: error.code, message: error.message, details: error.details } })
    return
  }

  if (typeof error === 'object' && error !== null && 'type' in error && error.type === 'entity.too.large') {
    response.status(413).json({ error: { code: 'image_too_large', message: 'Images must be smaller than 5 MB.' } })
    return
  }

  console.error(error)
  response.status(500).json({ error: { code: 'internal_error', message: 'Something went wrong.' } })
}
