import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { PropertyCard } from '@/components/property/PropertyCard'
import { ListingFilters } from '@/components/listing/ListingFilters'
import { getListings, PAGE_SIZE } from '@/lib/queries/properties'
import { parseListingParams, type ListingSearchParams } from '@/lib/listing-params'
import { generalWhatsappUrl } from '@/lib/utils/whatsapp'
import type { PropertyPurpose } from '@/types/property'

/** Shared by /rent and /buy (V1 had two 95%-identical files). */
export async function ListingPage({ purpose, searchParams }: { purpose: PropertyPurpose; searchParams: ListingSearchParams }) {
  const { filters, sort, page } = parseListingParams(purpose, searchParams)
  const { properties, total } = await getListings(filters, sort, page)
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const label = purpose === 'rent' ? 'for rent' : 'for sale'
  const pageHref = (n: number) => {
    const q = new URLSearchParams()
    for (const [k, v] of Object.entries(searchParams)) if (typeof v === 'string' && k !== 'page') q.set(k, v)
    if (n > 1) q.set('page', String(n))
    return `/${purpose}${q.size ? `?${q}` : ''}`
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-5 md:px-8 md:py-14">
      <Breadcrumbs items={[{ label: purpose === 'rent' ? 'Rent' : 'Buy' }]} />
      <h1 className="mt-3 font-display text-[26px] leading-tight text-ink sm:text-4xl md:mt-4 md:text-5xl">Homes {label} in Virar &amp; Vasai</h1>
      <p className="mt-1 text-sm text-stone md:mt-2 md:text-base" aria-live="polite">{total} {total === 1 ? 'home' : 'homes'} match</p>

      <div className="mt-4 grid grid-cols-1 gap-4 md:mt-8 lg:grid-cols-[280px_1fr] lg:gap-8">
        <ListingFilters purpose={purpose} total={total} />
        <div className="min-w-0">
          {properties.length ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-6 xl:grid-cols-3">
              {properties.map((p, i) => <PropertyCard key={p.id} property={p} priority={i < 2} />)}
            </div>
          ) : (
            <div className="border border-dashed border-ink/20 bg-white px-6 py-16 text-center">
              <h2 className="font-display text-2xl text-ink">Nothing matches these filters yet</h2>
              <p className="mx-auto mt-2 max-w-md text-stone">New homes come in every week. Tell us what you need and we will call you first.</p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <Link href={`/${purpose}`} className="btn-outline">Clear filters</Link>
                <a href={generalWhatsappUrl()} target="_blank" rel="noopener noreferrer" className="btn-whatsapp"><MessageCircle className="h-4 w-4" aria-hidden /> WhatsApp my requirement</a>
              </div>
            </div>
          )}
          {pages > 1 && (
            <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Pages">
              {Array.from({ length: pages }, (_, k) => k + 1).map(n => (
                <Link key={n} href={pageHref(n)} aria-current={n === page ? 'page' : undefined} className={n === page ? 'btn-dark px-4' : 'btn-outline px-4'}>{n}</Link>
              ))}
            </nav>
          )}
        </div>
      </div>
    </div>
  )
}
