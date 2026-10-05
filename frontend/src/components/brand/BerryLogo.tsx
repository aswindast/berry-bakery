import { CakeSlice } from 'lucide-react'
import { Link } from 'react-router-dom'

export function BerryLogo({ context = 'navbar' }: { context?: 'navbar' | 'hero' | 'footer' | 'loading' }) {
  const sizes = { navbar: 'text-2xl', hero: 'text-6xl sm:text-8xl', footer: 'text-xl', loading: 'text-3xl' }
  return <Link to="/" aria-label="BERRY home" className={`inline-flex items-center gap-2 font-serif font-semibold tracking-[0.08em] text-berry-deep ${sizes[context]}`}><span>BERRY</span>{context === 'hero' ? <span className="text-berry-pink">.</span> : context === 'loading' ? <CakeSlice size={22} aria-hidden="true" /> : null}</Link>
}
