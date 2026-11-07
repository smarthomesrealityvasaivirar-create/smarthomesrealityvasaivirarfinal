'use client'
import { useEffect, useRef } from 'react'

/** Accessible confirm built on <dialog> (Esc closes, focus is trapped by the browser). */
export function ConfirmDialog({ open, title, body, confirmLabel = 'Delete', onConfirm, onClose }: { open: boolean; title: string; body: string; confirmLabel?: string; onConfirm: () => void; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])
  return (
    <dialog ref={ref} onClose={onClose} className="m-auto w-[min(92vw,420px)] p-6 backdrop:bg-ink/60">
      <h2 className="font-display text-2xl text-ink">{title}</h2>
      <p className="mt-2 text-stone">{body}</p>
      <div className="mt-6 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
        <button type="button" onClick={onConfirm} className="btn-dark bg-red-700 hover:bg-red-800">{confirmLabel}</button>
      </div>
    </dialog>
  )
}
