import { AUTH_SETUP_MESSAGE } from '../lib/supabase'

export function authErrorMessage(error: unknown) {
  if (!(error instanceof Error)) return 'We could not complete that account request. Please try again.'
  const message = error.message.trim()
  const normalized = message.toLowerCase()

  if (message === AUTH_SETUP_MESSAGE) return AUTH_SETUP_MESSAGE
  if (normalized.includes('invalid login credentials') || normalized.includes('invalid_credentials')) return 'Email or password is incorrect.'
  if (normalized.includes('email not confirmed') || normalized.includes('email_not_confirmed')) return 'Please verify your email using the link we sent, then sign in.'
  if (normalized.includes('user already registered') || normalized.includes('already been registered')) return 'An account with this email already exists. Try signing in instead.'
  if (normalized.includes('rate limit') || normalized.includes('too many requests')) return 'Too many attempts. Please wait a few minutes and try again.'
  if (normalized.includes('password should be at least') || normalized.includes('weak password')) return 'Choose a stronger password with at least 8 characters.'
  if (normalized.includes('expired') || normalized.includes('invalid token')) return 'This link has expired or is invalid. Request a new password reset link.'
  if (normalized.includes('failed to fetch') || normalized.includes('network')) return 'We could not reach the authentication service. Check your connection and try again.'
  if (message === 'Enter a valid name.' || message.includes('Name must')) return message
  if (message.includes('Use at least 8 characters') || message.includes('passwords do not match')) return message
  return 'We could not complete that account request. Please try again.'
}
