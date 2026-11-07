'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Copy, ExternalLink, Pencil, Trash2 } from 'lucide-react'
import { deleteProperty, duplicateProperty, setPropertyStatus } from '@/lib/actions/properties'
import { useActionToast } from '@/components/admin/Toast'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'
import type { PropertyPurpose, PropertyStatus } from '@/types/property'

export function PropertyRowActions({ id, slug, status, purpose, title }: { id: string; slug: string; status: PropertyStatus; purpose: PropertyPurpose; title: string }) {
  const [pending, start] = useTransition()
  const [confirm, setConfirm] = useState(false)
  const toast = useActionToast()
  const router = useRouter()
  const options: PropertyStatus[] = ['draft', 'published', purpose === 'rent' ? 'rented' : 'sold', 'archived']

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        aria-label={`Status of ${title}`}
        className="field w-36"
        defaultValue={status}
        disabled={pending}
        onChange={e => {
          const v = e.target.value as PropertyStatus
          start(async () => {
            const r = await setPropertyStatus(id, v)
            toast(r)
            if (!r.ok) e.target.value = status
          })
        }}
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <Link href={`/admin/properties/${id}/edit`} className="btn-outline px-3" aria-label={`Edit ${title}`}><Pencil className="h-4 w-4" /></Link>
      <Link href={`/properties/${slug}`} target="_blank" className="btn-outline px-3" aria-label={`View ${title} on site`}><ExternalLink className="h-4 w-4" /></Link>
      <button type="button" disabled={pending} className="btn-outline px-3" aria-label={`Duplicate ${title}`} onClick={() => start(async () => {
        const r = await duplicateProperty(id)
        toast(r)
        if (r.ok && r.data) router.push(`/admin/properties/${r.data.id}/edit`)
      })}><Copy className="h-4 w-4" /></button>
      <button type="button" disabled={pending} className="btn-outline px-3 text-red-700" aria-label={`Delete ${title}`} onClick={() => setConfirm(true)}><Trash2 className="h-4 w-4" /></button>
      <ConfirmDialog
        open={confirm}
        title="Delete this property?"
        body={`"${title}" and all its photos will be permanently deleted. Tip: set it to Archived instead if you may need it again.`}
        onClose={() => setConfirm(false)}
        onConfirm={() => {
          setConfirm(false)
          start(async () => {
            const r = await deleteProperty(id)
            toast(r)
            router.refresh()
          })
        }}
      />
    </div>
  )
}
