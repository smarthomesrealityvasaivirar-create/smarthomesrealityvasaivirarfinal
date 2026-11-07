import Link from 'next/link'
import { adminDashboard } from '@/lib/queries/admin'
import { formatDateTime, titleCase } from '@/lib/utils/format'

export default async function Dashboard() {
  const s = await adminDashboard()
  const tiles = [
    { label: 'Published', value: s.published, href: '/admin/properties?status=published' },
    { label: 'Rented', value: s.rented, href: '/admin/properties?status=rented' },
    { label: 'Sold', value: s.sold, href: '/admin/properties?status=sold' },
    { label: 'Drafts', value: s.drafts, href: '/admin/properties?status=draft' },
    { label: 'Enquiries today', value: s.enquiriesToday, href: '/admin/enquiries' },
    { label: 'New enquiries', value: s.newEnquiries, href: '/admin/enquiries?status=new' },
    { label: 'New owner requests', value: s.newSellRequests, href: '/admin/sell-requests?status=new' },
  ]
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl text-ink">Dashboard</h1>
        <Link href="/admin/properties/new" className="btn-dark">Add property</Link>
      </div>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {tiles.map(t => (
          <li key={t.label}>
            <Link href={t.href} className="block border border-ink/10 bg-white p-4 hover:border-gold-deep">
              <p className="font-display text-3xl text-ink">{t.value}</p>
              <p className="mt-1 text-sm text-stone">{t.label}</p>
            </Link>
          </li>
        ))}
      </ul>
      <section className="border border-ink/10 bg-white">
        <h2 className="border-b border-ink/10 p-4 font-display text-xl">Latest enquiries</h2>
        {s.latest.length ? (
          <ul className="divide-y divide-ink/10">
            {s.latest.map(e => (
              <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 p-4 text-sm">
                <span><strong>{e.name}</strong> &middot; {e.phone}{e.property_title && <span className="block text-stone">{e.property_title}</span>}</span>
                <span className="text-stone">{titleCase(e.status)} &middot; {formatDateTime(e.created_at)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-6 text-stone">No enquiries yet.</p>
        )}
      </section>
    </div>
  )
}
