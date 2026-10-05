import { ArrowUpRight, CircleAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Product } from '../../data/products'
import { Badge, Card } from '../ui'
import { ProductImage } from './ProductImage'

export function ProductCard({ product }: { product: Product }) {
  return <Card className="group overflow-hidden"><ProductImage product={product} className="rounded-none transition duration-500 group-hover:scale-[1.02]" /><div className="p-5"><div className="flex items-start justify-between gap-3"><div><div className="flex flex-wrap gap-2"><p className="text-xs font-bold uppercase tracking-[0.15em] text-berry-muted">{product.category}</p>{product.isFeatured && <Badge tone="pink">Featured</Badge>}</div><h3 className="mt-2 font-serif text-2xl text-berry-deep">{product.name}</h3></div>{product.isAvailable ? <Badge tone="success">Available</Badge> : <Badge tone="beige"><CircleAlert size={12} /> Currently Unavailable</Badge>}</div><p className="mt-3 text-sm leading-6 text-berry-muted">{product.description}</p><div className="mt-5 flex items-center justify-between gap-3"><p className="text-sm font-semibold text-berry-brown">From ₹{product.price.toLocaleString('en-IN')}</p><Link to={`/menu/${product.slug}`} aria-label={`View ${product.name}`} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-berry-deep/30 px-3 py-2 text-sm font-semibold text-berry-deep transition hover:border-berry-pink hover:bg-berry-pink/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-berry-deep focus-visible:ring-offset-2">View Details <ArrowUpRight size={15} /></Link></div></div></Card>
}
