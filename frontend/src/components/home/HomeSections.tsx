import { useEffect, useState } from 'react'
import { ArrowRight, Clock3, Heart, MapPin, MessageCircle, PackageCheck, Sparkles, Truck, UtensilsCrossed } from 'lucide-react'
import { Link } from 'react-router-dom'
import { categories as mockCategories, type ProductCategory } from '../../data/categories'
import { favouriteProducts as mockFavourites, featuredProducts as mockFeatured, type Product } from '../../data/products'
import { fetchCategories, fetchProducts } from '../../services/productService'
import { siteConfig } from '../../lib/siteConfig'
import { usePublicBusinessSettings } from '../../hooks/usePublicBusinessSettings'
import { Card, Container, Section } from '../ui'
import { WhatsAppButton } from '../navigation/WhatsAppButton'
import { BakeryImagePlaceholder } from './BakeryImagePlaceholder'
import { ProductCard } from './ProductCard'
import { ProductImage } from './ProductImage'
import { fetchHighlights, type HomepageHighlight } from '../../services/highlightService'

function HomepageHighlights() {
  const [highlights, setHighlights] = useState<HomepageHighlight[]>([])
  useEffect(() => { let active = true; fetchHighlights().then((items) => { if (active) setHighlights(items) }).catch(() => undefined); return () => { active = false } }, [])
  if (!highlights.length) return <><BakeryImagePlaceholder label="Your BERRY story" className="aspect-[5/4] shadow-[0_18px_50px_rgba(74,44,42,0.12)] sm:aspect-[4/3]" /><div className="mt-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.18em] text-berry-muted"><span>Future home of BERRY photography</span><span>01 / 05</span></div></>
  return <div className="grid gap-3 sm:grid-cols-2">{highlights.map((item) => <article key={item.id} className="overflow-hidden rounded-2xl bg-white shadow-[0_18px_50px_rgba(74,44,42,0.12)]"><img src={item.image} alt={item.title} className="aspect-[5/4] w-full object-cover" loading="lazy"/><div className="p-4"><h2 className="font-serif text-xl text-berry-deep">{item.title}</h2>{item.description&&<p className="mt-2 text-sm leading-6 text-berry-muted">{item.description}</p>}</div></article>)}</div>
}

export function HeroSection() {
  const bakeryLocation = usePublicBusinessSettings()?.location ?? siteConfig.location
  return <section className="overflow-hidden bg-berry-cream"><Container className="grid gap-10 pb-16 pt-12 sm:pb-24 sm:pt-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16 lg:pb-28 lg:pt-20"><div className="order-2 lg:order-1"><p className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-berry-pink"><span className="h-px w-8 bg-berry-pink" /> BERRY / Based in {bakeryLocation}</p><h1 className="max-w-2xl font-serif text-5xl leading-[0.98] text-berry-deep sm:text-7xl lg:text-[5.7rem]">Sweet Moments,<br /><em className="font-normal text-berry-pink">Beautifully</em> Baked.</h1><p className="mt-7 max-w-lg text-base leading-7 text-berry-muted sm:text-lg">Handmade cakes, pastries, sweets and desserts for the moments you want to make a little more special.</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link to="/menu" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-berry-pink px-5 py-3 text-sm font-semibold text-berry-deep transition hover:bg-berry-deep hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-berry-deep focus-visible:ring-offset-2">Explore Our Menu <ArrowRight size={17} /></Link><Link to="/custom-cakes" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-berry-deep/25 px-5 py-3 text-sm font-semibold text-berry-deep transition hover:border-berry-pink hover:bg-berry-pink/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-berry-deep focus-visible:ring-offset-2">Request a Custom Cake</Link></div><p className="mt-6 flex items-center gap-2 text-xs text-berry-muted"><MapPin size={14} className="text-berry-pink" /> Made for sweet moments</p></div><div className="order-1 lg:order-2"><HomepageHighlights /></div></Container></section>
}

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>(mockFeatured)

  useEffect(() => {
    let isMounted = true
    fetchProducts({ featured: true })
      .then((data) => {
        if (isMounted && data.length > 0) setProducts(data.slice(0, 4))
      })
      .catch(() => {
        // keep mock fallback on error
      })
    return () => { isMounted = false }
  }, [])

  return <Section eyebrow="A little something for everyone" className="bg-white"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><h2 className="font-serif text-4xl text-berry-deep sm:text-5xl">Made for Sweet Moments</h2><p className="mt-3 max-w-xl text-base leading-7 text-berry-muted">A first look at the kinds of bakes that will make up the BERRY menu.</p></div><Link to="/menu" className="inline-flex items-center gap-2 text-sm font-bold text-berry-deep hover:text-berry-pink">See the full menu <ArrowRight size={16} /></Link></div><div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div></Section>
}

