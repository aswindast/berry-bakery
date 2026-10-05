import { useEffect, useState, type ReactNode } from 'react'
import { ArrowLeft, Check, Clock3, Egg, Info, MessageCircle, ShoppingBag, Sparkles } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { fetchProductBySlug, fetchProducts } from '../services/productService'
import type { Product } from '../data/products'
import { AppShell } from '../layouts/AppShell'
import { BakeryImagePlaceholder } from '../components/home/BakeryImagePlaceholder'
import { ProductCard } from '../components/home/ProductCard'
import { Badge, Card, Container, EmptyState, Section } from '../components/ui'
import { Button } from '../components/ui'
import { useCartStore } from '../stores/cartStore'
import { ProductReviewList } from '../components/reviews/ProductReviewList'

export default function ProductDetailsPage() {
  const { slug } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [added, setAdded] = useState(false)
  const addProduct = useCartStore((state) => state.addProduct)

  useEffect(() => {
    if (!slug) return
    let isMounted = true

    fetchProductBySlug(slug)
      .then(async (fetchedProduct) => {
        if (!isMounted) return
        setProduct(fetchedProduct)
        setError(null)
        if (fetchedProduct) {
          try {
            const allProducts = await fetchProducts()
            if (!isMounted) return
            const sameCategory = allProducts.filter((p) => p.id !== fetchedProduct.id && p.category === fetchedProduct.category)
            const others = allProducts.filter((p) => p.id !== fetchedProduct.id && p.category !== fetchedProduct.category)
            setRelated([...sameCategory, ...others].slice(0, 4))
          } catch {
            if (isMounted) setRelated([])
          }
        }
      })
      .catch((err) => {
        if (!isMounted) return
        setError(err instanceof Error ? err.message : 'Could not fetch product details.')
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [slug])

  if (loading) {
    return (
      <AppShell>
        <Section className="pb-8">
          <Container>
            <div className="h-6 w-32 animate-pulse rounded bg-berry-beige" />
            <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-start">
              <div className="aspect-square animate-pulse rounded-2xl bg-berry-beige" />
              <div className="space-y-4">
                <div className="h-6 w-1/4 animate-pulse rounded bg-berry-beige" />
                <div className="h-12 w-3/4 animate-pulse rounded bg-berry-beige" />
                <div className="h-6 w-full animate-pulse rounded bg-berry-beige" />
                <div className="h-8 w-1/3 animate-pulse rounded bg-berry-beige" />
              </div>
            </div>
          </Container>
        </Section>
      </AppShell>
    )
  }

  if (error || !product) {
    return (
      <AppShell>
        <Section>
          <Container>
            <EmptyState
              title={error ? 'Unable to load product' : 'Product not found'}
              message={error ?? 'We could not find that BERRY bake. Explore the menu to discover something else sweet.'}
            />
            <Link to="/menu" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-berry-deep hover:text-berry-pink">
              <ArrowLeft size={16} /> Back to menu
            </Link>
          </Container>
        </Section>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <Section className="pb-8">
        <Container>
          <Link to="/menu" className="inline-flex items-center gap-2 text-sm font-semibold text-berry-muted hover:text-berry-deep">
            <ArrowLeft size={16} /> Back to menu
          </Link>
          <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-start">
            {product.image ? (
              <img src={product.image} alt={product.name} className="aspect-square w-full rounded-2xl object-cover lg:sticky lg:top-28" />
            ) : (
              <BakeryImagePlaceholder label={product.imageLabel} tone="beige" className="aspect-square lg:sticky lg:top-28" />
            )}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="beige">{product.category}</Badge>
                {product.isFeatured && <Badge tone="pink">Featured</Badge>}
                {product.isAvailable ? <Badge tone="success">Available</Badge> : <Badge tone="error">Currently Unavailable</Badge>}
              </div>
              <h1 className="mt-5 font-serif text-5xl leading-tight text-berry-deep sm:text-6xl">{product.name}</h1>
              <p className="mt-5 text-lg leading-8 text-berry-muted">{product.description}</p>
              <p className="mt-7 font-serif text-3xl text-berry-brown">From ₹{product.price.toLocaleString('en-IN')}</p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button type="button" disabled={!product.isAvailable} onClick={() => { addProduct(product); setAdded(true) }}>
                  {added ? <Check size={17} /> : <ShoppingBag size={17} />}
                  {product.isAvailable ? (added ? 'Added to Cart' : 'Add to Cart') : 'Currently Unavailable'}
                </Button>
                {added && <Link to="/cart" className="text-sm font-semibold text-berry-deep hover:text-berry-pink">View cart</Link>}
              </div>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {product.flavor && <InfoRow icon={<Sparkles size={18} />} label="Flavour" value={product.flavor} />}
                {product.eggless !== undefined && <InfoRow icon={<Egg size={18} />} label="Recipe" value={product.eggless ? 'Eggless' : 'Contains egg'} />}
                {product.preparationTime && <InfoRow icon={<Clock3 size={18} />} label="Preparation" value={product.preparationTime} />}
                {product.minimumAdvanceNotice && <InfoRow icon={<Clock3 size={18} />} label="Minimum notice" value={product.minimumAdvanceNotice} />}
              </div>
              <div className="mt-8 rounded-2xl border border-berry-deep/10 bg-berry-beige/45 p-5">
                <p className="flex items-center gap-2 font-semibold text-berry-deep">
                  <MessageCircle size={18} /> Planning something special?
                </p>
                <p className="mt-2 text-sm leading-6 text-berry-muted">
                  Product variants, customizations, cake messages and special instructions will be connected in a future phase.
                </p>
                <Link to="/custom-cakes" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-berry-deep hover:text-berry-pink">
                  Talk about a custom cake <ArrowLeft size={15} className="rotate-180" />
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </Section>
      <Section className="border-y border-berry-deep/10 bg-white">
        <Container>
          <div className="grid gap-4 sm:grid-cols-3">
            <FutureDetail title="Ingredients" />
            <FutureDetail title="Allergens" />
            <FutureDetail title="Variants & customizations" />
          </div>
        </Container>
      </Section>
      <ProductReviewList productId={product.id} />
      {related.length > 0 && (
        <Section eyebrow="Keep exploring">
          <Container>
            <h2 className="font-serif text-4xl text-berry-deep">More from BERRY</h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </Container>
        </Section>
      )}
    </AppShell>
  )
}

function InfoRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-berry-deep/10 bg-white p-4">
      <span className="text-berry-pink">{icon}</span>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-berry-muted">{label}</p>
        <p className="mt-1 text-sm font-semibold text-berry-brown">{value}</p>
      </div>
    </div>
  )
}

function FutureDetail({ title }: { title: string }) {
  return (
    <Card className="p-5">
      <p className="flex items-center gap-2 font-serif text-xl text-berry-deep">
        <Info size={17} className="text-berry-pink" /> {title}
      </p>
      <p className="mt-3 text-sm leading-6 text-berry-muted">Details will be added when the catalog data is ready.</p>
    </Card>
  )
}
