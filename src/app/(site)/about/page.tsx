import type { Metadata } from 'next'
import Link from 'next/link'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { site } from '@/config/site'

export const metadata: Metadata = {
  title: 'About Us: Property Consultants in Virar West',
  description: `${site.name} is a family-run property consultancy in Virar West helping tenants, buyers and owners across Virar, Vasai and Nallasopara.`,
  alternates: { canonical: '/about' },
}

/** The company story lives ONLY here (V1 copy-pasted it into the footer and homepage too). */
export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-10 md:py-14">
      <Breadcrumbs items={[{ label: 'About' }]} />
      <h1 className="mt-4 font-display text-3xl text-ink sm:text-5xl">A consultancy built on <span className="italic text-gold-deep">trust and family.</span></h1>
      <div className="mt-8 space-y-5 text-lg leading-relaxed text-ink/85">
        <p>{site.name} was started to make renting and buying a home in the Vasai&ndash;Virar corridor straightforward. Every flat we list has been visited by our team, and every document is explained before you pay a rupee.</p>
        <p>Families moving from Mumbai for larger homes, couples looking for a first rental near the station, owners who want a reliable tenant: we work for both sides of the deal, which means we cannot afford to hide anything from either.</p>
      </div>
      <h2 className="mt-12 font-display text-3xl text-ink">The team</h2>
      <ul className="mt-6 grid gap-4 sm:grid-cols-3">
        {site.team.map(m => (
          <li key={m.phone} className="border border-ink/10 bg-white p-5">
            <p className="font-display text-xl text-ink">{m.name}</p>
            <p className="text-sm text-stone">{m.role}</p>
          </li>
        ))}
      </ul>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/rent" className="btn-dark">Browse rentals</Link>
        <Link href="/contact" className="btn-outline">Contact the team</Link>
      </div>
    </div>
  )
}
