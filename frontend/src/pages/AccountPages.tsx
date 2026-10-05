import { useState, type FormEvent } from 'react'
import { ArrowRight, CakeSlice, MapPin, Package, UserRound } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { AppShell } from '../layouts/AppShell'
import { Button, Card, Container, EmptyState, Input, PageHeader, Section } from '../components/ui'

function displayName(userMetadata: Record<string, unknown>, email?: string) {
  const name = userMetadata.full_name
  if (typeof name === 'string' && name.trim()) return name.trim()
  return email?.split('@')[0] || 'there'
}

function AccountFrame({ children }: { children: React.ReactNode }) {
  return <AppShell><Section><Container>{children}</Container></Section></AppShell>
}

export function AccountPage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [isSigningOut, setIsSigningOut] = useState(false)
  const name = displayName(user?.user_metadata ?? {}, user?.email)
  const items = [
    { title: 'My Orders', description: 'See your order history and updates.', to: '/account/orders', Icon: Package },
    { title: 'My Custom Cake Requests', description: 'Review your custom cake submissions and their status.', to: '/account/custom-cake-requests', Icon: CakeSlice },
    { title: 'Profile', description: 'Manage the name shown on your account.', to: '/account/profile', Icon: UserRound },
    { title: 'Addresses', description: 'Saved addresses will be available here.', to: '/account/addresses', Icon: MapPin },
  ]

  const handleSignOut = async () => {
    setError('')
    setIsSigningOut(true)
    try {
      await signOut()
      navigate('/login', { replace: true })
    } catch (signOutError) {
      setError(signOutError instanceof Error ? signOutError.message : 'Could not sign out. Please try again.')
    } finally {
      setIsSigningOut(false)
    }
  }

  return <AccountFrame>
    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <PageHeader eyebrow="BERRY / Your account" title={`Welcome, ${name}.`} description="Your account details and customer services, all in one place." />
      <Button type="button" variant="outline" loading={isSigningOut} onClick={handleSignOut}>Sign Out</Button>
    </div>
    {error && <p role="alert" className="mt-5 text-sm text-red-700">{error}</p>}
    <Card className="mt-8 p-5 sm:p-7"><p className="text-xs font-bold uppercase tracking-[0.16em] text-berry-muted">Account email</p><p className="mt-2 break-all font-semibold text-berry-deep">{user?.email}</p></Card>
    <div className="mt-6 grid gap-4 md:grid-cols-3">{items.map(({ title, description, to, Icon }) => <Link key={to} to={to} className="group rounded-2xl border border-berry-deep/10 bg-white p-5 shadow-[0_8px_30px_rgba(74,44,42,0.06)] transition hover:-translate-y-0.5 hover:border-berry-pink/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-berry-deep"><Icon size={21} className="text-berry-pink" /><h2 className="mt-4 font-serif text-2xl text-berry-deep">{title}</h2><p className="mt-2 text-sm leading-6 text-berry-muted">{description}</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-berry-deep">Open <ArrowRight size={15} className="transition group-hover:translate-x-1" /></span></Link>)}</div>
  </AccountFrame>
}

export function ProfilePage() {
  const { user, updateDisplayName } = useAuth()
  const [name, setName] = useState(displayName(user?.user_metadata ?? {}, user?.email))
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setNotice('')
    setIsSaving(true)
    try {
      await updateDisplayName(name)
      setNotice('Your profile name has been updated.')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not update your profile.')
    } finally {
      setIsSaving(false)
    }
  }

  return <AccountFrame>
    <PageHeader eyebrow="BERRY / Profile" title="Your profile." description="Update the name associated with your BERRY account." />
    <Card className="mt-8 max-w-2xl p-6 sm:p-8"><form onSubmit={submit} className="space-y-5">
      <Input id="profile-name" label="Name" autoComplete="name" minLength={2} maxLength={80} required value={name} onChange={(event) => setName(event.target.value)} />
      <Input id="profile-email" label="Email" type="email" autoComplete="email" value={user?.email ?? ''} disabled hint="Email address changes require a verified account flow." />
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      {notice && <p role="status" className="text-sm text-emerald-800">{notice}</p>}
      <Button type="submit" loading={isSaving}>Save Profile</Button>
    </form></Card>
    <Link to="/account" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-berry-deep hover:text-berry-pink">Back to account <ArrowRight size={15} className="rotate-180" /></Link>
  </AccountFrame>
}

export function AddressesPage() {
  return <AccountFrame>
    <PageHeader eyebrow="BERRY / Customer" title="Your addresses." description="Saved delivery addresses will be available here." />
    <div className="mt-8"><EmptyState title="No saved addresses" message="Address storage is not available yet. No address has been saved to your account." /></div>
    <Link to="/account" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-berry-deep hover:text-berry-pink">Back to account <ArrowRight size={15} className="rotate-180" /></Link>
  </AccountFrame>
}
