'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { SlidersHorizontal, X } from 'lucide-react'
import { site } from '@/config/site'
import { cn } from '@/lib/utils/cn'
import type { PropertyPurpose } from '@/types/property'

const BHK = ['1RK', '1BHK', '2BHK', '3BHK']
const FURNISH = [
  { v: 'furnished', l: 'Furnished' },
  { v: 'semi-furnished', l: 'Semi-furnished' },
  { v: 'unfurnished', l: 'Unfurnished' },
]
const RENT_BUDGETS = [8000, 12000, 16000, 20000, 30000, 50000]
const BUY_BUDGETS = [25, 35, 45, 60, 80, 150] // lacs

function Chip({ on, onClick, children, small }: { on: boolean; onClick: () => void; children: React.ReactNode; small?: boolean }) {
  return (
    <button type="button" aria-pressed={on} onClick={onClick} className={cn('min-h-11 shrink-0 whitespace-nowrap border px-3 text-sm', small && 'min-h-9 rounded-full px-3.5', on ? 'border-ink bg-ink text-bone' : 'border-ink/15 bg-white text-ink hover:border-gold-deep')}>
      {children}
    </button>
  )
}

/**
 * All filters live in the URL (shareable). Phones: a sticky bar with quick BHK chips + a full-screen
 * filter sheet with a "Show N homes" button. Desktop: a sidebar.
 */
