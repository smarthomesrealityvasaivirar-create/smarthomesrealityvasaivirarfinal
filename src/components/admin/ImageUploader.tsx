'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import imageCompression from 'browser-image-compression'
import { DndContext, KeyboardSensor, PointerSensor, TouchSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, rectSortingStrategy, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, ImagePlus, Link2, RotateCcw, Star, Trash2, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/cn'
import { isImageUrl } from '@/lib/utils/image-url'

export const MAX_IMAGES = 15
const MAX_BYTES = 8 * 1024 * 1024
const TYPES = ['image/jpeg', 'image/png', 'image/webp']

export type UploadItem = {
  key: string
  url: string
  storage_path: string | null
  alt_text: string
  is_cover: boolean
  status: 'uploading' | 'done' | 'error'
  progress: number
  error?: string
  file?: File
}

/**
 * Multi-photo uploader: select many / drag-drop, client-side compression (max 1600px, WebP q0.82),
 * per-photo progress, retry, cancel, drag to reorder (mouse, touch, keyboard), set cover, alt text, delete.
 * Demo mode keeps photos in memory only (clearly labelled).
 */
export function ImageUploader({ folderId, items, onChange, demo }: { folderId: string; items: UploadItem[]; onChange: (fn: (prev: UploadItem[]) => UploadItem[]) => void; demo: boolean }) {
  const input = useRef<HTMLInputElement>(null)
  const cancelled = useRef(new Set<string>())
  const [drag, setDrag] = useState(false)
  const [pasteUrl, setPasteUrl] = useState('')
  const [notice, setNotice] = useState<string | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const patch = (key: string, p: Partial<UploadItem>) => onChange(prev => prev.map(i => (i.key === key ? { ...i, ...p } : i)))
  const withCover = (list: UploadItem[]) => (list.length && !list.some(i => i.is_cover) ? list.map((i, idx) => ({ ...i, is_cover: idx === 0 })) : list)

  async function upload(item: UploadItem) {
    const file = item.file!
    try {
      patch(item.key, { status: 'uploading', progress: 2, error: undefined })
      const small = await imageCompression(file, {
        maxWidthOrHeight: 1600,
        maxSizeMB: 0.6,
        initialQuality: 0.82,
        useWebWorker: true,
        fileType: 'image/webp',
        onProgress: p => patch(item.key, { progress: Math.round(p * 0.6) }),
      })
      if (cancelled.current.has(item.key)) return
      if (demo) {
        patch(item.key, { status: 'done', progress: 100, url: URL.createObjectURL(small) })
        return
      }
      const supabase = createClient()
      const path = `${folderId}/${crypto.randomUUID()}.webp`
      patch(item.key, { progress: 70 })
      const { error } = await supabase.storage.from('property-images').upload(path, small, { contentType: 'image/webp', cacheControl: '31536000', upsert: false })
      if (error) throw error
      if (cancelled.current.has(item.key)) {
        await supabase.storage.from('property-images').remove([path])
        return
      }
      const { data } = supabase.storage.from('property-images').getPublicUrl(path)
      patch(item.key, { status: 'done', progress: 100, url: data.publicUrl, storage_path: path, file: undefined })
    } catch (e) {
      patch(item.key, { status: 'error', error: e instanceof Error ? e.message : 'Upload failed' })
    }
  }

  function addFiles(files: FileList | File[]) {
    const room = MAX_IMAGES - items.length
    const picked = Array.from(files)
    const bad = picked.filter(f => !TYPES.includes(f.type) || f.size > MAX_BYTES)
    const ok = picked.filter(f => TYPES.includes(f.type) && f.size <= MAX_BYTES).slice(0, Math.max(room, 0))
    const msgs: string[] = []
    if (bad.length) msgs.push(`${bad.length} skipped (JPG/PNG/WEBP up to 8 MB only)`)
    if (picked.length - bad.length > ok.length) msgs.push(`Limit is ${MAX_IMAGES} photos per property`)
    setNotice(msgs.join('. ') || null)
    const fresh: UploadItem[] = ok.map(f => ({ key: crypto.randomUUID(), url: URL.createObjectURL(f), storage_path: null, alt_text: '', is_cover: false, status: 'uploading', progress: 0, file: f }))
    onChange(prev => withCover([...prev, ...fresh]))
    // 3 at a time
    let i = 0
    const next = async (): Promise<void> => {
      const item = fresh[i++]
      if (!item) return
      await upload(item)
      return next()
    }
    void Promise.all([next(), next(), next()])
  }

  const remove = (key: string) => {
    cancelled.current.add(key)
    onChange(prev => withCover(prev.filter(i => i.key !== key)))
  }
  const setCover = (key: string) => onChange(prev => prev.map(i => ({ ...i, is_cover: i.key === key })))
  const onDragEnd = (e: DragEndEvent) => {
    if (!e.over || e.active.id === e.over.id) return
    onChange(prev => arrayMove(prev, prev.findIndex(i => i.key === e.active.id), prev.findIndex(i => i.key === e.over!.id)))
  }

  return (
    <div>
      {demo && <p className="mb-3 border border-amber-300 bg-amber-50 p-2 text-sm text-amber-900">Demo only: photos stay in this browser tab and are not saved.</p>}
      <div
        onDragOver={e => {
          e.preventDefault()
          setDrag(true)
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => {
          e.preventDefault()
          setDrag(false)
          if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files)
        }}
        className={cn('flex flex-col items-center justify-center gap-2 border-2 border-dashed p-6 text-center', drag ? 'border-gold-deep bg-gold/10' : 'border-ink/20 bg-bone')}
      >
        <ImagePlus className="h-8 w-8 text-gold-deep" aria-hidden />
        <p className="text-sm text-stone">Drag photos here, or</p>
        <button type="button" className="btn-dark" onClick={() => input.current?.click()} disabled={items.length >= MAX_IMAGES}>Choose photos</button>
        <p className="text-xs text-stone">{items.length}/{MAX_IMAGES} &middot; JPG, PNG, WEBP up to 8 MB &middot; compressed automatically</p>
        <input ref={input} type="file" accept={TYPES.join(',')} multiple hidden onChange={e => e.target.files && (addFiles(e.target.files), (e.target.value = ''))} />
      </div>
      {notice && <p className="mt-2 text-sm text-amber-800">{notice}</p>}

      <div className="mt-3 flex gap-2">
        <label className="sr-only" htmlFor="paste-url">Paste image URL</label>
        <input id="paste-url" value={pasteUrl} onChange={e => setPasteUrl(e.target.value.trim())} placeholder="Unsplash or Supabase photo URL" className="field" />
        <button
          type="button"
          className="btn-outline shrink-0"
          disabled={!isImageUrl(pasteUrl) || items.length >= MAX_IMAGES}
          onClick={() => {
            onChange(prev => withCover([...prev, { key: crypto.randomUUID(), url: pasteUrl, storage_path: null, alt_text: '', is_cover: false, status: 'done', progress: 100 }]))
            setPasteUrl('')
          }}
        >
          <Link2 className="h-4 w-4" aria-hidden /> Add
        </button>
      </div>

      {items.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={items.map(i => i.key)} strategy={rectSortingStrategy}>
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {items.map((it, idx) => (
                <Thumb key={it.key} item={it} index={idx} onCover={() => setCover(it.key)} onRemove={() => remove(it.key)} onRetry={() => upload(it)} onAlt={v => patch(it.key, { alt_text: v })} />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
      <p className="mt-2 text-xs text-stone">Drag the grip to reorder (on phones: press and hold). The starred photo is the cover.</p>
    </div>
  )
}

function Thumb({ item, index, onCover, onRemove, onRetry, onAlt }: { item: UploadItem; index: number; onCover: () => void; onRemove: () => void; onRetry: () => void; onAlt: (v: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.key })
  const [confirm, setConfirm] = useState(false)
  return (
    <li ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={cn('border bg-white', item.is_cover ? 'border-gold-deep' : 'border-ink/10', isDragging && 'z-10 shadow-xl')}>
      <div className="relative aspect-[4/3] bg-bone-200">
        <Image src={item.url} alt={item.alt_text || `Photo ${index + 1}`} fill sizes="200px" className="object-cover" unoptimized={item.url.startsWith('blob:')} />
        <button type="button" {...attributes} {...listeners} aria-label={`Reorder photo ${index + 1}`} className="absolute left-1 top-1 inline-flex h-9 w-9 cursor-grab touch-none items-center justify-center bg-white/90"><GripVertical className="h-4 w-4" /></button>
        {item.is_cover && <span className="absolute right-1 top-1 bg-gold px-2 py-0.5 text-xs font-semibold text-ink">Cover</span>}
        {item.status === 'uploading' && (
          <div className="absolute inset-x-0 bottom-0 bg-ink/70 p-1.5">
            <div className="h-1.5 bg-white/30"><div className="h-full bg-gold transition-all" style={{ width: `${item.progress}%` }} /></div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-white"><span>{item.progress}%</span><button type="button" onClick={onRemove} className="underline">Cancel</button></div>
          </div>
        )}
        {item.status === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-red-900/80 p-2 text-center text-xs text-white">
            <span>{item.error}</span>
            <button type="button" onClick={onRetry} className="inline-flex items-center gap-1 underline"><RotateCcw className="h-3 w-3" /> Retry</button>
          </div>
        )}
      </div>
      <div className="space-y-1.5 p-2">
        <input value={item.alt_text} onChange={e => onAlt(e.target.value)} placeholder="Alt text (e.g. living room)" aria-label={`Alt text for photo ${index + 1}`} className="field min-h-9 py-1 text-sm" maxLength={140} />
        <div className="flex gap-1">
          <button type="button" onClick={onCover} disabled={item.is_cover || item.status !== 'done'} className="inline-flex min-h-9 flex-1 items-center justify-center gap-1 border border-ink/15 text-xs disabled:opacity-50"><Star className="h-3.5 w-3.5" /> Cover</button>
          {confirm ? (
            <>
              <button type="button" onClick={onRemove} className="min-h-9 flex-1 bg-red-700 text-xs text-white">Delete</button>
              <button type="button" onClick={() => setConfirm(false)} aria-label="Keep photo" className="min-h-9 border border-ink/15 px-2"><X className="h-3.5 w-3.5" /></button>
            </>
          ) : (
            <button type="button" onClick={() => setConfirm(true)} aria-label={`Delete photo ${index + 1}`} className="inline-flex min-h-9 items-center justify-center border border-ink/15 px-3 text-red-700"><Trash2 className="h-3.5 w-3.5" /></button>
          )}
        </div>
      </div>
    </li>
  )
}
