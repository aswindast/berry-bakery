import { apiConfig } from '../lib/api'

export type PublicBusinessSettings = {
  bakeryName: string
  phone: string | null
  whatsapp: string | null
  email: string | null
  location: string | null
  businessHours: Record<string, string>
  deliveryEnabled: boolean
  pickupEnabled: boolean
  deliveryFee: number
  socialLinks: Array<{ label: string; href: string }>
}

export async function fetchPublicBusinessSettings(): Promise<PublicBusinessSettings | null> {
  const response = await fetch(`${apiConfig.baseUrl}/business-settings`)
  if (!response.ok) return null
  const result = await response.json() as { data?: PublicBusinessSettings | null }
  return result.data ?? null
}
