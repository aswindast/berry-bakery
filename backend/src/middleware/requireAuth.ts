import type { RequestHandler } from 'express'
import { env } from '../config/env.js'
import { HttpError } from '../utils/httpError.js'

export const requireAuth: RequestHandler = async (request, _response, next) => {
  const authorization = request.header('authorization')
  const accessToken = authorization?.match(/^Bearer\s+(.+)$/i)?.[1]

  if (!accessToken) {
    next(new HttpError(401, 'authentication_required', 'Sign in to continue.'))
    return
  }
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    next(new HttpError(503, 'authentication_unavailable', 'Authentication is not configured on the server.'))
    return
  }

  try {
    const response = await fetch(`${env.supabaseUrl.replace(/\/$/, '')}/auth/v1/user`, {
      headers: { apikey: env.supabaseAnonKey, authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(5000),
    })
    if (!response.ok) {
      next(new HttpError(401, 'invalid_session', 'Your session is invalid or has expired.'))
      return
    }

    const user = await response.json() as { id?: unknown; email?: unknown }
    if (typeof user.id !== 'string') {
      next(new HttpError(401, 'invalid_session', 'Your session is invalid or has expired.'))
      return
    }
    request.authUser = { id: user.id, email: typeof user.email === 'string' ? user.email : undefined }
    next()
  } catch {
    next(new HttpError(503, 'authentication_unavailable', 'Could not verify your session. Please try again.'))
  }
}
