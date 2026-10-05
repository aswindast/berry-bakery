import type { RequestHandler } from 'express'
import { query } from '../db/pool.js'
import { HttpError } from '../utils/httpError.js'

export const requireAdmin: RequestHandler = async (request, _response, next) => {
  if (!request.authUser?.id) {
    next(new HttpError(401, 'authentication_required', 'Sign in to continue.'))
    return
  }
  try {
    const result = await query<{ is_active: boolean }>('SELECT is_active FROM admin_users WHERE user_id = $1', [request.authUser.id])
    if (!result.rows[0]?.is_active) {
      next(new HttpError(403, 'admin_required', 'You do not have permission to access business management.'))
      return
    }
    next()
  } catch (error) {
    next(error)
  }
}