export function CategorySection() {
  const [catList, setCatList] = useState<ProductCategory[]>(mockCategories)

  useEffect(() => {
    let isMounted = true
    fetchCategories()
      .then((data) => {
        if (isMounted && data.length > 0) setCatList(data)
      })
      .catch(() => {
        // keep mock fallback on error
      })
    return () => { isMounted = false }
  }, [])

  return <Section eyebrow="Find your kind of sweet"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><h2 className="font-serif text-4xl text-berry-deep sm:text-5xl">Pick your pleasure.</h2><p className="max-w-sm text-sm leading-6 text-berry-muted">From the celebration centrepiece to the little thing with your evening tea.</p></div><div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">{catList.map((category) => <Link key={category.id} to={category.href} className="group"><BakeryImagePlaceholder label={category.imageLabel} tone="rose" className="aspect-[5/4] rounded-xl transition duration-300 group-hover:-translate-y-1 group-hover:shadow-lg" /><h3 className="mt-3 font-serif text-xl text-berry-deep group-hover:text-berry-pink">{category.name}</h3><p className="mt-1 text-xs leading-5 text-berry-muted">{category.description}</p></Link>)}</div></Section>
}

export function FavouriteProducts() {
  const [products, setProducts] = useState<Product[]>(mockFavourites)

  useEffect(() => {
    let isMounted = true
    fetchProducts({ available: true })
      .then((data) => {
        if (isMounted && data.length > 0) setProducts(data.slice(0, 3))
      })
      .catch(() => {
        // keep mock fallback on error
      })
    return () => { isMounted = false }
  }, [])

  return <section className="bg-berry-deep py-16 text-white sm:py-20"><Container><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-berry-soft-rose">A gentle nudge</p><h2 className="font-serif text-4xl sm:text-5xl">Explore Our Favourites</h2><p className="mt-3 max-w-xl text-sm leading-6 text-white/70">A placeholder collection for the bakes we will be proud to introduce first.</p></div><Link to="/menu" className="inline-flex items-center gap-2 text-sm font-semibold text-berry-soft-rose hover:text-white">Browse all bakes <ArrowRight size={16} /></Link></div><div className="mt-10 grid gap-5 md:grid-cols-3">{products.map((product) => <article key={product.id} className="group overflow-hidden rounded-2xl border border-white/15 bg-white/10"><ProductImage product={product} className="rounded-none transition duration-500 group-hover:scale-[1.02]" /><div className="p-5"><p className="text-xs font-bold uppercase tracking-[0.15em] text-berry-soft-rose">{product.category}</p><h3 className="mt-2 font-serif text-2xl">{product.name}</h3><Link to={`/menu/${product.slug}`} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-berry-soft-rose">View details <ArrowRight size={15} /></Link></div></article>)}</div></Container></section>
}

export function CustomCakeSection() {
  return <Section className="bg-berry-cream"><div className="grid overflow-hidden rounded-3xl bg-berry-brown text-white lg:grid-cols-[1fr_0.9fr]"><div className="p-7 sm:p-12 lg:p-16"><p className="text-xs font-bold uppercase tracking-[0.22em] text-berry-soft-rose">For the moments with a story</p><h2 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">Made Just for Your Moment</h2><p className="mt-5 max-w-lg text-sm leading-7 text-white/75">Share your theme, colours, flavour preferences, message and reference images. BERRY will review your request before pricing or confirmation.</p><Link to="/custom-cakes" className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-berry-pink px-5 py-3 text-sm font-semibold text-berry-deep transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-berry-brown">Request a Custom Cake <ArrowRight size={17} /></Link></div><BakeryImagePlaceholder label="Custom cake studio" tone="rose" className="min-h-64 rounded-none lg:min-h-full" /></div></Section>
}

