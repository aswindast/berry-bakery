import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, PackageCheck } from 'lucide-react'
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { AppShell } from '../layouts/AppShell'
import { Badge, Button, Card, Container, EmptyState, ErrorState, LoadingState, PageHeader, Section } from '../components/ui'
import { fetchOrder, fetchOrders } from '../services/orderService'
import { startRazorpayPayment } from '../services/paymentService'
import { useCartStore } from '../stores/cartStore'
import { CustomerReviewPanel } from '../components/reviews/CustomerReviewPanel'
import type { Order } from '../types/order'

function formatPrice(value: number) {
  return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

function fulfillmentLabel(order: Order) {
  return order.fulfillmentType === 'delivery' ? 'Delivery' : 'Pickup'
}

function PayNowButton({ order }: { order: Order }) {
  const { session, user } = useAuth()
  const navigate = useNavigate()
  const clearCartIfMatches = useCartStore((state) => state.clearCartIfMatches)
  const [isPaying, setIsPaying] = useState(false)
  const [error, setError] = useState('')

  const pay = async () => {
    if (!session?.access_token) return
    setError('')
    setIsPaying(true)
    try {
      await startRazorpayPayment(session.access_token, order.id, {
        name: order.customerName,
        email: user?.email ?? order.customerEmail,
        contact: order.customerPhone,
      })
      clearCartIfMatches(order.items)
      navigate(`/checkout/success/${order.id}`, { replace: true })
    } catch (paymentError) {
      setError(paymentError instanceof Error ? paymentError.message : 'Payment did not complete. This order is saved for retry.')
    } finally {
      setIsPaying(false)
    }
  }

  return <div className="flex flex-col items-start gap-2"><Button type="button" loading={isPaying} onClick={() => void pay()}>{order.paymentStatus === 'failed' ? 'Retry Payment' : 'Pay Now'}</Button>{error && <p role="alert" className="max-w-sm text-xs leading-5 text-red-700">{error}</p>}</div>
}

export function OrdersPage() {
  const { session } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true
    if (!session?.access_token) return () => { isMounted = false }
    fetchOrders(session.access_token)
      .then((data) => { if (isMounted) setOrders(data) })
      .catch((requestError) => { if (isMounted) setError(requestError instanceof Error ? requestError.message : 'Could not load your orders.') })
      .finally(() => { if (isMounted) setIsLoading(false) })
    return () => { isMounted = false }
  }, [session?.access_token])

  return <AppShell><Section><Container>
    <PageHeader eyebrow="BERRY / Customer" title="My orders." description="Your BERRY order history and updates." />
    {isLoading ? <div className="mt-8"><LoadingState /></div> : error ? <div className="mt-8"><ErrorState title="Orders unavailable" message={error} /></div> : orders.length === 0 ? <div className="mt-8"><EmptyState title="No orders yet" message="Your orders will appear here after you place your first order." /><Link to="/menu" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-berry-deep hover:text-berry-pink">Explore the menu <ArrowRight size={15} /></Link></div> : <div className="mt-8 space-y-4">{orders.map((order) => <Card key={order.id} className="flex flex-col justify-between gap-5 p-5 sm:flex-row sm:items-center"><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold text-berry-deep">Order #{order.id.slice(0, 8).toUpperCase()}</h2><Badge tone="beige">{order.status}</Badge><Badge tone={order.paymentStatus === 'paid' ? 'success' : order.paymentStatus === 'failed' ? 'error' : 'pink'}>Payment {order.paymentStatus}</Badge></div><p className="mt-2 text-sm text-berry-muted">{formatDate(order.createdAt)} · {fulfillmentLabel(order)} · {order.items.length} {order.items.length === 1 ? 'item' : 'items'}</p><p className="mt-2 font-semibold text-berry-brown">{formatPrice(order.total)}</p></div><div className="flex flex-wrap items-center gap-3"><Link to={`/account/orders/${order.id}`} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-berry-deep/25 px-4 py-2 text-sm font-semibold text-berry-deep hover:border-berry-pink hover:bg-berry-pink/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-berry-deep">View order <ArrowRight size={15} /></Link>{order.status === 'pending' && order.paymentStatus !== 'paid' && <PayNowButton order={order} />}</div></Card>)}</div>}
  </Container></Section></AppShell>
}

