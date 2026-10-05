import { useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { AUTH_SETUP_MESSAGE, supabase } from '../lib/supabase'
import { displayNameSchema } from '../validators/accountProfileSchema'
import { AuthContext, type AuthContextValue } from './context'
import { authErrorMessage } from './authErrorMessage'

function requireSupabase() {
  if (!supabase) throw new Error(AUTH_SETUP_MESSAGE)
  return supabase
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(supabase !== null)

  useEffect(() => {
    if (!supabase) {
      return undefined
    }

    let isMounted = true
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setIsLoading(false)
    })

    supabase.auth.getSession()
      .then(({ data, error }) => {
        if (!isMounted) return
        if (error) throw error
        setSession(data.session)
      })
      .catch(() => {
        if (isMounted) setSession(null)
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const value: AuthContextValue = {
    user: session?.user ?? null,
    session,
    isLoading,
    isConfigured: supabase !== null,
    async signIn(email, password) {
      const { error } = await requireSupabase().auth.signInWithPassword({ email: email.trim(), password })
      if (error) throw new Error(authErrorMessage(error))
    },
    async signUp(email, password, displayName) {
      const nameResult = displayNameSchema.safeParse(displayName)
      if (!nameResult.success) throw new Error(nameResult.error.issues[0]?.message ?? 'Enter a valid name.')
      const { data, error } = await requireSupabase().auth.signUp({
        email: email.trim(),
        password,
        options: { data: { full_name: nameResult.data } },
      })
      if (error) throw new Error(authErrorMessage(error))
      return { confirmationRequired: !data.session }
    },
    async signOut() {
      const { error } = await requireSupabase().auth.signOut()
      if (error) throw new Error(authErrorMessage(error))
    },
    async sendPasswordReset(email) {
      const { error } = await requireSupabase().auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) throw new Error(authErrorMessage(error))
    },
    async updatePassword(password) {
      if (password.length < 8) throw new Error('Use at least 8 characters for your password.')
      const { error } = await requireSupabase().auth.updateUser({ password })
      if (error) throw new Error(authErrorMessage(error))
    },
    async updateDisplayName(displayName) {
      const nameResult = displayNameSchema.safeParse(displayName)
      if (!nameResult.success) throw new Error(nameResult.error.issues[0]?.message ?? 'Enter a valid name.')
      const { error } = await requireSupabase().auth.updateUser({ data: { full_name: nameResult.data } })
      if (error) throw new Error(authErrorMessage(error))
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
