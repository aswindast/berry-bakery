import { useState, type ReactNode } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { BarChart3, CakeSlice, ClipboardList, Gift, Menu, MessageSquareText, Package, Settings, Users, X, LogOut, Images } from 'lucide-react'
import { useAuth } from '../../auth/useAuth'
import { Button } from '../ui'

const navigation = [
  { label: 'Overview', to: '/admin', Icon: BarChart3, end: true },
  { label: 'Orders', to: '/admin/orders', Icon: ClipboardList },
  { label: 'Products', to: '/admin/products', Icon: Package },
  { label: 'Homepage highlights', to: '/admin/highlights', Icon: Images },
  { label: 'Custom cakes', to: '/admin/custom-cake-requests', Icon: CakeSlice },
  { label: 'Customers', to: '/admin/customers', Icon: Users },
  { label: 'Coupons', to: '/admin/coupons', Icon: Gift },
  { label: 'Reviews', to: '/admin/reviews', Icon: MessageSquareText },
  { label: 'Settings', to: '/admin/settings', Icon: Settings },
]

export function AdminLayout({ children }: { children?: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const navItems = navigation.map(({ label, to, Icon, end }) => <NavLink key={to} to={to} end={end} onClick={() => setMenuOpen(false)} className={({ isActive }) => `flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-berry-pink ${isActive ? 'bg-berry-pink/20 text-berry-deep' : 'text-berry-brown hover:bg-berry-beige'}`}><Icon size={18} aria-hidden="true" />{label}</NavLink>)

  const logout = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  return <div className="min-h-screen bg-berry-cream text-berry-text">
    <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between border-b border-berry-deep/10 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3"><button type="button" aria-label={menuOpen ? 'Close admin navigation' : 'Open admin navigation'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)} className="grid size-10 place-items-center rounded-lg text-berry-deep hover:bg-berry-beige focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-berry-deep lg:hidden">{menuOpen ? <X size={20} /> : <Menu size={20} />}</button><span className="font-serif text-2xl font-semibold text-berry-deep">BERRY <span className="font-sans text-xs font-bold uppercase tracking-[0.16em] text-berry-pink">Admin</span></span></div>
      <div className="flex min-w-0 items-center gap-3"><span className="hidden max-w-56 truncate text-sm text-berry-muted sm:block">{user?.email}</span><Button type="button" variant="ghost" className="min-h-10 px-3" onClick={() => void logout()}><LogOut size={16} /><span className="hidden sm:inline">Sign out</span></Button></div>
    </header>
    <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-[1600px] lg:grid-cols-[248px_minmax(0,1fr)]">
      <aside className="hidden border-r border-berry-deep/10 bg-white p-4 lg:block"><nav aria-label="Admin navigation" className="sticky top-20 space-y-1">{navItems}</nav></aside>
      {menuOpen && <div className="fixed inset-0 top-16 z-20 bg-berry-text/30 lg:hidden" onClick={() => setMenuOpen(false)}><nav aria-label="Admin navigation" className="h-[calc(100dvh-4rem)] w-[min(19rem,85vw)] space-y-1 overflow-y-auto border-r border-berry-deep/10 bg-white p-4" onClick={(event) => event.stopPropagation()}>{navItems}</nav></div>}
      <main id="admin-main" className="min-w-0 p-4 sm:p-6 lg:p-8">{children ?? <Outlet />}</main>
    </div>
  </div>
}
