import type { ReactNode } from 'react'
import { ErrorState, LoadingState, PageHeader } from '../ui'

export function AdminPage({ eyebrow = 'BERRY / Admin', title, description, children }: { eyebrow?: string; title: string; description?: string; children: ReactNode }) {
  return <div className="min-w-0"><PageHeader eyebrow={eyebrow} title={title} description={description} /><div className="mt-7">{children}</div></div>
}

export function AdminLoading() { return <LoadingState /> }
export function AdminError({ message }: { message: string }) { return <ErrorState title="Could not load this view" message={message} /> }

export function AdminTable({ children, headers }: { children: ReactNode; headers: string[] }) {
  return <div className="overflow-x-auto rounded-xl border border-berry-deep/10 bg-white"><table className="w-full min-w-[720px] border-collapse text-left text-sm"><thead className="bg-berry-beige/60 text-xs uppercase tracking-wide text-berry-muted"><tr>{headers.map((header) => <th key={header} scope="col" className="px-4 py-3 font-bold">{header}</th>)}</tr></thead><tbody className="divide-y divide-berry-deep/10">{children}</tbody></table></div>
}

export function AdminCell({ children, className = '' }: { children: ReactNode; className?: string }) { return <td className={`px-4 py-3 align-middle ${className}`}>{children}</td> }
export function AdminPanel({ children, className = '', id }: { children: ReactNode; className?: string; id?: string }) { return <section id={id} className={`rounded-xl border border-berry-deep/10 bg-white p-4 shadow-[0_4px_18px_rgba(74,44,42,0.04)] sm:p-5 ${className}`}>{children}</section> }
