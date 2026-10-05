import { useEffect, useState } from 'react'
import { getProductReviews, type ProductReviews } from '../../services/reviewService'
import { Badge, Card, EmptyState, ErrorState, LoadingState, Section } from '../ui'

export function ProductReviewList({ productId }: { productId: string }) {
  const [data,setData]=useState<ProductReviews|null>(null)
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState('')
  useEffect(()=>{let active=true;getProductReviews(productId).then((result)=>{if(active)setData(result)}).catch((reason)=>{if(active)setError(reason instanceof Error?reason.message:'Reviews could not be loaded.')}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[productId])

  return <Section className="bg-white"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-berry-pink">Customer reviews</p><div className="mt-2 flex flex-wrap items-center gap-3"><h2 className="font-serif text-3xl text-berry-deep">Kind words</h2>{data&&data.totalReviews>0&&<><Badge tone="beige">{data.averageRating?.toFixed(1)} / 5</Badge><span className="text-sm text-berry-muted">{data.totalReviews} approved {data.totalReviews===1?'review':'reviews'}</span></>}</div></div>
    {loading?<div className="mt-5"><LoadingState/></div>:error?<div className="mt-5"><ErrorState title="Reviews unavailable" message={error}/></div>:!data?.reviews.length?<div className="mt-5"><EmptyState title="No approved reviews yet" message="Verified customer reviews will appear here after moderation."/></div>:<div className="mt-5 grid gap-3 md:grid-cols-2">{data.reviews.map((review)=><Card key={review.id} className="p-5"><div className="flex flex-wrap items-center justify-between gap-2"><p aria-label={`${review.rating} out of 5 stars`} className="font-semibold text-berry-deep">{'★'.repeat(review.rating)}{'☆'.repeat(5-review.rating)}</p><time className="text-xs text-berry-muted" dateTime={review.created_at}>{new Date(review.created_at).toLocaleDateString('en-IN',{dateStyle:'medium'})}</time></div>{review.title&&<h3 className="mt-3 font-serif text-xl text-berry-deep">{review.title}</h3>}<p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-berry-muted">{review.body}</p></Card>)}</div>}
  </Section>
}
