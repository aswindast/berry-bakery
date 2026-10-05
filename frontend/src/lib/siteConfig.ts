export type SocialLink = {
  label: string
  href?: string
}

export const siteConfig = {
  description: 'Sweet moments, beautifully baked.',
  location: 'Ezhuvanthala, near Cherpulassery, Palakkad, Kerala',
  phone: undefined as string | undefined,
  email: undefined as string | undefined,
  whatsappNumber: undefined as string | undefined,
  socialLinks: [] as SocialLink[],
} as const
