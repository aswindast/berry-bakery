import { CakeSlice } from 'lucide-react'

export function BakeryImagePlaceholder({ label, className = '', tone = 'rose' }: { label: string; className?: string; tone?: 'rose' | 'beige' | 'deep' }) {
  const tones = { rose: 'bg-berry-soft-rose text-berry-deep', beige: 'bg-berry-beige text-berry-brown', deep: 'bg-berry-deep text-berry-cream' }
  return <div role="img" aria-label={`${label} image placeholder`} className={`relative isolate aspect-[4/3] overflow-hidden rounded-2xl ${tones[tone]} ${className}`}><div className="absolute inset-4 rounded-xl border border-current/20" /><div className="absolute -bottom-14 -left-10 size-44 rounded-full border-[24px] border-current/10" /><div className="absolute -right-12 -top-12 size-40 rounded-full border-[20px] border-current/10" /><div className="relative flex h-full flex-col items-center justify-center gap-3 p-6 text-center"><CakeSlice size={30} strokeWidth={1.4} aria-hidden="true" /><span className="text-[10px] font-bold uppercase tracking-[0.22em]">{label}</span><span className="text-xs opacity-70">BERRY image placeholder</span></div></div>
}
