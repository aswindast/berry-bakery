import { Link } from 'react-router-dom'
import { Mail, MapPin, Phone } from 'lucide-react'
import { usePublicBusinessSettings } from '../hooks/usePublicBusinessSettings'
import { siteConfig } from '../lib/siteConfig'
import { AppShell } from '../layouts/AppShell'
import { WhatsAppButton } from '../components/navigation/WhatsAppButton'
import { Card, Container, Section } from '../components/ui'

function InfoLayout({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return <AppShell><Section className="bg-berry-cream"><Container><p className="text-xs font-bold uppercase tracking-[0.22em] text-berry-pink">BERRY / {eyebrow}</p><h1 className="mt-3 font-serif text-5xl text-berry-deep">{title}</h1></Container></Section><Section><Container className="max-w-4xl">{children}</Container></Section></AppShell>
}

export function AboutPage() {
  const settings = usePublicBusinessSettings()
  const location = settings?.location ?? siteConfig.location
  return <InfoLayout eyebrow="About" title="Thoughtfully made, close to home."><Card className="space-y-5 p-6 leading-7 text-berry-muted sm:p-9"><p>BERRY is a home bakery serving the local community with cakes, pastries, sweets and desserts made for everyday treats and special moments.</p><p>The bakery is based in {location}. Explore the menu or share an idea through a custom cake request; requests are reviewed before pricing or confirmation.</p><Link to="/menu" className="inline-flex font-semibold text-berry-deep hover:text-berry-pink">Explore the menu →</Link></Card></InfoLayout>
}

export function ContactPage() {
  const settings = usePublicBusinessSettings()
  const phone = settings?.phone ?? siteConfig.phone
  const email = settings?.email ?? siteConfig.email
  const whatsapp = settings?.whatsapp ?? siteConfig.whatsappNumber
  const location = settings?.location ?? siteConfig.location
  return <InfoLayout eyebrow="Contact" title="Come say hello."><div className="grid gap-5 sm:grid-cols-2"><Card className="space-y-5 p-6"><h2 className="font-serif text-2xl text-berry-deep">Reach BERRY</h2>{phone && <a className="flex items-center gap-3 text-berry-muted hover:text-berry-deep" href={`tel:${phone}`}><Phone size={18}/>{phone}</a>}{email && <a className="flex items-center gap-3 break-all text-berry-muted hover:text-berry-deep" href={`mailto:${email}`}><Mail size={18}/>{email}</a>}{whatsapp && <WhatsAppButton phoneNumber={whatsapp} message="Hello BERRY, I would like to get in touch."/>}{!phone && !email && !whatsapp && <p className="text-sm leading-6 text-berry-muted">Contact channels are not configured yet. Please check back later.</p>}</Card><Card className="p-6"><h2 className="font-serif text-2xl text-berry-deep">Location</h2><p className="mt-4 flex items-start gap-3 text-sm leading-6 text-berry-muted"><MapPin size={18} className="mt-1 shrink-0 text-berry-pink"/>{location}</p><p className="mt-5 text-sm text-berry-muted">For custom cakes, include your preferred date and details in a request.</p><Link className="mt-4 inline-flex font-semibold text-berry-deep hover:text-berry-pink" to="/custom-cakes">Request a custom cake →</Link></Card></div></InfoLayout>
}

export function DeliveryPickupPage() {
  const settings = usePublicBusinessSettings()
  return <InfoLayout eyebrow="Delivery & pickup" title="Plan the handoff."><div className="grid gap-5 md:grid-cols-2"><Card className="p-6"><h2 className="font-serif text-2xl text-berry-deep">Delivery</h2><p className="mt-3 text-sm leading-6 text-berry-muted">{settings ? settings.deliveryEnabled ? `Delivery is currently available. The configured delivery fee is ₹${settings.deliveryFee.toLocaleString('en-IN')}.` : 'Delivery is currently unavailable.' : 'Delivery availability and any fee will be confirmed by BERRY.'}</p></Card><Card className="p-6"><h2 className="font-serif text-2xl text-berry-deep">Pickup</h2><p className="mt-3 text-sm leading-6 text-berry-muted">{settings ? settings.pickupEnabled ? 'Pickup is currently available. Timing will be confirmed by BERRY.' : 'Pickup is currently unavailable.' : 'Pickup availability and timing will be confirmed by BERRY.'}</p></Card></div>{settings?.businessHours && Object.keys(settings.businessHours).length > 0 && <Card className="mt-5 p-6"><h2 className="font-serif text-2xl text-berry-deep">Business hours</h2><dl className="mt-4 grid gap-3 sm:grid-cols-2">{Object.entries(settings.businessHours).map(([day, hours])=><div key={day} className="flex justify-between gap-4 border-b border-berry-deep/10 pb-2 text-sm"><dt className="font-semibold capitalize text-berry-deep">{day}</dt><dd className="text-right text-berry-muted">{hours}</dd></div>)}</dl></Card>}<p className="mt-6 text-sm text-berry-muted">Availability, delivery areas, and timing are confirmed with each order. <Link className="font-semibold text-berry-deep hover:text-berry-pink" to="/contact">Contact BERRY</Link> for current details.</p></InfoLayout>
}

export function FAQPage() {
  const settings = usePublicBusinessSettings()
  const answers = [
    ['How do I place an order?', 'Browse the menu, add available items to your cart, and continue to checkout. Checkout requires an account.'],
    ['Can I request a custom cake?', 'Yes. Submit a custom cake request with your occasion, date, servings, and design details. BERRY reviews the request before discussing pricing or confirming an order.'],
    ['How do I know if delivery or pickup is available?', settings ? `Current availability is shown at checkout: delivery ${settings.deliveryEnabled ? 'available' : 'unavailable'}, pickup ${settings.pickupEnabled ? 'available' : 'unavailable'}.` : 'Availability is confirmed by BERRY and will be shown at checkout when business settings are configured.'],
    ['When can I leave a review?', 'A signed-in customer can review an eligible paid purchase once. Reviews are shown publicly only after moderation.'],
  ]
  return <InfoLayout eyebrow="FAQ" title="A few helpful answers."><div className="space-y-4">{answers.map(([question, answer])=><Card key={question} className="p-6"><h2 className="font-serif text-xl text-berry-deep">{question}</h2><p className="mt-3 text-sm leading-6 text-berry-muted">{answer}</p></Card>)}</div></InfoLayout>
}