export function ListingFilters({ purpose, total }: { purpose: PropertyPurpose; total: number }) {
  const router = useRouter()
  const pathname = usePathname()
  const sp = useSearchParams()
  const [open, setOpen] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [pending, start] = useTransition()

  useEffect(() => {
    if (!open) return
    dialogRef.current?.showModal()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const getList = (k: string) => (sp.get(k) ?? '').split(',').filter(Boolean)
  const update = (mut: (q: URLSearchParams) => void) => {
    const q = new URLSearchParams(sp.toString())
    mut(q)
    q.delete('page')
    start(() => router.replace(`${pathname}${q.size ? `?${q}` : ''}`, { scroll: false }))
  }
  const toggle = (k: string, v: string) =>
    update(q => {
      const cur = getList(k)
      const next = cur.includes(v) ? cur.filter(x => x !== v) : [...cur, v]
      if (next.length) q.set(k, next.join(','))
      else q.delete(k)
    })
  const setOne = (k: string, v: string | null) => update(q => (v ? q.set(k, v) : q.delete(k)))
  const budgets = purpose === 'rent' ? RENT_BUDGETS : BUY_BUDGETS
  const fmt = (n: number) => (purpose === 'rent' ? `₹${n.toLocaleString('en-IN')}` : `₹${n} L`)
  const activeCount = [...sp.keys()].filter(k => !['sort', 'page'].includes(k)).length
  const sort = sp.get('sort') ?? 'newest'

  const panel = (
    <div className="space-y-6">
      <fieldset>
        <legend className="field-label">Type</legend>
        <div className="flex flex-wrap gap-2">
          {BHK.map(b => <Chip key={b} on={getList('bhk').includes(b)} onClick={() => toggle('bhk', b)}>{b.replace('BHK', ' BHK').replace('RK', ' RK')}</Chip>)}
          <Chip on={sp.get('type') === 'commercial'} onClick={() => setOne('type', sp.get('type') === 'commercial' ? null : 'commercial')}>Shop / office</Chip>
          {purpose === 'buy' && <Chip on={sp.get('type') === 'plot'} onClick={() => setOne('type', sp.get('type') === 'plot' ? null : 'plot')}>Plot</Chip>}
        </div>
      </fieldset>
      <fieldset>
        <legend className="field-label">Budget {purpose === 'rent' ? '(per month)' : '(lacs)'}</legend>
        <div className="grid grid-cols-2 gap-2">
          <select aria-label="Minimum budget" className="field" value={sp.get('min') ?? ''} onChange={e => setOne('min', e.target.value || null)}>
            <option value="">No min</option>
            {budgets.map(b => <option key={b} value={b}>{fmt(b)}</option>)}
          </select>
          <select aria-label="Maximum budget" className="field" value={sp.get('max') ?? ''} onChange={e => setOne('max', e.target.value || null)}>
            <option value="">No max</option>
            {budgets.map(b => <option key={b} value={b}>{fmt(b)}</option>)}
          </select>
        </div>
      </fieldset>
      <fieldset>
        <legend className="field-label">Locality</legend>
        <div className="flex flex-wrap gap-2">
          {site.localities.map(l => <Chip key={l} on={getList('loc').includes(l)} onClick={() => toggle('loc', l)}>{l}</Chip>)}
        </div>
      </fieldset>
      {purpose === 'rent' && (
        <>
          <fieldset>
            <legend className="field-label">Furnishing</legend>
            <div className="flex flex-wrap gap-2">
              {FURNISH.map(f => <Chip key={f.v} on={getList('furnish').includes(f.v)} onClick={() => toggle('furnish', f.v)}>{f.l}</Chip>)}
            </div>
          </fieldset>
          <fieldset>
            <legend className="field-label">Tenants</legend>
            <div className="flex flex-wrap gap-2">
              <Chip on={sp.get('tenant') === 'family'} onClick={() => setOne('tenant', sp.get('tenant') === 'family' ? null : 'family')}>Family only</Chip>
              <Chip on={sp.get('tenant') === 'bachelor'} onClick={() => setOne('tenant', sp.get('tenant') === 'bachelor' ? null : 'bachelor')}>Bachelor friendly</Chip>
            </div>
          </fieldset>
        </>
      )}
      <label className="flex min-h-11 items-center gap-3 text-[15px]">
        <input type="checkbox" className="h-5 w-5 accent-[#7a5a12]" checked={sp.get('owner') === '1'} onChange={e => setOne('owner', e.target.checked ? '1' : null)} />
        Direct owner listings
      </label>
    </div>
  )

  const sortSelect = (
    <label className="block min-w-0">
      <span className="sr-only">Sort</span>
      <select className="field" value={sort} onChange={e => setOne('sort', e.target.value === 'newest' ? null : e.target.value)}>
        <option value="newest">Newest</option>
        <option value="price_asc">Price: low to high</option>
        <option value="price_desc">Price: high to low</option>
      </select>
    </label>
  )

  return (
    <aside aria-label="Filters" className={cn('sticky top-16 z-30 min-w-0 self-start md:top-[72px] lg:static lg:z-auto', pending && 'opacity-70')}>
      {/* Phone: sticky bar under the header */}
      <div className="-mx-4 border-b border-ink/10 bg-bone/95 px-4 py-2 backdrop-blur sm:-mx-5 sm:px-5 lg:hidden">
        <div className="flex gap-2">
          <button type="button" onClick={() => setOpen(true)} className="btn-dark shrink-0 px-4" aria-haspopup="dialog">
            <SlidersHorizontal className="h-4 w-4" aria-hidden /> Filters{activeCount > 0 && ` (${activeCount})`}
          </button>
          <div className="min-w-0 flex-1">{sortSelect}</div>
        </div>
        <div className="no-scrollbar -mx-4 mt-2 flex gap-2 overflow-x-auto px-4 pb-1 sm:-mx-5 sm:px-5">
          {BHK.map(b => <Chip small key={b} on={getList('bhk').includes(b)} onClick={() => toggle('bhk', b)}>{b.replace('BHK', ' BHK').replace('RK', ' RK')}</Chip>)}
          {purpose === 'rent' && <Chip small on={getList('furnish').includes('furnished')} onClick={() => toggle('furnish', 'furnished')}>Furnished</Chip>}
          {purpose === 'rent' && <Chip small on={sp.get('tenant') === 'bachelor'} onClick={() => setOne('tenant', sp.get('tenant') === 'bachelor' ? null : 'bachelor')}>Bachelor</Chip>}
          {purpose === 'rent' && <Chip small on={sp.get('tenant') === 'family'} onClick={() => setOne('tenant', sp.get('tenant') === 'family' ? null : 'family')}>Family</Chip>}
          <Chip small on={sp.get('owner') === '1'} onClick={() => setOne('owner', sp.get('owner') === '1' ? null : '1')}>Owner</Chip>
        </div>
      </div>

      {/* Phone: full-screen sheet */}
      {open && (
        <dialog ref={dialogRef} onCancel={e => { e.preventDefault(); setOpen(false) }} aria-label="Filters" className="fixed inset-0 m-0 flex h-dvh max-h-none w-full max-w-none flex-col border-0 bg-bone p-0 text-ink lg:hidden">
          <div className="flex h-14 items-center justify-between border-b border-ink/10 px-4">
            <h2 className="font-display text-xl">Filters</h2>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close filters" className="inline-flex h-11 w-11 items-center justify-center"><X className="h-6 w-6" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">{panel}</div>
          <div className="grid grid-cols-[auto_1fr] gap-2 border-t border-ink/10 bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <button type="button" className="btn-outline" onClick={() => start(() => router.replace(pathname, { scroll: false }))} disabled={!activeCount}>Clear</button>
            <button type="button" className="btn-gold" onClick={() => setOpen(false)}>{pending ? 'Updating...' : `Show ${total} ${total === 1 ? 'home' : 'homes'}`}</button>
          </div>
        </dialog>
      )}

      {/* Desktop sidebar */}
      <div className="hidden space-y-6 border border-ink/10 bg-white p-5 lg:block">
        {sortSelect}
        {panel}
        {activeCount > 0 && (
          <button type="button" onClick={() => start(() => router.replace(pathname, { scroll: false }))} className="btn-outline w-full">
            <X className="h-4 w-4" aria-hidden /> Clear all
          </button>
        )}
      </div>
    </aside>
  )
}
