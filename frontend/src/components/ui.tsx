import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { AlertCircle, Check, ChevronDown, LoaderCircle, X } from 'lucide-react'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  loading?: boolean
}

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-berry-pink text-berry-deep hover:bg-berry-deep hover:text-white',
  secondary: 'bg-berry-beige text-berry-deep hover:bg-berry-soft-rose',
  outline: 'border border-berry-deep/30 bg-transparent text-berry-deep hover:border-berry-pink hover:bg-berry-pink/10',
  ghost: 'text-berry-deep hover:bg-berry-beige',
  destructive: 'bg-red-700 text-white hover:bg-red-800',
}

export function Button({ className = '', variant = 'primary', loading = false, disabled, children, ...props }: ButtonProps) {
  return <button className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-berry-deep focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${buttonVariants[variant]} ${className}`} disabled={disabled || loading} {...props}>{loading && <LoaderCircle size={17} className="animate-spin" aria-hidden="true" />} {loading ? 'Preparing...' : children}</button>
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string; hint?: string }>(({ label, error, hint, id, className = '', ...props }, ref) => <Field label={label} error={error} hint={hint} id={id}><input ref={ref} id={id} aria-invalid={error ? true : undefined} className={`min-h-12 w-full rounded-xl border bg-white px-4 text-sm text-berry-text outline-none transition placeholder:text-berry-muted/70 focus:border-berry-deep focus:ring-2 focus:ring-berry-pink/40 ${error ? 'border-red-600' : 'border-berry-deep/15'} ${className}`} {...props} /></Field>)
Input.displayName = 'Input'

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string; hint?: string }>(({ label, error, hint, id, className = '', ...props }, ref) => <Field label={label} error={error} hint={hint} id={id}><textarea ref={ref} id={id} aria-invalid={error ? true : undefined} className={`min-h-28 w-full resize-y rounded-xl border bg-white px-4 py-3 text-sm text-berry-text outline-none transition placeholder:text-berry-muted/70 focus:border-berry-deep focus:ring-2 focus:ring-berry-pink/40 ${error ? 'border-red-600' : 'border-berry-deep/15'} ${className}`} {...props} /></Field>)
Textarea.displayName = 'Textarea'

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & { label?: string; error?: string; hint?: string }>(({ label, error, hint, id, children, className = '', ...props }, ref) => <Field label={label} error={error} hint={hint} id={id}><span className="relative block"><select ref={ref} id={id} aria-invalid={error ? true : undefined} className={`min-h-12 w-full appearance-none rounded-xl border bg-white px-4 pr-10 text-sm text-berry-text outline-none transition focus:border-berry-deep focus:ring-2 focus:ring-berry-pink/40 ${error ? 'border-red-600' : 'border-berry-deep/15'} ${className}`} {...props}>{children}</select><ChevronDown size={17} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-berry-muted" /></span></Field>)
Select.displayName = 'Select'

function Field({ label, error, hint, id, children }: { label?: string; error?: string; hint?: string; id?: string; children: ReactNode }) {
  return <label htmlFor={id} className="block space-y-2 text-sm font-semibold text-berry-text">{label && <span>{label}</span>}{children}{error ? <span role="alert" className="flex items-center gap-1 text-xs font-medium text-red-700"><AlertCircle size={14} />{error}</span> : hint && <span className="block text-xs font-normal text-berry-muted">{hint}</span>}</label>
}

export function Checkbox({ label, checked, onChange }: { label: string; checked?: boolean; onChange?: (checked: boolean) => void }) {
  return <label className="inline-flex cursor-pointer items-center gap-3 text-sm font-medium text-berry-text"><input type="checkbox" checked={checked} onChange={(event) => onChange?.(event.target.checked)} className="peer sr-only" /><span className="grid size-5 place-items-center rounded-md border border-berry-deep/25 bg-white text-white transition peer-checked:border-berry-deep peer-checked:bg-berry-deep peer-focus-visible:ring-2 peer-focus-visible:ring-berry-pink/60"><Check size={14} strokeWidth={3} /></span>{label}</label>
}

export function Radio({ label, name, value, checked, onChange }: { label: string; name: string; value: string; checked?: boolean; onChange?: (value: string) => void }) {
  return <label className="inline-flex cursor-pointer items-center gap-3 text-sm font-medium text-berry-text"><input type="radio" name={name} value={value} checked={checked} onChange={(event) => onChange?.(event.target.value)} className="peer sr-only" /><span className={`grid size-5 place-items-center rounded-full border bg-white transition peer-focus-visible:ring-2 peer-focus-visible:ring-berry-pink/60 ${checked ? 'border-berry-deep' : 'border-berry-deep/25'}`}><span className={`size-2.5 rounded-full bg-berry-deep ${checked ? 'opacity-100' : 'opacity-0'}`} /></span>{label}</label>
}

export function Badge({ children, tone = 'pink' }: { children: ReactNode; tone?: 'pink' | 'beige' | 'deep' | 'success' | 'error' }) {
  const tones = { pink: 'bg-berry-pink/25 text-berry-deep', beige: 'bg-berry-beige text-berry-brown', deep: 'bg-berry-deep text-white', success: 'bg-emerald-100 text-emerald-800', error: 'bg-red-100 text-red-800' }
  return <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold tracking-wide ${tones[tone]}`}>{children}</span>
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) { return <article className={`rounded-2xl border border-berry-deep/10 bg-white shadow-[0_8px_30px_rgba(74,44,42,0.06)] ${className}`}>{children}</article> }
export function Dialog({ title, open, onClose, children }: { title: string; open: boolean; onClose: () => void; children: ReactNode }) { return open ? <div className="fixed inset-0 z-50 grid place-items-center bg-berry-text/40 p-5" role="presentation" onClick={onClose}><div role="dialog" aria-modal="true" aria-labelledby="dialog-title" className="w-full max-w-md rounded-2xl bg-berry-cream p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="flex items-start justify-between gap-4"><h2 id="dialog-title" className="font-serif text-2xl text-berry-deep">{title}</h2><button type="button" onClick={onClose} aria-label="Close dialog" className="rounded-lg p-2 text-berry-muted hover:bg-berry-beige"><X size={18} /></button></div><div className="mt-5">{children}</div></div></div> : null }
export function Toast({ message, onClose }: { message: string; onClose?: () => void }) { return <div role="status" className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-medium text-emerald-800 shadow-lg"><Check size={18} />{message}{onClose && <button type="button" onClick={onClose} aria-label="Dismiss notification" className="ml-auto p-1"><X size={15} /></button>}</div> }
export function Tooltip({ label, children }: { label: string; children: ReactNode }) { return <span className="group relative inline-flex"><span tabIndex={0} aria-label={label}>{children}</span><span role="tooltip" className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-berry-text px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">{label}</span></span> }
export function Skeleton({ className = '' }: { className?: string }) { return <div aria-label="Loading" className={`animate-pulse rounded-lg bg-berry-beige ${className}`} /> }
export function Spinner({ label = 'Loading' }: { label?: string }) { return <span className="inline-flex items-center gap-2 text-sm text-berry-muted"><LoaderCircle size={18} className="animate-spin text-berry-deep" />{label}</span> }
export function EmptyState({ title, message }: { title: string; message: string }) { return <div className="rounded-2xl border border-dashed border-berry-deep/20 bg-berry-beige/40 px-6 py-10 text-center"><p className="font-serif text-xl text-berry-deep">{title}</p><p className="mt-2 text-sm text-berry-muted">{message}</p></div> }
export function ErrorState({ title, message }: { title: string; message: string }) { return <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-6 py-5"><p className="font-semibold text-red-900">{title}</p><p className="mt-1 text-sm text-red-700">{message}</p></div> }
export function LoadingState() { return <div className="flex items-center justify-center rounded-2xl bg-berry-beige/40 px-6 py-10"><Spinner label="Preparing something lovely..." /></div> }
export function Container({ children, className = '' }: { children: ReactNode; className?: string }) { return <div className={`mx-auto w-full max-w-6xl px-5 sm:px-8 lg:px-10 ${className}`}>{children}</div> }
export function Section({ children, className = '', eyebrow }: { children: ReactNode; className?: string; eyebrow?: string }) { return <section className={`py-14 sm:py-20 ${className}`}><Container>{eyebrow && <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-berry-pink">{eyebrow}</p>}{children}</Container></section> }
export function PageHeader({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) { return <header className="max-w-3xl">{eyebrow && <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-berry-pink">{eyebrow}</p>}<h1 className="font-serif text-4xl leading-tight text-berry-deep sm:text-5xl">{title}</h1>{description && <p className="mt-4 max-w-2xl text-base leading-7 text-berry-muted">{description}</p>}</header> }
