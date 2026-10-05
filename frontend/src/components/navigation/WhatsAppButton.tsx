import { MessageCircle } from 'lucide-react'

export function WhatsAppButton({ phoneNumber, message, className = '' }: { phoneNumber?: string; message?: string; className?: string }) {
  if (!phoneNumber) return null

  const text = message ? `?text=${encodeURIComponent(message)}` : ''
  const href = `https://wa.me/${phoneNumber.replace(/\D/g, '')}${text}`

  return <a href={href} target="_blank" rel="noreferrer" className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-berry-deep px-5 py-3 text-sm font-semibold text-white transition hover:bg-berry-brown focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-berry-deep focus-visible:ring-offset-2 ${className}`}><MessageCircle size={17} aria-hidden="true" /> WhatsApp BERRY</a>
}
