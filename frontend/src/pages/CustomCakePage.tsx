import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import { CalendarDays, Check, Image, MessageCircle, Palette, UsersRound } from 'lucide-react'
import { useAuth } from '../auth/useAuth'
import { AppShell } from '../layouts/AppShell'
import { BakeryImagePlaceholder } from '../components/home/BakeryImagePlaceholder'
import { ReferenceImageUpload } from '../components/custom-cakes/ReferenceImageUpload'
import { Button, Card, Container, Input, Section, Select, Textarea } from '../components/ui'
import { submitCustomCakeRequest, type CustomCakeSubmissionResult } from '../services/customCakeService'
import { defaultCustomCakeValues, customCakeSchema } from '../validators/customCakeSchema'
import type { CustomCakeFormValues, ReferenceImage } from '../types/customCake'

const today = new Date().toISOString().split('T')[0]

export default function CustomCakePage() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [referenceImages, setReferenceImages] = useState<ReferenceImage[]>([])
  const [imageError, setImageError] = useState('')
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [submissionError, setSubmissionError] = useState('')
  const [submittedRequest, setSubmittedRequest] = useState<CustomCakeSubmissionResult | null>(null)
  const { register, handleSubmit, setError, reset, formState: { errors } } = useForm<CustomCakeFormValues>({ defaultValues: defaultCustomCakeValues, mode: 'onBlur' })

  const clearImages = () => {
    referenceImages.forEach((image) => URL.revokeObjectURL(image.previewUrl))
    setReferenceImages([])
    setImageError('')
  }

  const validateAndSubmit = async (values: CustomCakeFormValues) => {
    const result = customCakeSchema.safeParse(values)
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        const field = issue.path[0]
        if (typeof field === 'string' && field in defaultCustomCakeValues) setError(field as keyof CustomCakeFormValues, { type: 'validation', message: issue.message })
      })
      return
    }
    if (!session?.access_token) {
      navigate('/login', { state: { from: `${location.pathname}${location.search}` } })
      return
    }

    setFormStatus('submitting')
    setSubmissionError('')
    try {
      const created = await submitCustomCakeRequest({ ...result.data, servings: Number(result.data.servings), referenceImages }, session.access_token)
      setSubmittedRequest(created)
      setFormStatus('success')
      reset(defaultCustomCakeValues)
      clearImages()
    } catch (error) {
      setFormStatus('error')
      setSubmissionError(error instanceof Error ? error.message : 'The request could not be submitted. Please try again.')
    }
  }

  const startOver = () => {
    reset(defaultCustomCakeValues)
    clearImages()
    setSubmittedRequest(null)
    setFormStatus('idle')
    setSubmissionError('')
  }

  if (formStatus === 'success' && submittedRequest) return <AppShell><Section className="bg-berry-cream"><Container><div className="mx-auto max-w-3xl rounded-3xl border border-berry-deep/10 bg-white p-8 text-center shadow-[0_16px_50px_rgba(74,44,42,0.08)] sm:p-14"><span className="mx-auto grid size-14 place-items-center rounded-full bg-berry-pink/20 text-berry-deep"><Check size={26} /></span><p className="mt-6 text-xs font-bold uppercase tracking-[0.22em] text-berry-pink">Request submitted</p><h1 className="mt-3 font-serif text-4xl text-berry-deep sm:text-5xl">Your cake idea is with BERRY.</h1><p className="mx-auto mt-5 max-w-xl text-base leading-7 text-berry-muted">Your request has been received for review. No pricing or order is confirmed yet.</p><p className="mt-5 text-sm font-semibold text-berry-deep">Request reference: {submittedRequest.id}</p><p className="mt-2 text-xs text-berry-muted">Reference images selected in this form were previews only and were not uploaded or attached.</p><Button type="button" variant="outline" className="mt-8" onClick={startOver}>Prepare another request</Button></div></Container></Section></AppShell>

  return <AppShell><section className="bg-berry-cream"><Container className="grid gap-8 py-14 sm:py-20 lg:grid-cols-[1fr_0.7fr] lg:items-end"><div><p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-berry-pink">BERRY / Custom cakes</p><h1 className="max-w-2xl font-serif text-5xl leading-tight text-berry-deep sm:text-6xl">Create Your Dream Cake</h1><p className="mt-5 max-w-xl text-base leading-7 text-berry-muted">Share your cake idea with BERRY and we’ll review the details before any pricing or confirmation conversation.</p></div><BakeryImagePlaceholder label="Your cake story" tone="rose" className="aspect-[4/3]" /></Container></section><Section className="pt-10 sm:pt-16"><div className="grid gap-8 lg:grid-cols-[1fr_0.38fr] lg:items-start"><Card className="p-6 sm:p-9"><div className="mb-8 border-b border-berry-deep/10 pb-6"><h2 className="font-serif text-3xl text-berry-deep">Tell us what you’re imagining.</h2><p className="mt-2 text-sm leading-6 text-berry-muted"><span className="text-berry-pink">*</span> Required fields. Sign in is required to submit a request.</p></div><form noValidate onSubmit={handleSubmit(validateAndSubmit)} className="space-y-8"><fieldset className="space-y-5"><legend className="mb-1 font-serif text-2xl text-berry-deep">About you</legend><div className="grid gap-5 sm:grid-cols-2"><Input id="name" label="Name *" placeholder="Your name" autoComplete="name" error={errors.name?.message} {...register('name')} /><Input id="email" type="email" label="Email *" placeholder="you@example.com" autoComplete="email" error={errors.email?.message} {...register('email')} /><Input id="phone" type="tel" label="Phone *" placeholder="Your phone number" autoComplete="tel" error={errors.phone?.message} {...register('phone')} /></div></fieldset><fieldset className="space-y-5"><legend className="mb-1 font-serif text-2xl text-berry-deep">Your celebration</legend><div className="grid gap-5 sm:grid-cols-2"><Select id="occasion" label="Cake occasion *" error={errors.occasion?.message} {...register('occasion')}><option value="">Choose an occasion</option><option>Birthday</option><option>Wedding</option><option>Anniversary</option><option>Baby Shower</option><option>Engagement</option><option>Graduation</option><option>Celebration</option><option>Other</option></Select><Input id="preferredDate" type="date" min={today} label="Preferred date *" error={errors.preferredDate?.message} {...register('preferredDate')} /><Select id="preferredTime" label="Preferred time *" hint="Availability will be confirmed later." error={errors.preferredTime?.message} {...register('preferredTime')}><option value="">Choose a time</option><option>Flexible</option><option>Morning</option><option>Afternoon</option><option>Evening</option></Select><Input id="servings" type="number" min="1" max="999" label="Number of servings *" placeholder="e.g. 12" error={errors.servings?.message} {...register('servings')} /></div></fieldset><fieldset className="space-y-5"><legend className="mb-1 font-serif text-2xl text-berry-deep">Cake details</legend><div className="grid gap-5 sm:grid-cols-2"><Input id="flavor" label="Preferred flavor" placeholder="e.g. chocolate, vanilla..." hint="A preference is helpful; final options will be reviewed." error={errors.flavor?.message} {...register('flavor')} /><Select id="budgetRange" label="Budget range" hint="A guide for the future review, not a pricing guarantee." error={errors.budgetRange?.message} {...register('budgetRange')}><option value="">Prefer not to say</option><option>Under ₹1,000</option><option>₹1,000 – ₹2,000</option><option>₹2,000 – ₹4,000</option><option>Above ₹4,000</option></Select></div><Textarea id="styleDescription" label="Cake style / description *" placeholder="Tell us about colours, theme, decorations and the feeling you want..." hint="The more context you share, the more thoughtfully BERRY can review your request." error={errors.styleDescription?.message} {...register('styleDescription')} /><Input id="cakeMessage" label="Cake message" placeholder="e.g. Happy birthday, Amma!" error={errors.cakeMessage?.message} {...register('cakeMessage')} /><Textarea id="specialInstructions" label="Special instructions" placeholder="Anything else BERRY should know?" error={errors.specialInstructions?.message} {...register('specialInstructions')} /></fieldset><ReferenceImageUpload images={referenceImages} onChange={setReferenceImages} error={imageError} onError={setImageError} /><p className="-mt-5 text-xs leading-5 text-berry-muted">Images remain local previews in this phase. They will not be stored or attached to your submitted request.</p>{formStatus === 'error' && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{submissionError}</p>}<Button type="submit" loading={formStatus === 'submitting'} className="w-full sm:w-auto">Submit Request <MessageCircle size={17} /></Button></form></Card><aside className="space-y-5 lg:sticky lg:top-28"><Card className="bg-berry-beige/50 p-6"><p className="text-xs font-bold uppercase tracking-[0.18em] text-berry-pink">A helpful request includes</p><h2 className="mt-3 font-serif text-2xl text-berry-deep">Small details make a difference.</h2><ul className="mt-5 space-y-4">{[{ icon: CalendarDays, text: 'Event date and preferred time' }, { icon: UsersRound, text: 'Number of servings' }, { icon: Palette, text: 'Theme, colours or inspiration' }, { icon: Image, text: 'Reference images, if you have them' }, { icon: MessageCircle, text: 'A special message for the cake' }].map(({ icon: Icon, text }) => <li key={text} className="flex items-start gap-3 text-sm leading-6 text-berry-brown"><Icon size={18} className="mt-1 shrink-0 text-berry-pink" />{text}</li>)}</ul></Card><div className="rounded-2xl border border-berry-deep/10 bg-white p-6"><p className="text-sm leading-7 text-berry-muted">Every custom request is reviewed by BERRY before pricing and confirmation. Submitting a request does not create an order.</p></div></aside></div></Section></AppShell>
}
