import { Mail, MapPin, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { BerryLogo } from '../brand/BerryLogo'
import { Container } from '../ui'
import { siteConfig } from '../../lib/siteConfig'
import { WhatsAppButton } from './WhatsAppButton'
import { usePublicBusinessSettings } from '../../hooks/usePublicBusinessSettings'

const exploreLinks = [
  { label: 'Home', to: '/' },
  { label: 'Menu', to: '/menu' },
  { label: 'Custom Cakes', to: '/custom-cakes' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
]

const customerLinks = [
  { label: 'My Account', to: '/account' },
  { label: 'My Orders', to: '/account/orders' },
  { label: 'Delivery & Pickup', to: '/delivery-pickup' },
  { label: 'FAQ', to: '/faq' },
]

export function Footer() {
  const settings = usePublicBusinessSettings()
  const phone = settings?.phone ?? siteConfig.phone
  const email = settings?.email ?? siteConfig.email
  const whatsapp = settings?.whatsapp ?? siteConfig.whatsappNumber
  const location = settings?.location ?? siteConfig.location
  const socials = settings?.socialLinks ?? siteConfig.socialLinks
  const businessHours = settings?.businessHours ?? {}
  return <footer className="border-t border-berry-deep/10 bg-berry-beige/45">
    <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.35fr_0.8fr_0.9fr_1.35fr]">
      <div><BerryLogo context="footer" /><p className="mt-4 max-w-xs text-sm leading-6 text-berry-muted">{siteConfig.description}</p><WhatsAppButton phoneNumber={whatsapp} message="Hello BERRY, I would like to know more about your bakes." className="mt-5" /></div>
      <div><h2 className="text-xs font-bold uppercase tracking-[0.18em] text-berry-deep">Explore</h2><nav aria-label="Explore" className="mt-4 flex flex-col items-start gap-3">{exploreLinks.map((link) => <Link key={link.to} to={link.to} className="text-sm text-berry-muted hover:text-berry-deep">{link.label}</Link>)}</nav></div>
      <div><h2 className="text-xs font-bold uppercase tracking-[0.18em] text-berry-deep">Customer</h2><nav aria-label="Customer" className="mt-4 flex flex-col items-start gap-3">{customerLinks.map((link) => <Link key={link.to} to={link.to} className="text-sm text-berry-muted hover:text-berry-deep">{link.label}</Link>)}</nav></div>
      <div><h2 className="text-xs font-bold uppercase tracking-[0.18em] text-berry-deep">Contact</h2><address className="mt-4 flex flex-col gap-3 text-sm not-italic text-berry-muted"><span className="flex items-start gap-2"><MapPin size={17} className="mt-0.5 shrink-0 text-berry-pink" />{location}</span>{phone && <a href={`tel:${phone}`} className="flex items-center gap-2 hover:text-berry-deep"><Phone size={16} className="text-berry-pink" />{phone}</a>}{email && <a href={`mailto:${email}`} className="flex items-center gap-2 hover:text-berry-deep"><Mail size={16} className="text-berry-pink" />{email}</a>}{Object.entries(businessHours).map(([day, hours]) => <span key={day} className="capitalize">{day}: {hours}</span>)}{socials.map((social) => social.href ? <a key={social.label} href={social.href} target="_blank" rel="noreferrer" className="hover:text-berry-deep">{social.label}</a> : null)}</address></div>
    </Container>
    <div className="border-t border-berry-deep/10"><Container className="flex flex-col gap-2 py-5 text-xs text-berry-muted sm:flex-row sm:items-center sm:justify-between"><span>© 2026 BERRY Home Bakery</span><span>Made for sweet moments.</span></Container></div>
  </footer>
}
