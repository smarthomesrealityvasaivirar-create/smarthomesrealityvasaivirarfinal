import Image from 'next/image'
import Link from 'next/link'
import { adminListProperties, ADMIN_PAGE_SIZE, type AdminPropertyQuery } from '@/lib/queries/admin'
import { formatPrice } from '@/lib/utils/format'
import { PropertyRowActions } from '@/components/admin/PropertyRowActions'
import type { PropertyPurpose, PropertyStatus } from '@/types/property'

const STATUSES: PropertyStatus[] = ['draft', 'published', 'rented', 'sold', 'archived']

export default async function AdminProperties({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams
  const query: AdminPropertyQuery = {
    q: sp.q,
    status: STATUSES.includes(sp.status as PropertyStatus) ? (sp.status as PropertyStatus) : undefined,
    purpose: sp.purpose === 'rent' || sp.purpose === 'buy' ? (sp.purpose as PropertyPurpose) : undefined,
    locality: sp.locality,
    sort: (['updated', 'price_asc', 'price_desc', 'title'] as const).find(s => s === sp.sort),
    page: Number(sp.page) || 1,
  }
  const { rows, total } = await adminListProperties(query)
  const pages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE))
  const pageHref = (n: number) => `/admin/properties?${new URLSearchParams({ ...Object.fromEntries(Object.entries(sp).filter(([, v]) => v)) as Record<string, string>, page: String(n) })}`

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl">Properties <span className="text-lg text-stone">({total})</span></h1>
        <Link href="/admin/properties/new" className="btn-dark">Add property</Link>
      </div>
      {/* Plain GET form: filters are in the URL, work without JS, and survive refresh */}
      <form className="grid gap-2 border border-ink/10 bg-white p-4 sm:grid-cols-2 lg:grid-cols-6">
        <input name="q" defaultValue={sp.q} placeholder="Search title, ref, locality" className="field lg:col-span-2" aria-label="Search" />
        <select name="status" defaultValue={sp.status ?? ''} className="field" aria-label="Status">
          <option value="">All statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select name="purpose" defaultValue={sp.purpose ?? ''} className="field" aria-label="Purpose">
          <option value="">Rent + sale</option>
          <option value="rent">Rent</option>
          <option value="buy">Sale</option>
        </select>
        <select name="sort" defaultValue={sp.sort ?? 'updated'} className="field" aria-label="Sort">
          <option value="updated">Recently updated</option>
          <option value="price_asc">Price low-high</option>
          <option value="price_desc">Price high-low</option>
          <option value="title">Title A-Z</option>
        </select>
        <button type="submit" className="btn-outline">Apply</button>
      </form>

      {rows.length === 0 ? (
        <p className="border border-dashed border-ink/20 bg-white p-10 text-center text-stone">No properties match. <Link href="/admin/properties" className="underline">Clear filters</Link></p>
      ) : (
        <ul className="divide-y divide-ink/10 border border-ink/10 bg-white">
          {rows.map(r => (
            <li key={r.id} className="flex flex-col gap-3 p-4 md:flex-row md:items-center">
              <div className="flex flex-1 items-center gap-3">
                <div className="relative h-14 w-20 shrink-0 overflow-hidden bg-bone-200">
                  {r.cover_image_url && <Image src={r.cover_image_url} alt="" fill sizes="80px" className="object-cover" />}
                </div>
                <div className="min-w-0">
                  <Link href={`/admin/properties/${r.id}/edit`} className="line-clamp-1 font-semibold text-ink hover:text-gold-deep">{r.title}</Link>
                  <p className="text-sm text-stone">{r.reference_number} &middot; {r.locality} &middot; {formatPrice(r.price, r.price_unit)}</p>
                </div>
              </div>
              <PropertyRowActions id={r.id} slug={r.slug} status={r.status} purpose={r.purpose} title={r.title} />
            </li>
          ))}
        </ul>
      )}
      {pages > 1 && (
        <nav className="flex flex-wrap gap-2" aria-label="Pages">
          {Array.from({ length: pages }, (_, i) => i + 1).map(n => <Link key={n} href={pageHref(n)} className={n === query.page ? 'btn-dark px-4' : 'btn-outline px-4'}>{n}</Link>)}
        </nav>
      )}
    </div>
  )
}
