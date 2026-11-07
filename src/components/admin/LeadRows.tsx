'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { MessageCircle, Phone } from 'lucide-react'
import { updateEnquiry, updateSellRequest, createDraftFromSellRequest } from '@/lib/actions/leads'
import { useActionToast } from '@/components/admin/Toast'
import { formatDateTime, titleCase } from '@/lib/utils/format'
import { telHref, whatsappUrl } from '@/lib/utils/whatsapp'
import { ENQUIRY_STATUSES, SELL_STATUSES, type Enquiry, type EnquiryStatus, type SellRequest, type SellRequestStatus } from '@/types/lead'

function Notes({ initial, onSave }: { initial: string | null; onSave: (v: string) => void }) {
  const [v, setV] = useState(initial ?? '')
  return (
    <div className="flex gap-2">
      <input value={v} onChange={e => setV(e.target.value)} placeholder="Notes (call outcome, visit time...)" aria-label="Notes" className="field" />
      <button type="button" className="btn-outline shrink-0" disabled={v === (initial ?? '')} onClick={() => onSave(v)}>Save</button>
    </div>
  )
}

export function EnquiryRow({ e }: { e: Enquiry }) {
  const [pending, start] = useTransition()
  const toast = useActionToast()
  const reply = whatsappUrl(`Hi ${e.name}, this is Smart Home Reality${e.property_title ? ` about ${e.property_title} (${e.property_ref})` : ''}.`, `91${e.phone}`)
  return (
    <li className={`space-y-3 border bg-white p-4 ${e.status === 'new' ? 'border-gold-deep' : 'border-ink/10'}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-ink">{e.name} <span className="font-normal text-stone">&middot; {e.phone}</span></p>
          <p className="text-sm text-stone">{formatDateTime(e.created_at)} &middot; {titleCase(e.enquiry_type)}{e.property_title && <> &middot; {e.property_title} ({e.property_ref})</>}{e.visit_date && <> &middot; visit {e.visit_date}</>}</p>
          {e.message && <p className="mt-2 text-[15px] text-ink/85">{e.message}</p>}
        </div>
        <div className="flex gap-2">
          <a href={telHref(e.phone)} className="btn-outline px-3" aria-label={`Call ${e.name}`}><Phone className="h-4 w-4" /></a>
          <a href={reply} target="_blank" rel="noopener noreferrer" className="btn-whatsapp px-3" aria-label={`WhatsApp ${e.name}`}><MessageCircle className="h-4 w-4" /></a>
          <select aria-label="Status" className="field w-44" defaultValue={e.status} disabled={pending} onChange={ev => start(async () => toast(await updateEnquiry(e.id, { status: ev.target.value as EnquiryStatus })))}>
            {ENQUIRY_STATUSES.map(s => <option key={s} value={s}>{titleCase(s)}</option>)}
          </select>
        </div>
      </div>
      <Notes initial={e.notes} onSave={v => start(async () => toast(await updateEnquiry(e.id, { notes: v })))} />
    </li>
  )
}

export function SellRequestRow({ r }: { r: SellRequest }) {
  const [pending, start] = useTransition()
  const toast = useActionToast()
  const router = useRouter()
  return (
    <li className={`space-y-3 border bg-white p-4 ${r.status === 'new' ? 'border-gold-deep' : 'border-ink/10'}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-ink">{r.owner_name} <span className="font-normal text-stone">&middot; {r.phone}</span></p>
          <p className="text-sm text-stone">{formatDateTime(r.created_at)} &middot; {r.intention === 'sell' ? 'Sell' : 'Rent out'} &middot; {r.property_type} &middot; {r.locality}{r.expected_price && <> &middot; {r.expected_price}</>}</p>
          {r.description && <p className="mt-2 text-[15px] text-ink/85">{r.description}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={telHref(r.phone)} className="btn-outline px-3" aria-label={`Call ${r.owner_name}`}><Phone className="h-4 w-4" /></a>
          <select aria-label="Status" className="field w-36" defaultValue={r.status} disabled={pending} onChange={ev => start(async () => toast(await updateSellRequest(r.id, { status: ev.target.value as SellRequestStatus })))}>
            {SELL_STATUSES.map(s => <option key={s} value={s}>{titleCase(s)}</option>)}
          </select>
          {r.property_id ? (
            <a href={`/admin/properties/${r.property_id}/edit`} className="btn-outline">Open draft</a>
          ) : (
            <button type="button" disabled={pending} className="btn-dark" onClick={() => start(async () => {
              const res = await createDraftFromSellRequest(r.id)
              toast(res)
              if (res.ok && res.data) router.push(`/admin/properties/${res.data.id}/edit`)
            })}>Approve &rarr; create draft</button>
          )}
        </div>
      </div>
      <Notes initial={r.notes} onSave={v => start(async () => toast(await updateSellRequest(r.id, { notes: v })))} />
    </li>
  )
}
