import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth'
import { AppShell } from '../layouts/AppShell'
import { LoadingState, Section } from '../components/ui'

export function RequireAuth() {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <AppShell><Section><LoadingState /></Section></AppShell>
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: `${location.pathname}${location.search}${location.hash}` }} replace />
  }

  return <Outlet />
}
