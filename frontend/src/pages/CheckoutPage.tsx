import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import { ArrowLeft, MapPin, PackageCheck } from 'lucide-react'
import { useAuth } from '../auth/useAuth'
import { AppShell } from '../layouts/AppShell'
import { Button, Card, Container, EmptyState, Input, Section, Select, Textarea } from '../components/ui'
import { useCartStore } from '../stores/cartStore'
import { createOrder } from '../services/orderService'
import { startRazorpayPayment } from '../services/paymentService'
import { checkoutSchema, type CheckoutValues } from '../validators/checkoutSchema'
import { validateCoupon, type CouponQuote } from '../services/couponService'
import { usePublicBusinessSettings } from '../hooks/usePublicBusinessSettings'

function displayName(userMetadata: Record<string, unknown>, email?: string) {
  const name = userMetadata.full_name
  return typeof name === 'string' && name.trim() ? name.trim() : email?.split('@')[0] ?? ''
}

function formatPrice(value: number) {
  return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
}

export default function CheckoutPage() {
  const { user, session } = useAuth()
  const businessSettings = usePublicBusinessSettings()
  const items = useCartStore((state) => state.items)
  const clearCartIfMatches = useCartStore((state) => state.clearCartIfMatches)
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<CouponQuote | null>(null)
  const [couponError, setCouponError] = useState('')
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false)
  const subtotal = items.reduce((sum, item) => sum + Math.round(item.product.price * 100) * item.quantity, 0) / 100
  const { register, handleSubmit, control, setValue, setError, formState: { errors } } = useForm<CheckoutValues>({
    defaultValues: {
      customerName: displayName(user?.user_metadata ?? {}, user?.email),
      customerEmail: user?.email ?? '',
      customerPhone: '',
      fulfillmentType: 'delivery',
      deliveryAddress: '',
      deliveryCity: '',
      deliveryState: '',
      deliveryPincode: '',
      deliveryInstructions: '',
      pickupInstructions: '',
    },
  })
  const fulfillmentType = useWatch({ control, name: 'fulfillmentType' })
  const fulfillmentField = register('fulfillmentType')
  const estimatedDeliveryFee = fulfillmentType === 'delivery' ? businessSettings?.deliveryFee ?? 0 : 0
  const summarySubtotal = appliedCoupon?.subtotal ?? subtotal
  const summaryDeliveryFee = appliedCoupon?.deliveryFee ?? estimatedDeliveryFee
  const summaryDiscount = appliedCoupon?.discountAmount ?? 0
  const summaryTotal = appliedCoupon?.total ?? summarySubtotal + summaryDeliveryFee

  useEffect(() => {
    if (!user) return
    setValue('customerName', displayName(user.user_metadata ?? {}, user.email))
    setValue('customerEmail', user.email ?? '')
  }, [user, setValue])

  const submit = async (values: CheckoutValues) => {
    setSubmitError('')
    const parsed = checkoutSchema.safeParse(values)
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0]
        if (typeof field === 'string' && field in values) setError(field as keyof CheckoutValues, { type: 'validation', message: issue.message })
      })
      return
    }
    if (!session?.access_token) {
      setSubmitError('Your session has expired. Sign in again to place this order.')
      return
    }
    setIsSubmitting(true)
    let order
    try {
      order = await createOrder(session.access_token, {
        ...parsed.data,
        ...(appliedCoupon ? { couponCode: appliedCoupon.code } : {}),
        items: items.map(({ product, quantity }) => ({ productId: product.id, quantity })),
      })
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'We could not create your order. Your cart is unchanged.')
      setIsSubmitting(false)
      return
    }

    try {
      await startRazorpayPayment(session.access_token, order.id, {
        name: parsed.data.customerName,
        email: parsed.data.customerEmail,
        contact: parsed.data.customerPhone,
      })
      clearCartIfMatches(order.items)
      navigate(`/checkout/success/${order.id}`, { replace: true })
    } catch (error) {
      navigate(`/account/orders/${order.id}`, {
        replace: true,
        state: { paymentError: error instanceof Error ? error.message : 'Payment did not complete. Your order is saved for retry.' },
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const applyCoupon = async () => {
    if (!session?.access_token) return
    if (!couponCode.trim()) { setCouponError('Enter a coupon code.'); return }
    setCouponError('')
    setIsApplyingCoupon(true)
    try {
      const quote = await validateCoupon(session.access_token, couponCode, fulfillmentType, items.map(({ product, quantity }) => ({ productId: product.id, quantity })))
      setAppliedCoupon(quote)
      setCouponCode(quote.code)
    } catch (error) {
      setAppliedCoupon(null)
      setCouponError(error instanceof Error ? error.message : 'This coupon could not be applied.')
    } finally {
      setIsApplyingCoupon(false)
    }
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    void handleSubmit(submit)(event)
  }

  return <AppShell>
    <Section className="bg-berry-cream"><Container><p className="text-xs font-bold uppercase tracking-[0.22em] text-berry-pink">BERRY / Checkout</p><h1 className="mt-3 font-serif text-5xl text-berry-deep">A few details, then it’s yours.</h1><p className="mt-3 text-base text-berry-muted">Your order is saved before secure Razorpay Checkout opens. BERRY does not store card or UPI credentials.</p></Container></Section>
    <Section className="pt-8"><Container>
      {!items.length ? <div className="mx-auto max-w-2xl"><EmptyState title="Your cart is empty" message="Add something from the menu before continuing to checkout." /><div className="mt-6 text-center"><Link to="/menu" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-berry-pink px-5 py-3 text-sm font-semibold text-berry-deep hover:bg-berry-deep hover:text-white">Explore the menu <ArrowLeft size={16} /></Link></div></div> : <div className="grid items-start gap-8 lg:grid-cols-[1fr_360px]">
        <form noValidate onSubmit={onSubmit} className="space-y-6">
          <Card className="p-5 sm:p-7"><h2 className="font-serif text-2xl text-berry-deep">Customer details</h2><div className="mt-5 grid gap-5 sm:grid-cols-2"><Input id="checkout-name" label="Full name" autoComplete="name" maxLength={80} error={errors.customerName?.message} {...register('customerName')} /><Input id="checkout-email" label="Email" type="email" autoComplete="email" error={errors.customerEmail?.message} {...register('customerEmail')} /><div className="sm:col-span-2"><Input id="checkout-phone" label="Phone" type="tel" autoComplete="tel" placeholder="+91 98765 43210" error={errors.customerPhone?.message} {...register('customerPhone')} /></div></div></Card>
          <Card className="p-5 sm:p-7"><h2 className="font-serif text-2xl text-berry-deep">How would you like to receive it?</h2><div className="mt-5"><Select id="fulfillment-type" label="Fulfilment" {...fulfillmentField} onChange={(event)=>{void fulfillmentField.onChange(event);setAppliedCoupon(null);setCouponError('')}}><option value="delivery" disabled={businessSettings?.deliveryEnabled === false}>Delivery{businessSettings?.deliveryEnabled === false?' (unavailable)':''}</option><option value="pickup" disabled={businessSettings?.pickupEnabled === false}>Pickup{businessSettings?.pickupEnabled === false?' (unavailable)':''}</option></Select></div>
            {fulfillmentType === 'delivery' ? <fieldset className="mt-6 space-y-5"><legend className="flex items-center gap-2 font-semibold text-berry-deep"><MapPin size={17} /> Delivery address</legend><Input id="delivery-address" label="Address" autoComplete="street-address" maxLength={240} error={errors.deliveryAddress?.message} {...register('deliveryAddress')} /><div className="grid gap-5 sm:grid-cols-2"><Input id="delivery-city" label="City" autoComplete="address-level2" maxLength={100} error={errors.deliveryCity?.message} {...register('deliveryCity')} /><Input id="delivery-state" label="State" autoComplete="address-level1" maxLength={100} error={errors.deliveryState?.message} {...register('deliveryState')} /><Input id="delivery-pincode" label="PIN code" inputMode="numeric" autoComplete="postal-code" maxLength={6} error={errors.deliveryPincode?.message} {...register('deliveryPincode')} /></div><Textarea id="delivery-instructions" label="Delivery instructions (optional)" maxLength={500} {...register('deliveryInstructions')} /></fieldset> : <div className="mt-6"><Textarea id="pickup-instructions" label="Pickup preference or instructions (optional)" maxLength={500} {...register('pickupInstructions')} /><p className="mt-2 text-xs text-berry-muted">Pickup timing will be confirmed by BERRY.</p></div>}
          </Card>
          {submitError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{submitError}</p>}
          <Button type="submit" loading={isSubmitting} className="w-full sm:w-auto"><PackageCheck size={17} /> Place Order & Pay</Button>
          <Link to="/cart" className="flex w-fit items-center gap-2 text-sm font-semibold text-berry-deep hover:text-berry-pink"><ArrowLeft size={16} /> Back to cart</Link>
        </form>
        <Card className="p-5 sm:p-6 lg:sticky lg:top-28"><h2 className="font-serif text-2xl text-berry-deep">Order Summary</h2><div className="mt-5 space-y-4">{items.map(({ product, quantity }) => <div key={product.id} className="flex justify-between gap-4 text-sm"><div className="min-w-0"><p className="font-semibold text-berry-brown">{product.name}</p><p className="mt-1 text-berry-muted">Qty {quantity} · {formatPrice(product.price)} each</p></div><span className="shrink-0 font-semibold text-berry-brown">{formatPrice(Math.round(product.price * 100) * quantity / 100)}</span></div>)}</div><div className="mt-5 flex gap-2"><Input id="checkout-coupon" label="Coupon code" value={couponCode} onChange={(event)=>{setCouponCode(event.target.value.toUpperCase());setAppliedCoupon(null);setCouponError('')}} placeholder="Enter code" disabled={Boolean(appliedCoupon)}/>{appliedCoupon?<Button type="button" variant="outline" className="mt-7 px-3" onClick={()=>{setAppliedCoupon(null);setCouponCode('');setCouponError('')}}>Remove</Button>:<Button type="button" className="mt-7 px-4" loading={isApplyingCoupon} onClick={()=>void applyCoupon()}>Apply</Button>}</div>{couponError&&<p role="alert" className="text-xs text-red-700">{couponError}</p>}{appliedCoupon&&<p role="status" className="text-xs font-semibold text-emerald-800">{appliedCoupon.code} applied</p>}<div className="mt-5 space-y-3 border-t border-berry-deep/10 pt-5 text-sm"><div className="flex justify-between gap-4 text-berry-muted"><span>Subtotal</span><span>{formatPrice(summarySubtotal)}</span></div><div className="flex justify-between gap-4 text-berry-muted"><span>Delivery fee</span><span>{summaryDeliveryFee?formatPrice(summaryDeliveryFee):businessSettings?'₹0':'Not configured'}</span></div>{summaryDiscount>0&&<div className="flex justify-between gap-4 text-emerald-800"><span>Coupon discount</span><span>−{formatPrice(summaryDiscount)}</span></div>}<div className="flex justify-between gap-4 border-t border-berry-deep/10 pt-4 text-base font-bold text-berry-deep"><span>Estimated total</span><span>{formatPrice(summaryTotal)}</span></div></div><p className="mt-4 rounded-lg bg-berry-beige/60 px-3 py-2 text-xs font-semibold text-berry-brown">Payment status: pending · Razorpay secure checkout</p><p className="mt-3 text-xs leading-5 text-berry-muted">The final price, delivery fee and coupon discount are revalidated by BERRY when your order is submitted.</p></Card>
      </div>}
    </Container></Section>
  </AppShell>
}
