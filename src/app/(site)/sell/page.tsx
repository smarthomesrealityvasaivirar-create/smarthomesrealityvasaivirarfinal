import type { Metadata } from 'next'
import { ShieldCheck, Clock, Users } from 'lucide-react'
import { SellForm } from '@/components/forms/SellForm'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'

export const metadata: Metadata = {
  title: 'List Your Flat or Shop for Rent or Sale',
  description: 'Owners in Virar and Vasai: share your flat, shop or plot details. We visit, verify and find screened tenants or buyers. Nothing is published without your approval.',
  alternates: { canonical: '/sell' },
}

export default function SellPage() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
      <Breadcrumbs items={[{ label: 'List your property' }]} />
      <h1 className="mt-4 max-w-3xl font-display text-3xl text-ink sm:text-5xl">Rent out or sell your property with us</h1>
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_340px]">
        <div className="border border-ink/10 bg-white p-6 md:p-8"><SellForm /></div>
        <ul className="space-y-6 bg-ink p-7 text-bone">
          {[
            { icon: ShieldCheck, t: 'Screened tenants', b: 'ID, employment and references checked before any token.' },
            { icon: Users, t: 'We show the flat', b: 'Our team handles visits so you do not have to.' },
            { icon: Clock, t: 'You stay in control', b: 'Nothing goes live until we have visited and you approve the listing.' },
          ].map(x => (
            <li key={x.t} className="flex gap-3">
              <x.icon className="mt-1 h-5 w-5 shrink-0 text-gold" aria-hidden />
              <div><p className="font-display text-lg">{x.t}</p><p className="text-[15px] text-bone/70">{x.b}</p></div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
