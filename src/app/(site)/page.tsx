import type { Metadata } from 'next'
import { Hero, Stats, Categories, WhyUs, OwnerBanner, Testimonials, Faq, VisitBanner } from '@/components/home/Sections'
import { HeroSearch } from '@/components/home/HeroSearch'
import { SectionHeader } from '@/components/common/SectionHeader'
import { PropertyCard } from '@/components/property/PropertyCard'
import { getHomepageListings } from '@/lib/queries/properties'
import { site } from '@/config/site'

export const revalidate = 300

export const metadata: Metadata = {
  title: { absolute: `${site.name}: Verified Flats for Rent & Sale in Virar, Vasai & Nallasopara` },
  description: 'Browse verified 1, 2 and 3 BHK rentals, ready-possession flats, shops and plots in Virar and Vasai. Free accompanied visits and doorstep paperwork.',
  alternates: { canonical: '/' },
}

export default async function HomePage() {
  const { rentals, sales } = await getHomepageListings(3) // never the same listing twice
  return (
    <>
      <Hero>
        <HeroSearch />
      </Hero>
      <Stats />
      <Categories />
      {rentals.length > 0 && (
        <section className="section bg-bone-100">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <SectionHeader eyebrow="Available now" title="Homes on rent." link={{ href: '/rent', label: 'All rentals' }} />
            <div className="rail mt-6 md:mt-10 md:grid-cols-2 lg:grid-cols-3">
              {rentals.map((p, i) => <PropertyCard key={p.id} property={p} priority={i === 0} />)}
            </div>
          </div>
        </section>
      )}
      {sales.length > 0 && (
        <section className="section bg-bone">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <SectionHeader eyebrow="Ready possession" title="Buy with the papers in place." link={{ href: '/buy', label: 'All homes for sale' }} />
            <div className="rail mt-6 md:mt-10 md:grid-cols-2 lg:grid-cols-3">
              {sales.map(p => <PropertyCard key={p.id} property={p} />)}
            </div>
          </div>
        </section>
      )}
      <WhyUs />
      <OwnerBanner />
      <Testimonials />
      <Faq />
      <VisitBanner />
    </>
  )
}