export function WhyChooseBerry() {
  const benefits = [{ icon: Heart, title: 'Made with Care', text: 'Thoughtful details for the people and moments that matter.' }, { icon: Clock3, title: 'Freshly Prepared', text: 'A small-batch approach that keeps each order considered.' }, { icon: Sparkles, title: 'Custom Cake Options', text: 'Bring a theme, colour palette or idea and start a conversation.' }, { icon: PackageCheck, title: 'Convenient Pickup & Delivery', text: 'Choose the handoff that suits your celebration and configuration.' }]
  return <Section eyebrow="The BERRY feeling" className="bg-white"><div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]"><div><h2 className="font-serif text-4xl text-berry-deep sm:text-5xl">A little more care in every detail.</h2><p className="mt-4 max-w-sm text-sm leading-7 text-berry-muted">A premium experience can still feel warm, personal and easy to approach.</p></div><div className="grid gap-3 sm:grid-cols-2">{benefits.map(({ icon: Icon, title, text }) => <Card key={title} className="p-5"><Icon size={22} strokeWidth={1.5} className="text-berry-pink" /><h3 className="mt-5 font-serif text-2xl text-berry-deep">{title}</h3><p className="mt-2 text-sm leading-6 text-berry-muted">{text}</p></Card>)}</div></div></Section>
}

export function HowItWorks() {
  const steps = [{ number: '01', title: 'Choose Your Treats', icon: UtensilsCrossed }, { number: '02', title: 'Customize Your Order', icon: Sparkles }, { number: '03', title: 'Choose Pickup or Delivery', icon: Truck }, { number: '04', title: 'Enjoy Your BERRY Moment', icon: Heart }]
  return <Section eyebrow="Simple by design"><h2 className="font-serif text-4xl text-berry-deep sm:text-5xl">How ordering works.</h2><div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">{steps.map(({ number, title, icon: Icon }) => <div key={number} className="relative border-t border-berry-deep/15 pt-5"><span className="text-xs font-bold tracking-[0.2em] text-berry-pink">{number}</span><Icon size={20} className="mt-8 text-berry-deep" strokeWidth={1.5} /><h3 className="mt-4 font-serif text-2xl text-berry-deep">{title}</h3></div>)}</div></Section>
}

export function ReviewsSection() {
  return <Section className="bg-berry-beige/45" eyebrow="Customer reviews"><div className="rounded-2xl border border-berry-deep/10 bg-white p-6"><h2 className="font-serif text-3xl text-berry-deep">Kind words, when they are ready.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-berry-muted">Customer reviews are published on product pages only after moderation. Browse the menu to see approved reviews.</p><Link to="/menu" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-berry-deep hover:text-berry-pink">Explore the menu <ArrowRight size={16}/></Link></div></Section>
}

export function DeliverySection() {
  return <Section><div className="grid gap-8 rounded-3xl border border-berry-deep/10 bg-berry-cream p-7 sm:p-10 lg:grid-cols-[1fr_0.8fr] lg:items-center"><div><p className="text-xs font-bold uppercase tracking-[0.22em] text-berry-pink">Plan the handoff</p><h2 className="mt-3 font-serif text-4xl text-berry-deep">Delivery or pickup, your way.</h2><p className="mt-4 max-w-xl text-sm leading-7 text-berry-muted">Delivery and pickup options depend on current bakery settings. Confirm availability, areas, and fees at checkout.</p><Link to="/delivery-pickup" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-berry-deep hover:text-berry-pink">View Delivery & Pickup <ArrowRight size={16} /></Link></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1"><div className="flex items-center gap-4 rounded-xl bg-white p-4"><Truck className="text-berry-pink" /><div><p className="font-semibold text-berry-deep">Home Delivery</p><p className="text-xs text-berry-muted">Configured areas and slots</p></div></div><div className="flex items-center gap-4 rounded-xl bg-white p-4"><MapPin className="text-berry-pink" /><div><p className="font-semibold text-berry-deep">Pickup</p><p className="text-xs text-berry-muted">Details shared at checkout</p></div></div></div></div></Section>
}

export function WhatsAppCTA() {
  const publicSettings = usePublicBusinessSettings()
  const whatsappNumber = publicSettings?.whatsapp ?? siteConfig.whatsappNumber
  return <section className="bg-berry-brown py-16 text-white sm:py-20"><Container className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center"><div><p className="text-xs font-bold uppercase tracking-[0.22em] text-berry-soft-rose">Let’s make it special</p><h2 className="mt-3 font-serif text-4xl sm:text-5xl">Have something special in mind?</h2><p className="mt-3 max-w-xl text-sm leading-6 text-white/70">Talk to BERRY about your next celebration or custom cake.</p></div><div className="shrink-0">{whatsappNumber ? <WhatsAppButton phoneNumber={whatsappNumber} message="Hello BERRY, I have something special in mind." className="bg-berry-pink text-berry-deep hover:bg-white" /> : <span className="inline-flex items-center gap-2 text-sm text-white/60"><MessageCircle size={17} /> WhatsApp contact coming soon</span>}</div></Container></section>
}
