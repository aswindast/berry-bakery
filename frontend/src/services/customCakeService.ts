import type { CustomCakeRequest } from '../types/customCake'
import { apiConfig } from '../lib/api'

export type CustomCakeSubmissionResult = {
  id: string
  status: string
  createdAt: string
}

export async function submitCustomCakeRequest(request: CustomCakeRequest, accessToken: string): Promise<CustomCakeSubmissionResult> {
  const fields = {
    name: request.name,
    email: request.email,
    phone: request.phone,
    occasion: request.occasion,
    preferredDate: request.preferredDate,
    preferredTime: request.preferredTime,
    servings: request.servings,
    flavor: request.flavor,
    styleDescription: request.styleDescription,
    cakeMessage: request.cakeMessage,
    budgetRange: request.budgetRange,
    specialInstructions: request.specialInstructions,
  }
  const response = await fetch(`${apiConfig.baseUrl}/custom-cake-requests`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(fields),
  })
  const result = await response.json() as { data?: CustomCakeSubmissionResult; error?: { message?: string } }
  if (!response.ok || !result.data) throw new Error(result.error?.message ?? `Request failed (${response.status}).`)
  return result.data
}

export type CustomerCakeRequest = {
  id: string
  name: string
  email: string
  phone: string
  occasion: string
  preferred_date: string
  preferred_time: string
  servings: number
  flavor: string | null
  style_description: string
  cake_message: string | null
  budget_range: string | null
  special_instructions: string | null
  status: string
  created_at: string
  updated_at: string
}

export async function getCustomerCakeRequests(accessToken: string): Promise<CustomerCakeRequest[]> {
  const response = await fetch(`${apiConfig.baseUrl}/custom-cake-requests`, { headers: { authorization: `Bearer ${accessToken}` } })
  const result = await response.json() as { data?: CustomerCakeRequest[]; error?: { message?: string } }
  if (!response.ok || !result.data) throw new Error(result.error?.message ?? `Request failed (${response.status}).`)
  return result.data
}
