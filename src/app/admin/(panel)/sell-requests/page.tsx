import { adminListSellRequests } from '@/lib/queries/admin'
import { SellRequestRow } from '@/components/admin/LeadRows'
import { SELL_STATUSES } from '@/types/lead'
import { titleCase } from '@/lib/utils/format'

export default async function SellRequests({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams
  const status = SELL_STATUSES.find(s => s === sp.status)
  const { rows, total } = await adminListSellRequests({ status, page: Number(sp.page) || 1 })
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Owner requests <span className="text-lg text-stone">({total})</span></h1>
      <p className="text-stone">Submitted from the public &ldquo;List your property&rdquo; page. Nothing is published until you create and publish a listing.</p>
      <form className="flex gap-2 border border-ink/10 bg-white p-4">
        <select name="status" defaultValue={status ?? ''} className="field max-w-xs" aria-label="Status">
          <option value="">All statuses</option>
          {SELL_STATUSES.map(s => <option key={s} value={s}>{titleCase(s)}</option>)}
        </select>
        <button type="submit" className="btn-outline">Filter</button>
      </form>
      {rows.length ? <ul className="space-y-3">{rows.map(r => <SellRequestRow key={r.id} r={r} />)}</ul> : <p className="border border-dashed border-ink/20 bg-white p-10 text-center text-stone">No owner requests yet.</p>}
    </div>
  )
}
