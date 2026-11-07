import Link from 'next/link'
import { adminListEnquiries, ADMIN_PAGE_SIZE } from '@/lib/queries/admin'
import { EnquiryRow } from '@/components/admin/LeadRows'
import { ENQUIRY_STATUSES } from '@/types/lead'
import { titleCase } from '@/lib/utils/format'

export default async function Enquiries({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams
  const status = ENQUIRY_STATUSES.find(s => s === sp.status)
  const page = Number(sp.page) || 1
  const { rows, total } = await adminListEnquiries({ status, from: sp.from, to: sp.to, page })
  const qs = new URLSearchParams(Object.entries({ status, from: sp.from, to: sp.to }).filter(([, v]) => v) as [string, string][])
  const pages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE))
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl">Enquiries <span className="text-lg text-stone">({total})</span></h1>
        <a href={`/admin/enquiries/export?${qs}`} className="btn-outline">Export CSV</a>
      </div>
      <form className="grid gap-2 border border-ink/10 bg-white p-4 sm:grid-cols-4">
        <select name="status" defaultValue={status ?? ''} className="field" aria-label="Status">
          <option value="">All statuses</option>
          {ENQUIRY_STATUSES.map(s => <option key={s} value={s}>{titleCase(s)}</option>)}
        </select>
        <input type="date" name="from" defaultValue={sp.from} className="field" aria-label="From date" />
        <input type="date" name="to" defaultValue={sp.to} className="field" aria-label="To date" />
        <button type="submit" className="btn-outline">Filter</button>
      </form>
      {rows.length ? (
        <ul className="space-y-3">{rows.map(e => <EnquiryRow key={e.id} e={e} />)}</ul>
      ) : (
        <p className="border border-dashed border-ink/20 bg-white p-10 text-center text-stone">No enquiries for these filters.</p>
      )}
      {pages > 1 && (
        <nav className="flex flex-wrap gap-2">{Array.from({ length: pages }, (_, i) => i + 1).map(n => { const q = new URLSearchParams(qs); q.set('page', String(n)); return <Link key={n} href={`/admin/enquiries?${q}`} className={n === page ? 'btn-dark px-4' : 'btn-outline px-4'}>{n}</Link> })}</nav>
      )}
    </div>
  )
}
