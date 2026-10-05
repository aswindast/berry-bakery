import { useEffect, useState, type ReactNode } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth'
import { adminApi } from '../services/adminService'
import { AdminLayout } from '../components/admin/AdminLayout'
import { EmptyState, LoadingState, Section } from '../components/ui'

export function AdminGuard() {
  const { user, session, isLoading } = useAuth()
  const location = useLocation()
  const [access, setAccess] = useState<'checking' | 'allowed' | 'denied' | 'unavailable'>('checking')

  useEffect(() => {
    let mounted = true
    if (!user || !session?.access_token) return () => { mounted = false }
    adminApi.session(session.access_token)
      .then(() => { if (mounted) setAccess('allowed') })
      .catch((error: unknown) => {
        if (!mounted) return
        const status = error && typeof error === 'object' && 'status' in error ? error.status : undefined
        setAccess(status === 403 ? 'denied' : 'unavailable')
      })
    return () => { mounted = false }
  }, [user, session?.access_token])

  if (isLoading || (user && access === 'checking')) return <Section><LoadingState /></Section>
  if (!user) return <Navigate to="/login" state={{ from: `${location.pathname}${location.search}` }} replace />
  if (access === 'denied') return <Section><div className="mx-auto max-w-xl"><EmptyState title="Admin access required" message="This account is not authorized to manage BERRY business data." /></div></Section>
  if (access === 'unavailable') return <Section><div className="mx-auto max-w-xl"><EmptyState title="Admin access could not be verified" message="The admin service is unavailable. Please try again later." /></div></Section>

  return <AdminLayout><Outlet /></AdminLayout>
}

export function AdminOutlet({ children }: { children: ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>
}