function OrderRecord({ order, confirmation = false }: { order: Order; confirmation?: boolean }) {
  return <>
    {confirmation && <div className="mb-7 text-center"><span className="mx-auto grid size-14 place-items-center rounded-full bg-berry-pink/20 text-berry-deep"><PackageCheck size={27} /></span><p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-berry-pink">{order.paymentStatus === 'paid' ? 'Payment confirmed' : 'Order received'}</p><h1 className="mt-2 font-serif text-4xl text-berry-deep">Thank you, {order.customerName}.</h1><p className="mt-3 text-sm leading-6 text-berry-muted">{order.paymentStatus === 'paid' ? 'Your payment is confirmed. BERRY will coordinate the fulfilment details with you.' : 'Your order is saved. Payment is still pending and can be completed from your order details.'}</p></div>}
    <Card className="p-5 sm:p-7"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.15em] text-berry-muted">Order reference</p><p className="mt-1 break-all font-semibold text-berry-deep">{order.id}</p><p className="mt-2 text-sm text-berry-muted">Placed {formatDate(order.createdAt)}</p></div><div className="flex flex-wrap gap-2"><Badge tone="beige">{order.status}</Badge><Badge tone={order.paymentStatus === 'paid' ? 'success' : order.paymentStatus === 'failed' ? 'error' : 'pink'}>Payment {order.paymentStatus}</Badge></div></div>
      <div className="mt-6 border-t border-berry-deep/10 pt-5"><h2 className="font-serif text-2xl text-berry-deep">Items</h2><div className="mt-4 space-y-3">{order.items.map((item) => <div key={item.id} className="flex justify-between gap-4 text-sm"><div><p className="font-semibold text-berry-brown">{item.productName}</p><p className="mt-1 text-berry-muted">{item.quantity} × {formatPrice(item.unitPrice)}</p></div><p className="shrink-0 font-semibold text-berry-brown">{formatPrice(item.lineTotal)}</p></div>)}</div></div>
      <div className="mt-6 grid gap-5 border-t border-berry-deep/10 pt-5 sm:grid-cols-2"><div><p className="text-xs font-bold uppercase tracking-[0.15em] text-berry-muted">Fulfilment</p><p className="mt-2 font-semibold text-berry-deep">{fulfillmentLabel(order)}</p>{order.fulfillmentType === 'delivery' ? <p className="mt-1 text-sm leading-6 text-berry-muted">{order.deliveryAddress}<br />{order.deliveryCity}, {order.deliveryState} {order.deliveryPincode}</p> : <p className="mt-1 text-sm text-berry-muted">Pickup time will be confirmed by BERRY.</p>}</div><div><p className="text-xs font-bold uppercase tracking-[0.15em] text-berry-muted">Customer</p><p className="mt-2 font-semibold text-berry-deep">{order.customerName}</p><p className="mt-1 break-all text-sm text-berry-muted">{order.customerEmail} · {order.customerPhone}</p>{(order.deliveryInstructions || order.pickupInstructions) && <p className="mt-2 text-sm text-berry-muted">Instructions: {order.deliveryInstructions || order.pickupInstructions}</p>}</div></div>
      <div className="mt-6 space-y-3 border-t border-berry-deep/10 pt-5 text-sm"><div className="flex justify-between text-berry-muted"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div><div className="flex justify-between text-berry-muted"><span>Delivery fee</span><span>{formatPrice(order.deliveryFee)}</span></div>{order.discountAmount>0&&<div className="flex justify-between text-emerald-800"><span>Coupon {order.couponCode}</span><span>−{formatPrice(order.discountAmount)}</span></div>}<div className="flex justify-between border-t border-berry-deep/10 pt-4 text-base font-bold text-berry-deep"><span>Total</span><span>{formatPrice(order.total)}</span></div><p className="rounded-lg bg-berry-beige/60 px-3 py-2 text-xs font-semibold text-berry-brown">Payment status: {order.paymentStatus}</p>{order.paymentStatus === 'paid' && order.paidAt && <p className="text-xs text-berry-muted">Paid {formatDate(order.paidAt)}</p>}</div>
    </Card>
  </>
}

function useLoadOrder() {
  const { id } = useParams()
  const { session } = useAuth()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    let isMounted = true
    if (!id || !session?.access_token) return () => { isMounted = false }
    fetchOrder(session.access_token, id)
      .then((data) => { if (isMounted) setOrder(data) })
      .catch((requestError) => { if (isMounted) setError(requestError instanceof Error ? requestError.message : 'Could not load this order.') })
      .finally(() => { if (isMounted) setIsLoading(false) })
    return () => { isMounted = false }
  }, [id, session?.access_token])
  return { order, isLoading, error }
}

export function OrderDetailsPage() {
  const { order, isLoading, error } = useLoadOrder()
  const location = useLocation()
  const paymentError = location.state && typeof location.state === 'object' && 'paymentError' in location.state && typeof location.state.paymentError === 'string' ? location.state.paymentError : ''
  return <AppShell><Section><Container><Link to="/account/orders" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-berry-deep"><ArrowLeft size={16} /> My orders</Link>{isLoading ? <LoadingState /> : error || !order ? <ErrorState title="Order unavailable" message={error || 'This order could not be found.'} /> : <>{paymentError && <div className="mb-5"><ErrorState title="Payment not completed" message={`${paymentError} The order is saved and available for retry.`} /></div>}<OrderRecord order={order} />{order.status === 'pending' && order.paymentStatus !== 'paid' && <div className="mt-5"><PayNowButton order={order} /></div>}{order.paymentStatus === 'paid' && <CustomerReviewPanel orderId={order.id} paymentStatus={order.paymentStatus} />}</>}</Container></Section></AppShell>
}

export function OrderSuccessPage() {
  const { order, isLoading, error } = useLoadOrder()
  return <AppShell><Section><Container className="max-w-3xl">{isLoading ? <LoadingState /> : error || !order ? <ErrorState title="Order confirmation unavailable" message={error || 'This order could not be found.'} /> : <><OrderRecord order={order} confirmation /><div className="mt-6 flex flex-col gap-3 sm:flex-row"><Link to="/account/orders" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-berry-pink px-5 py-3 text-sm font-semibold text-berry-deep hover:bg-berry-deep hover:text-white">View My Orders <ArrowRight size={16} /></Link><Link to="/menu" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-berry-deep/25 px-5 py-3 text-sm font-semibold text-berry-deep hover:bg-berry-beige">Continue Shopping</Link></div></>}</Container></Section></AppShell>
}
