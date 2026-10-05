import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../../auth/useAuth'
import { getEligibleReviews, submitCustomerReview, type EligibleReviewItem } from '../../services/reviewService'
import { Button, Card, EmptyState, ErrorState, Input, LoadingState, Select, Textarea } from '../ui'
import { z } from 'zod'

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(120),
  body: z.string().trim().min(10, 'Please write at least 10 characters.').max(2000),
})

function ReviewForm({ item, onSubmitted }: { item: EligibleReviewItem; onSubmitted: () => void }) {
  const accessToken = useAuth().session?.access_token ?? ''
  const [rating,setRating]=useState('5')
  const [title,setTitle]=useState('')
  const [body,setBody]=useState('')
  const [error,setError]=useState('')
  const [submitting,setSubmitting]=useState(false)
  const [done,setDone]=useState(false)

  const submit=async(event:FormEvent)=>{
    event.preventDefault()
    setError('')
    const parsed=reviewSchema.safeParse({rating:Number(rating),title,body})
    if(!parsed.success){setError(parsed.error.issues[0]?.message??'Please check your review.');return}
    setSubmitting(true)
    try{await submitCustomerReview(accessToken,{orderItemId:item.order_item_id,...parsed.data});setDone(true);onSubmitted()}
    catch(reason){setError(reason instanceof Error?reason.message:'Your review could not be submitted. Please try again.')}
    finally{setSubmitting(false)}
  }

  if(done)return <p role="status" className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">Thank you. Your review was submitted for moderation.</p>
  return <form onSubmit={(event)=>void submit(event)} className="mt-4 grid gap-3 sm:grid-cols-[150px_1fr]"><Select id={`review-rating-${item.order_item_id}`} label="Rating" value={rating} onChange={(event)=>setRating(event.target.value)}><option value="5">5 · Excellent</option><option value="4">4 · Good</option><option value="3">3 · Nice</option><option value="2">2 · Fair</option><option value="1">1 · Poor</option></Select><Input id={`review-title-${item.order_item_id}`} label="Title (optional)" maxLength={120} value={title} onChange={(event)=>setTitle(event.target.value)}/><div className="sm:col-span-2"><Textarea id={`review-body-${item.order_item_id}`} label="Your review" required minLength={10} maxLength={2000} value={body} onChange={(event)=>setBody(event.target.value)} /></div><div className="sm:col-span-2">{error&&<p role="alert" className="mb-3 text-sm text-red-700">{error}</p>}<Button type="submit" loading={submitting}>Submit review</Button></div></form>
}

export function CustomerReviewPanel({ orderId, paymentStatus }: { orderId: string; paymentStatus: string }) {
  const accessToken=useAuth().session?.access_token??''
  const [items,setItems]=useState<EligibleReviewItem[]>([])
  const [loading,setLoading]=useState(paymentStatus==='paid')
  const [error,setError]=useState('')
  const load=useCallback(()=>getEligibleReviews(accessToken,orderId).then(setItems).catch((reason)=>setError(reason instanceof Error?reason.message:'Eligible purchases could not be loaded.')).finally(()=>setLoading(false)),[accessToken,orderId])
  useEffect(()=>{if(paymentStatus==='paid')void load()},[load,paymentStatus])

  return <Card className="mt-5 p-5 sm:p-6"><h2 className="font-serif text-2xl text-berry-deep">Review a purchase</h2>
    {paymentStatus!=='paid'?<p className="mt-2 text-sm text-berry-muted">Reviews are available after the purchase has been paid and confirmed.</p>:loading?<div className="mt-4"><LoadingState/></div>:error?<div className="mt-4"><ErrorState title="Reviews unavailable" message={error}/></div>:items.length===0?<div className="mt-4"><EmptyState title="No eligible items to review" message="Each paid purchase can be reviewed once. Unavailable products cannot be reviewed."/></div>:<div className="mt-4 space-y-4">{items.map((item)=><div key={item.order_item_id} className="border-t border-berry-deep/10 pt-4 first:border-0 first:pt-0"><p className="font-semibold text-berry-deep">{item.product_name}</p><p className="mt-1 text-xs text-berry-muted">Purchased {new Date(item.purchased_at).toLocaleDateString('en-IN')}</p><ReviewForm item={item} onSubmitted={()=>void load()}/></div>)}</div>}
  </Card>
}
