import { Search, SlidersHorizontal, X } from 'lucide-react'
import { categories as defaultCategories, type ProductCategory } from '../../data/categories'
import { Button, Input, Select } from '../ui'

export type SortOption = 'featured' | 'newest' | 'price-low' | 'price-high' | 'name'

export function ProductSearch({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <div className="relative"><Input id="product-search" label="Search the menu" value={value} onChange={(event) => onChange(event.target.value)} placeholder="Search cakes, brownies, flavours..." className="pr-11" /><Search size={18} aria-hidden="true" className="pointer-events-none absolute bottom-4 right-4 text-berry-muted" /></div>
}

export function CategoryFilter({ value, onChange, categoriesList }: { value: string; onChange: (value: string) => void; categoriesList?: ProductCategory[] }) {
  const cats = categoriesList && categoriesList.length > 0 ? categoriesList : defaultCategories
  return <fieldset className="min-w-0"><legend className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-berry-deep">Category</legend><div className="flex max-w-full min-w-0 gap-2 overflow-x-auto pb-2 lg:flex-wrap lg:overflow-visible">{['all', ...cats.map((category) => category.id)].map((id) => { const label = id === 'all' ? 'All treats' : cats.find((category) => category.id === id)?.name ?? id; return <button type="button" key={id} onClick={() => onChange(id === 'all' ? '' : id)} aria-pressed={value === id || (id === 'all' && !value)} className={`min-h-10 shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-berry-deep focus-visible:ring-offset-2 ${value === id || (id === 'all' && !value) ? 'border-berry-deep bg-berry-deep text-white' : 'border-berry-deep/15 bg-white text-berry-brown hover:border-berry-pink hover:text-berry-deep'}`}>{label}</button> })}</div></fieldset>
}

export function ProductSort({ value, onChange }: { value: SortOption; onChange: (value: SortOption) => void }) {
  return <Select id="product-sort" label="Sort by" value={value} onChange={(event) => onChange(event.target.value as SortOption)}><option value="featured">Featured</option><option value="newest">Newest</option><option value="price-low">Price: Low to High</option><option value="price-high">Price: High to Low</option><option value="name">Name: A to Z</option></Select>
}

export function AvailabilityFilter({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-berry-deep/15 bg-white px-4 text-sm font-semibold text-berry-brown"><input type="checkbox" checked={value === 'available'} onChange={(event) => onChange(event.target.checked ? 'available' : '')} className="size-4 accent-berry-deep" /> Available only</label>
}

export function ActiveFilters({ category, availability, search, onClear, categoriesList }: { category: string; availability: string; search: string; onClear: () => void; categoriesList?: ProductCategory[] }) {
  if (!category && !availability && !search) return null
  const cats = categoriesList && categoriesList.length > 0 ? categoriesList : defaultCategories
  const categoryLabel = cats.find((item) => item.id === category)?.name
  return <div className="flex flex-wrap items-center gap-2 border-t border-berry-deep/10 pt-4"><span className="mr-1 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-berry-muted"><SlidersHorizontal size={14} /> Active</span>{search && <span className="rounded-full bg-berry-beige px-3 py-1 text-xs font-semibold text-berry-brown">“{search}”</span>}{categoryLabel && <span className="rounded-full bg-berry-beige px-3 py-1 text-xs font-semibold text-berry-brown">{categoryLabel}</span>}{availability && <span className="rounded-full bg-berry-beige px-3 py-1 text-xs font-semibold text-berry-brown">Available only</span>}<Button type="button" variant="ghost" className="min-h-8 px-2 py-1 text-xs" onClick={onClear}><X size={14} /> Clear filters</Button></div>
}

export function ProductCardSkeleton() {
  return <div className="overflow-hidden rounded-2xl border border-berry-deep/10 bg-white"><div className="h-56 animate-pulse bg-berry-beige" /><div className="space-y-3 p-5"><div className="h-3 w-1/3 animate-pulse rounded bg-berry-beige" /><div className="h-7 w-3/4 animate-pulse rounded bg-berry-beige" /><div className="h-4 w-full animate-pulse rounded bg-berry-beige" /><div className="h-10 w-full animate-pulse rounded bg-berry-beige" /></div></div>
}

export function ProductGridSkeleton() {
  return <div aria-label="Loading products" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3, 4, 5, 6].map((item) => <ProductCardSkeleton key={item} />)}</div>
}
