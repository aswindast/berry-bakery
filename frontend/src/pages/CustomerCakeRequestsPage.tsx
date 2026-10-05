import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { AppShell } from '../layouts/AppShell'
import { Badge, Container, EmptyState, ErrorState, LoadingState, PageHeader, Section } from '../components/ui'
import { getCustomerCakeRequests, type CustomerCakeRequest } from '../services/customCakeService'

function formatDate(value: string) { return new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) }
function statusTone(status: string): 'success' | 'error' | 'pink' | 'beige' { return ['approved','completed'].includes(status) ? 'success' : ['rejected'].includes(status) ? 'error' : status === 'pending' ? 'pink' : 'beige' }

function useRequests() {
  const token = useAuth().session?.access_token ?? ''
  const [requests, setRequests] = useState<CustomerCakeRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    getCustomerCakeRequests(token).then((data) => { if (active) setRequests(data) }).catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : 'Could not load requests.') }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [token])
  return { requests, loading, error }
}

export function CustomerCakeRequestsPage() {
  const { requests, loading, error } = useRequests()
  return <AppShell><Section><Container><PageHeader eyebrow="BERRY / Your account" title="My Custom Cake Requests" description="Track the custom cake ideas you’ve sent to BERRY." />
    {loading ? <div className="mt-8"><LoadingState /></div> : error ? <div className="mt-8"><ErrorState title="Requests unavailable" message={error} /></div> : requests.length === 0 ? <div className="mt-8"><EmptyState title="No custom cake requests yet" message="Your submitted custom cake requests will appear here." /><Link to="/custom-cakes" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-berry-deep">Start a request <ArrowRight size={15} /></Link></div> : <div className="mt-8 space-y-3">{requests.map((request) => <Link key={request.id} to={`/account/custom-cake-requests/${request.id}`} className="flex flex-col justify-between gap-4 rounded-xl border border-berry-deep/10 bg-white p-5 hover:border-berry-pink/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-berry-deep sm:flex-row sm:items-center"><div><p className="font-semibold text-berry-deep">{request.occasion} · {formatDate(request.preferred_date)}</p><p className="mt-1 text-sm text-berry-muted">Request #{request.id.slice(0,8).toUpperCase()} · Submitted {formatDate(request.created_at)}</p></div><Badge tone={statusTone(request.status)}>{request.status}</Badge></Link>)}</div>}
  </Container></Section></AppShell>
}

export function CustomerCakeRequestDetailsPage() {
  const { id = '' } = useParams()
  const { requests, loading, error } = useRequests()
  const request = requests.find((item) => item.id === id)
  return <AppShell><Section><Container><Link to="/account/custom-cake-requests" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-berry-deep"><ArrowLeft size={16} /> My requests</Link>
    {loading ? <LoadingState /> : error ? <ErrorState title="Request unavailable" message={error} /> : !request ? <ErrorState title="Request not found" message="This request does not exist or does not belong to your account." /> : <><PageHeader eyebrow="BERRY / Custom cake request" title={request.occasion} description={`Request #${request.id}`} /><div className="mt-7 grid gap-4 md:grid-cols-2">{[
      ['Event date',formatDate(request.preferred_date)],['Preferred time',request.preferred_time],['Servings',String(request.servings)],['Flavor',request.flavor||'Not specified'],['Budget',request.budget_range||'Not specified'],['Status',request.status],['Cake message',request.cake_message||'None'],['Special instructions',request.special_instructions||'None'],['Cake idea',request.style_description],['Submitted',formatDate(request.created_at)],
    ].map(([label,value])=><div key={label} className="rounded-xl border border-berry-deep/10 bg-white p-4"><p className="text-xs font-bold uppercase tracking-wide text-berry-muted">{label}</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-berry-brown">{value}</p></div>)}</div></>}
  </Container></Section></AppShell>
}
