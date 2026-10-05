import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AppShell } from '../layouts/AppShell'
import { Button, Card, Container, Input, PageHeader, Section } from '../components/ui'
import { useAuth } from '../auth/useAuth'

function AuthFrame({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: ReactNode }) {
  return <AppShell><Section className="bg-berry-cream"><Container className="max-w-2xl"><PageHeader eyebrow={eyebrow} title={title} description={description} /><Card className="mt-8 p-6 sm:p-9">{children}</Card></Container></Section></AppShell>
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.'
}

function getIntendedRedirect(state: unknown) {
  if (state && typeof state === 'object' && 'from' in state) {
    const from = (state as { from?: unknown }).from
    if (typeof from === 'string' && from.startsWith('/') && !from.startsWith('//')) return from
  }
  return '/account'
}

export function LoginPage() {
  const { signIn, user, isLoading, isConfigured } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isLoading && user && !isSubmitting) return <Navigate to={getIntendedRedirect(location.state)} replace />

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      await signIn(email, password)
      navigate(getIntendedRedirect(location.state), { replace: true })
    } catch (authError) {
      setError(errorMessage(authError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return <AuthFrame eyebrow="BERRY / Welcome back" title="Sign in to your account." description="Your BERRY account keeps your profile and future order history together.">
    {!isConfigured && <p role="alert" className="mb-5 rounded-xl bg-berry-beige px-4 py-3 text-sm text-berry-brown">Authentication setup is required before you can sign in. Add the public Supabase URL and anon key to the frontend environment.</p>}
    <form onSubmit={submit} className="space-y-5">
      <Input id="login-email" label="Email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
      <Input id="login-password" label="Password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <div className="flex justify-end"><Link className="text-sm font-semibold text-berry-deep hover:text-berry-pink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-berry-pink" to="/forgot-password">Forgot password?</Link></div>
      <Button className="w-full" type="submit" loading={isSubmitting}>Sign In</Button>
    </form>
    <p className="mt-6 text-center text-sm text-berry-muted">New to BERRY? <Link className="font-semibold text-berry-deep hover:text-berry-pink" to="/signup">Create an account</Link></p>
  </AuthFrame>
}

export function SignupPage() {
  const { signUp, user, isLoading, isConfigured } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isLoading && user && !isSubmitting) return <Navigate to={getIntendedRedirect(location.state)} replace />

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setNotice('')
    if (password.length < 8) {
      setError('Use at least 8 characters for your password.')
      return
    }
    if (password !== confirmation) {
      setError('Your passwords do not match.')
      return
    }
    setIsSubmitting(true)
    try {
      const result = await signUp(email, password, displayName)
      if (result.confirmationRequired) setNotice('Check your email for a confirmation link, then sign in to your account.')
      else navigate(getIntendedRedirect(location.state), { replace: true })
    } catch (authError) {
      setError(errorMessage(authError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return <AuthFrame eyebrow="BERRY / Join us" title="Create your account." description="Start with your name and email. Your password is managed securely by Supabase Auth.">
    {!isConfigured && <p role="alert" className="mb-5 rounded-xl bg-berry-beige px-4 py-3 text-sm text-berry-brown">Authentication setup is required before you can create an account. Add the public Supabase URL and anon key to the frontend environment.</p>}
    <form onSubmit={submit} className="space-y-5">
      <Input id="signup-name" label="Your name" autoComplete="name" minLength={2} maxLength={80} required value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
      <Input id="signup-email" label="Email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
      <Input id="signup-password" label="Password" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} hint="Use at least 8 characters." />
      <Input id="signup-confirm-password" label="Confirm password" type="password" autoComplete="new-password" required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} />
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      {notice && <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</p>}
      <Button className="w-full" type="submit" loading={isSubmitting}>Create Account</Button>
    </form>
    <p className="mt-6 text-center text-sm text-berry-muted">Already have an account? <Link className="font-semibold text-berry-deep hover:text-berry-pink" to="/login">Sign in</Link></p>
  </AuthFrame>
}

export function ForgotPasswordPage() {
  const { sendPasswordReset, isConfigured } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      await sendPasswordReset(email)
      setSent(true)
    } catch (authError) {
      setError(errorMessage(authError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return <AuthFrame eyebrow="BERRY / Account help" title="Reset your password." description="We’ll send a secure password reset link to the email on your account.">
    {!isConfigured && <p role="alert" className="mb-5 rounded-xl bg-berry-beige px-4 py-3 text-sm text-berry-brown">Authentication setup is required before a reset link can be sent.</p>}
    {sent ? <div role="status"><p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">If an account exists for that email, a password reset link is on its way.</p><Link className="mt-5 inline-block text-sm font-semibold text-berry-deep hover:text-berry-pink" to="/login">Return to sign in</Link></div> : <form onSubmit={submit} className="space-y-5">
      <Input id="forgot-email" label="Email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <Button className="w-full" type="submit" loading={isSubmitting}>Send Reset Link</Button>
      <p className="text-center text-sm"><Link className="font-semibold text-berry-deep hover:text-berry-pink" to="/login">Back to sign in</Link></p>
    </form>}
  </AuthFrame>
}

export function ResetPasswordPage() {
  const { user, isLoading, isConfigured, updatePassword } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('Use at least 8 characters for your password.')
      return
    }
    if (password !== confirmation) {
      setError('Your passwords do not match.')
      return
    }
    setIsSubmitting(true)
    try {
      await updatePassword(password)
      navigate('/account', { replace: true })
    } catch (authError) {
      setError(errorMessage(authError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return <AuthFrame eyebrow="BERRY / Secure account" title="Choose a new password." description="Set a new password for your BERRY account.">
    {isLoading ? <p role="status" className="text-sm text-berry-muted">Checking your reset link…</p> : !isConfigured ? <p role="alert" className="text-sm text-red-700">Authentication setup is required to reset a password.</p> : !user ? <div><p className="text-sm leading-6 text-berry-muted">This reset link is missing or has expired. Request a fresh link to continue.</p><Link className="mt-5 inline-block text-sm font-semibold text-berry-deep hover:text-berry-pink" to="/forgot-password">Request another reset link</Link></div> : <form onSubmit={submit} className="space-y-5">
      <Input id="reset-password" label="New password" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} />
      <Input id="reset-confirm-password" label="Confirm new password" type="password" autoComplete="new-password" required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} />
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <Button className="w-full" type="submit" loading={isSubmitting}>Update Password</Button>
    </form>}
  </AuthFrame>
}
