'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { site } from '@/config/site'

/** The only search on the homepage. Values match the /rent and /buy URL filters exactly. */
export function HeroSearch() {
  const router = useRouter()
  const [purpose, setPurpose] = useState<'rent' | 'buy'>('rent')
  return (
    <form
      className="mt-10 w-full max-w-3xl bg-bone p-2 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)]"
      onSubmit={e => {
        e.preventDefault()
        const f = new FormData(e.currentTarget)
        const q = new URLSearchParams()
        const bhk = String(f.get('bhk') ?? '')
        const loc = String(f.get('loc') ?? '')
        if (bhk === 'commercial') q.set('type', 'commercial')
        else if (bhk === 'plot') q.set('type', 'plot')
        else if (bhk) q.set('bhk', bhk)
        if (loc) q.set('loc', loc)
        router.push(`/${purpose}${q.size ? `?${q}` : ''}`)
      }}
    >
      <div className="flex flex-col gap-2 md:flex-row">
        <div className="flex border border-ink/10 p-1" role="group" aria-label="Rent or buy">
          {(['rent', 'buy'] as const).map(p => (
            <button key={p} type="button" aria-pressed={purpose === p} onClick={() => setPurpose(p)} className={`min-h-11 flex-1 px-6 font-mono text-xs uppercase tracking-wide2 ${purpose === p ? 'bg-ink text-bone' : 'text-stone hover:text-ink'}`}>
              {p === 'rent' ? 'Rent' : 'Buy'}
            </button>
          ))}
        </div>
        <label className="flex flex-1 flex-col border border-ink/10 px-3 py-1.5">
          <span className="text-xs text-stone">Configuration</span>
          <select name="bhk" className="min-h-8 bg-transparent text-[15px] text-ink focus:outline-none" defaultValue="">
            <option value="">Any</option>
            <option value="1BHK">1 BHK</option>
            <option value="2BHK">2 BHK</option>
            <option value="3BHK">3 BHK</option>
            <option value="commercial">Shop / office</option>
            {purpose === 'buy' && <option value="plot">Plot</option>}
          </select>
        </label>
        <label className="flex flex-1 flex-col border border-ink/10 px-3 py-1.5">
          <span className="text-xs text-stone">Locality</span>
          <select name="loc" className="min-h-8 bg-transparent text-[15px] text-ink focus:outline-none" defaultValue="">
            <option value="">Anywhere in Virar &amp; Vasai</option>
            {site.localities.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </label>
        <button type="submit" className="btn-gold">
          <Search className="h-4 w-4" aria-hidden /> Search
        </button>
      </div>
    </form>
  )
}
