import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, RefreshCw, SearchX } from 'lucide-react'
import { fetchCategories, fetchProducts, type ProductCategory } from '../services/productService'
import type { Product } from '../data/products'
import { AppShell } from '../layouts/AppShell'
import { BakeryImagePlaceholder } from '../components/home/BakeryImagePlaceholder'
import { ProductCard } from '../components/home/ProductCard'
import { ActiveFilters, AvailabilityFilter, CategoryFilter, ProductGridSkeleton, ProductSearch, ProductSort, type SortOption } from '../components/catalog/CatalogControls'
import { Button, Container, EmptyState, Section } from '../components/ui'

export default function MenuPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('search') ?? ''
  const category = searchParams.get('category') ?? ''
  const availability = searchParams.get('availability') ?? ''
  const sort = (searchParams.get('sort') ?? 'featured') as SortOption

  const [products, setProducts] = useState<Product[]>([])
  const [categoriesList, setCategoriesList] = useState<ProductCategory[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    fetchCategories()
      .then((cats) => {
        if (isMounted) setCategoriesList(cats)
      })
      .catch(() => {
        // Fall back gracefully if categories fetch fails
      })
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const filters = {
      search: search || undefined,
      category: category || undefined,
      available: availability === 'available' ? true : undefined,
      sort: sort,
    }

    fetchProducts(filters)
      .then((data) => {
        if (isMounted) {
          setProducts(data)
          setError(null)
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Could not load products from backend.')
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [search, category, availability, sort])

  const updateParam = (key: string, value: string) => {
    setLoading(true)
    const next = new URLSearchParams(searchParams)
    if (value && !(key === 'sort' && value === 'featured')) next.set(key, value)
    else next.delete(key)
    setSearchParams(next)
  }

  const clearFilters = () => {
    setLoading(true)
    setSearchParams({})
  }

  return (
    <AppShell>
      <section className="bg-berry-cream">
        <Container className="grid gap-8 py-14 sm:py-20 lg:grid-cols-[1fr_0.65fr] lg:items-end">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-berry-pink">BERRY / The menu</p>
            <h1 className="font-serif text-5xl text-berry-deep sm:text-6xl">Our Menu</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-berry-muted">
              Explore cakes, pastries, desserts and sweet treats from BERRY.
            </p>
          </div>
          <BakeryImagePlaceholder label="The BERRY menu" tone="rose" className="aspect-[4/2.5] lg:aspect-[4/3]" />
        </Container>
      </section>

      <Section className="bg-white py-10 sm:py-14">
        <div className="space-y-6">
          <CategoryFilter value={category} onChange={(val) => updateParam('category', val)} categoriesList={categoriesList} />
          <div className="grid gap-4 md:grid-cols-[1fr_0.5fr_0.5fr] md:items-end">
            <ProductSearch value={search} onChange={(val) => updateParam('search', val)} />
            <ProductSort value={sort} onChange={(val) => updateParam('sort', val as SortOption)} />
            <AvailabilityFilter value={availability} onChange={(val) => updateParam('availability', val)} />
          </div>
          <ActiveFilters category={category} availability={availability} search={search} onClear={clearFilters} categoriesList={categoriesList} />
        </div>
      </Section>

      <Section className="pt-8 sm:pt-10">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm text-berry-muted">
              {products.length} {products.length === 1 ? 'treat' : 'treats'} to explore
            </p>
            <h2 className="mt-1 font-serif text-3xl text-berry-deep">Find your next sweet moment.</h2>
          </div>
          {sort !== 'featured' && (
            <span className="text-xs font-semibold text-berry-muted">
              Sorted by {sort === 'price-low' ? 'price, low to high' : sort === 'price-high' ? 'price, high to low' : sort === 'name' ? 'name' : 'newest'}
            </span>
          )}
        </div>

        {loading ? (
          <ProductGridSkeleton />
        ) : error ? (
          <div>
            <EmptyState title="Unable to load menu" message={error} />
            <Button type="button" variant="outline" className="mt-5" onClick={() => updateParam('sort', sort)}>
              <RefreshCw size={16} /> Try again
            </Button>
          </div>
        ) : products.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div>
            <EmptyState title="No sweet treats found" message="Try another search or explore a different category." />
            <Button type="button" variant="outline" className="mt-5" onClick={clearFilters}>
              <SearchX size={16} /> Clear Filters
            </Button>
          </div>
        )}
      </Section>

      <section className="bg-berry-deep py-10 text-white">
        <Container className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <p className="font-serif text-2xl">Looking for something made around your moment?</p>
          <Link to="/custom-cakes" className="inline-flex items-center gap-2 text-sm font-semibold text-berry-soft-rose hover:text-white">
            Explore custom cakes <ArrowRight size={16} />
          </Link>
        </Container>
      </section>
    </AppShell>
  )
}

export { ProductGridSkeleton }
