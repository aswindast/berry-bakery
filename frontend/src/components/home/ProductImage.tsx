import type { Product } from '../../data/products'
import { BakeryImagePlaceholder } from './BakeryImagePlaceholder'

export function ProductImage({ product, className = '' }: { product: Product; className?: string }) {
  return product.image
    ? <img src={product.image} alt={product.name} loading="lazy" className={`aspect-[4/3] w-full object-cover ${className}`} />
    : <BakeryImagePlaceholder label={product.imageLabel} className={className} tone="beige" />
}
