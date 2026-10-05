import { useEffect, useId, useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { CircleUserRound, Menu, Search, ShoppingBag, X } from 'lucide-react'
import { BerryLogo } from '../brand/BerryLogo'
import { Button, Container } from '../ui'
import { useCartStore } from '../../stores/cartStore'
import { useAuth } from '../../auth/useAuth'

const links = [
  { label: 'Home', to: '/' },
  { label: 'Menu', to: '/menu' },
  { label: 'Custom Cakes', to: '/custom-cakes' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
]

const utilityLinks = [
  { label: 'Search', to: '/search', Icon: Search },
  { label: 'Cart', to: '/cart', Icon: ShoppingBag },
  { label: 'Account', to: '/account', Icon: CircleUserRound },
]

const linkClass = ({ isActive }: { isActive: boolean }) => `relative py-3 text-sm font-semibold transition-colors after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:origin-left after:scale-x-0 after:bg-berry-pink after:transition-transform hover:text-berry-deep hover:after:scale-x-100 ${isActive ? 'text-berry-deep after:scale-x-100' : 'text-berry-brown'}`

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuId = useId()
  const itemCount = useCartStore((state) => state.itemCount)
  const { user } = useAuth()
  const currentUtilityLinks = utilityLinks.map((link) => link.label === 'Account'
    ? { ...link, label: user ? 'Account' : 'Sign in', to: user ? '/account' : '/login' }
    : link)

  useEffect(() => {
    if (!menuOpen) return undefined
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [menuOpen])

  return <header className="sticky top-0 z-40 border-b border-berry-deep/10 bg-berry-cream/95 backdrop-blur-sm"><Container className="flex min-h-20 items-center justify-between gap-5"><BerryLogo /><nav aria-label="Primary navigation" className="hidden items-center gap-7 lg:flex">{links.map((link) => <NavLink key={link.to} to={link.to} end={link.to === '/'} className={linkClass}>{link.label}</NavLink>)}</nav><nav aria-label="Utility navigation" className="hidden items-center gap-1 md:flex">{currentUtilityLinks.map(({ label, to, Icon }) => <Link key={to} to={to} aria-label={label} className="relative grid size-11 place-items-center rounded-xl text-berry-brown transition hover:bg-berry-beige hover:text-berry-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-berry-deep">{itemCount > 0 && label === 'Cart' && <span className="absolute right-1 top-1 grid min-h-4 min-w-4 place-items-center rounded-full bg-berry-pink px-1 text-[10px] font-bold text-white" aria-label={`${itemCount} items in cart`}>{itemCount}</span>}<Icon size={20} aria-hidden="true" /></Link>)}</nav><Button type="button" variant="ghost" className="min-h-11 px-3 md:hidden" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-controls={menuId} aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}>{menuOpen ? <X size={22} /> : <Menu size={22} />}</Button></Container>{menuOpen && <div className="fixed inset-0 top-20 z-30 bg-berry-text/20 lg:hidden" onClick={() => setMenuOpen(false)}><nav id={menuId} aria-label="Mobile navigation" className="border-b border-berry-deep/10 bg-berry-cream px-5 py-4 shadow-[0_16px_30px_rgba(74,44,42,0.12)]" onClick={(event) => event.stopPropagation()}><Container className="flex flex-col gap-1 px-0">{links.map((link) => <NavLink key={link.to} to={link.to} end={link.to === '/'} className={`${linkClass} rounded-lg px-3 py-3`} onClick={() => setMenuOpen(false)}>{link.label}</NavLink>)}<div className="my-2 border-t border-berry-deep/10" />{currentUtilityLinks.map(({ label, to, Icon }) => <NavLink key={to} to={to} className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-berry-brown hover:bg-berry-beige hover:text-berry-deep" onClick={() => setMenuOpen(false)}><Icon size={18} aria-hidden="true" />{label}{label === 'Cart' && itemCount > 0 && <span className="ml-auto rounded-full bg-berry-pink px-2 py-0.5 text-xs text-white">{itemCount}</span>}</NavLink>)}</Container></nav></div>}</header>
}
