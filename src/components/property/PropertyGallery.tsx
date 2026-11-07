'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ListingImage as Image } from '@/components/property/ListingImage'
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react'
import type { PropertyImage } from '@/types/property'

type Img = Pick<PropertyImage, 'id' | 'url' | 'alt_text'>

/** Gallery with thumbnails, keyboard + swipe, and a full-screen lightbox. Images arrive deduped, cover first. */
export function PropertyGallery({ images, title }: { images: Img[]; title: string }) {
  const list = images.length ? images : [{ id: 'none', url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1400&q=70', alt_text: 'Placeholder photo' }]
  const [i, setI] = useState(0)
  const [zoom, setZoom] = useState(false)
  const touchX = useRef<number | null>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)

  const go = useCallback((d: number) => setI(v => (v + d + list.length) % list.length), [list.length])

  useEffect(() => {
    if (!zoom) return
    dialogRef.current?.showModal()
    closeRef.current?.focus()
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoom(false)
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [zoom, go])

  const swipe = {
    onTouchStart: (e: React.TouchEvent) => (touchX.current = e.touches[0].clientX),
    onTouchEnd: (e: React.TouchEvent) => {
      if (touchX.current === null) return
      const dx = e.changedTouches[0].clientX - touchX.current
      if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1)
      touchX.current = null
    },
  }
  const cur = list[i]

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden bg-bone-200 md:aspect-[16/10]" {...swipe}>
        <Image src={cur.url} alt={cur.alt_text || title} fill priority sizes="(max-width: 1024px) 100vw, 66vw" className="object-cover" />
        <button type="button" onClick={() => setZoom(true)} className="absolute bottom-3 right-3 inline-flex min-h-11 items-center gap-2 bg-ink/75 px-3 text-sm text-white backdrop-blur md:bottom-auto md:top-3">
          <Expand className="h-4 w-4" aria-hidden /> {list.length > 1 ? `All ${list.length} photos` : 'View photo'}
        </button>
        {list.length > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label="Previous photo" className="absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/90 p-3 text-ink sm:block"><ChevronLeft className="h-5 w-5" /></button>
            <button type="button" onClick={() => go(1)} aria-label="Next photo" className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/90 p-3 text-ink sm:block"><ChevronRight className="h-5 w-5" /></button>
            <span className="absolute bottom-3 left-3 hidden bg-ink/70 px-2.5 py-1 font-mono text-xs text-white sm:block">{i + 1} / {list.length}</span>
            {/* Phones: swipe + dots, no arrows over the photo */}
            <div className="absolute inset-x-0 bottom-[1.35rem] flex justify-center gap-1.5 sm:hidden" aria-hidden>
              {list.slice(0, 8).map((img, idx) => (
                <span key={img.id} className={`h-1.5 rounded-full transition-all ${idx === i ? 'w-4 bg-white' : 'w-1.5 bg-white/55'}`} />
              ))}
            </div>
          </>
        )}
      </div>
      {list.length > 1 && (
        <ul className="mt-3 hidden gap-2 overflow-x-auto pb-1 no-print sm:flex">
          {list.map((img, idx) => (
            <li key={img.id}>
              <button type="button" onClick={() => setI(idx)} aria-label={`Show photo ${idx + 1}`} aria-current={idx === i} className={`relative block h-16 w-24 overflow-hidden border-2 ${idx === i ? 'border-gold' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                <Image src={img.url} alt="" fill sizes="96px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {zoom && (
        <dialog ref={dialogRef} onCancel={e => { e.preventDefault(); setZoom(false) }} aria-label={`${title} photos`} className="fixed inset-0 m-0 flex h-dvh max-h-none w-full max-w-none flex-col border-0 bg-ink/95 p-0" {...swipe}>
          <div className="flex items-center justify-between p-3 text-white">
            <span className="font-mono text-sm">{i + 1} / {list.length}</span>
            <button ref={closeRef} type="button" onClick={() => setZoom(false)} aria-label="Close photos" className="inline-flex h-11 w-11 items-center justify-center"><X className="h-6 w-6" /></button>
          </div>
          <div className="relative flex-1">
            <Image src={cur.url} alt={cur.alt_text || title} fill sizes="100vw" className="object-contain" />
          </div>
          {list.length > 1 && (
            <div className="flex justify-center gap-4 p-4">
              <button type="button" onClick={() => go(-1)} className="btn-outline-light" aria-label="Previous photo"><ChevronLeft className="h-5 w-5" /></button>
              <button type="button" onClick={() => go(1)} className="btn-outline-light" aria-label="Next photo"><ChevronRight className="h-5 w-5" /></button>
            </div>
          )}
        </dialog>
      )}
    </div>
  )
}
