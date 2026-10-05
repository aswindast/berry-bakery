import { ArrowLeft, ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AppShell } from '../layouts/AppShell'
import { BakeryImagePlaceholder } from '../components/home/BakeryImagePlaceholder'
import { Card, Container, EmptyState, Section } from '../components/ui'
import { useCartStore } from '../stores/cartStore'

function formatPrice(value: number) {
  return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
}

export default function CartPage() {
  const items = useCartStore((state) => state.items)
  const increaseQuantity = useCartStore((state) => state.increaseQuantity)
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity)
  const removeProduct = useCartStore((state) => state.removeProduct)
  const clearCart = useCartStore((state) => state.clearCart)
  const subtotal = items.reduce((sum, item) => sum + Math.round(item.product.price * 100) * item.quantity, 0) / 100

  return <AppShell>
    <Section className="bg-berry-cream">
      <Container>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-berry-pink">BERRY / Your bag</p>
        <h1 className="mt-3 font-serif text-5xl text-berry-deep">Your Cart</h1>
        <p className="mt-3 text-base text-berry-muted">A little sweetness, gathered in one place.</p>
      </Container>
    </Section>
    <Section className="pt-8">
      <Container>
        {!items.length ? <div className="mx-auto max-w-2xl">
          <div className="mb-6 text-center text-berry-pink"><ShoppingBag size={38} className="mx-auto" strokeWidth={1.4} /></div>
          <EmptyState title="Your cart is waiting for something lovely." message="Explore the BERRY menu and add a bake to get started." />
          <div className="mt-6 text-center"><Link to="/menu" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-berry-pink px-5 py-3 text-sm font-semibold text-berry-deep transition hover:bg-berry-deep hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-berry-deep focus-visible:ring-offset-2"><ArrowLeft size={16} /> Continue Shopping</Link></div>
        </div> : <div className="grid items-start gap-8 lg:grid-cols-[1fr_350px]">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-semibold text-berry-muted">{items.reduce((count, item) => count + item.quantity, 0)} items in your bag</p>
              <button type="button" onClick={clearCart} className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-berry-muted hover:bg-berry-beige hover:text-berry-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-berry-deep"><Trash2 size={16} /> Clear cart</button>
            </div>
            {items.map(({ product, quantity }) => {
              const lineTotal = Math.round(product.price * 100) * quantity / 100
              return <Card key={product.id} className="grid gap-4 p-4 sm:grid-cols-[144px_1fr] sm:gap-5 sm:p-5">
                <Link to={`/menu/${product.slug}`} aria-label={`View ${product.name}`} className="block overflow-hidden rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-berry-deep">
                  {product.image ? <img src={product.image} alt={product.name} className="aspect-[4/3] w-full rounded-xl object-cover" /> : <BakeryImagePlaceholder label={product.imageLabel} tone="beige" className="aspect-[4/3] rounded-xl" />}
                </Link>
                <div className="flex min-w-0 flex-col justify-between gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0"><p className="text-xs font-bold uppercase tracking-[0.14em] text-berry-muted">{product.category}</p><Link to={`/menu/${product.slug}`} className="mt-1 block font-serif text-2xl text-berry-deep hover:text-berry-pink">{product.name}</Link><p className="mt-2 text-sm text-berry-muted">{formatPrice(product.price)} each</p></div>
                    <button type="button" onClick={() => removeProduct(product.id)} aria-label={`Remove ${product.name}`} className="grid size-10 shrink-0 place-items-center rounded-lg text-berry-muted hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-berry-deep"><Trash2 size={17} /></button>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="inline-flex items-center rounded-lg border border-berry-deep/15 bg-white">
                      <button type="button" onClick={() => decreaseQuantity(product.id)} disabled={quantity <= 1} aria-label={`Decrease ${product.name} quantity`} className="grid size-10 place-items-center rounded-l-lg text-berry-deep hover:bg-berry-beige disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-berry-deep"><Minus size={15} /></button>
                      <span aria-label={`${quantity} items`} className="min-w-10 text-center text-sm font-semibold">{quantity}</span>
                      <button type="button" onClick={() => increaseQuantity(product.id)} disabled={quantity >= 50} aria-label={`Increase ${product.name} quantity`} className="grid size-10 place-items-center rounded-r-lg text-berry-deep hover:bg-berry-beige disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-berry-deep"><Plus size={15} /></button>
                    </div>
                    <p className="font-semibold text-berry-brown">{formatPrice(lineTotal)}</p>
                  </div>
                </div>
              </Card>
            })}
            <Link to="/menu" className="inline-flex items-center gap-2 py-2 text-sm font-semibold text-berry-deep hover:text-berry-pink"><ArrowLeft size={16} /> Continue shopping</Link>
          </div>
          <Card className="p-5 sm:p-6 lg:sticky lg:top-28">
            <h2 className="font-serif text-2xl text-berry-deep">Order Summary</h2>
            <div className="mt-6 space-y-4 text-sm"><div className="flex justify-between gap-4 text-berry-muted"><span>Subtotal</span><span className="font-semibold text-berry-brown">{formatPrice(subtotal)}</span></div><div className="flex justify-between gap-4 text-berry-muted"><span>Delivery</span><span>Confirmed at checkout</span></div><div className="border-t border-berry-deep/10 pt-4"><div className="flex justify-between gap-4 text-base font-bold text-berry-deep"><span>Estimated subtotal</span><span>{formatPrice(subtotal)}</span></div><p className="mt-2 text-xs leading-5 text-berry-muted">Delivery fees and coupon discounts are confirmed at checkout. Payment is completed securely with Razorpay.</p></div></div>
            <Link to="/checkout" className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-berry-pink px-5 py-3 text-sm font-semibold text-berry-deep transition hover:bg-berry-deep hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-berry-deep focus-visible:ring-offset-2">Proceed to Checkout <ArrowRight size={17} /></Link>
          </Card>
        </div>}
      </Container>
    </Section>
  </AppShell>
}
