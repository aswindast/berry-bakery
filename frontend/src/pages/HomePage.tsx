import { AppShell } from '../layouts/AppShell'
import { CategorySection, CustomCakeSection, DeliverySection, FeaturedProducts, FavouriteProducts, HeroSection, HowItWorks, ReviewsSection, WhatsAppCTA, WhyChooseBerry } from '../components/home/HomeSections'

export default function HomePage() {
  return <AppShell><HeroSection /><FeaturedProducts /><CategorySection /><FavouriteProducts /><CustomCakeSection /><WhyChooseBerry /><HowItWorks /><ReviewsSection /><DeliverySection /><WhatsAppCTA /></AppShell>
}
