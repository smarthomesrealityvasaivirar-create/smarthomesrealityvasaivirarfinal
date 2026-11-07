import { DoorEntrance } from '@/components/entrance/DoorEntrance'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { WhatsAppFAB } from '@/components/layout/WhatsAppFAB'
import { BottomNav } from '@/components/layout/BottomNav'
import { JsonLd } from '@/components/common/JsonLd'
import { site, fullAddress } from '@/config/site'
import { MotionEnhancer } from '@/components/common/MotionEnhancer'
import { isSupabaseConfigured } from '@/lib/env'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const business = {
    '@context': 'https://schema.org',
    '@type': ['RealEstateAgent', 'LocalBusiness'],
    name: site.name,
    url: site.url,
    image: `${site.url}/og-image.jpg`,
    logo: `${site.url}/brand/logo-clean.png`,
    telephone: site.phone.tel,
    email: site.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${site.address.line1}, ${site.address.line2}`,
      addressLocality: site.address.locality,
      addressRegion: site.address.region,
      postalCode: site.address.postalCode,
      addressCountry: site.address.country,
    },
    geo: { '@type': 'GeoCoordinates', latitude: site.address.geo.lat, longitude: site.address.geo.lng },
    areaServed: ['Virar West', 'Virar East', 'Vasai West', 'Vasai East', 'Nallasopara'],
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: site.hours.opens,
      closes: site.hours.closes,
    },
    hasMap: site.mapsUrl,
    description: `${site.description} Office: ${fullAddress}.`,
  }
  return (
    <>
      <DoorEntrance />
      <MotionEnhancer />
      <noscript><style>{'.door-stage { display: none !important; }'}</style></noscript>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-gold focus:px-4 focus:py-2 focus:text-ink">
        Skip to content
      </a>
      <Navbar />
      <main id="main" className="flex-1">
        {!isSupabaseConfigured() && <p className="border-b border-gold/30 bg-gold/10 px-5 py-2 text-center text-sm">Demo preview: sample homes and images. Form submissions are not saved.</p>}
        {children}
      </main>
      <Footer />
      <WhatsAppFAB />
      <BottomNav />
      <JsonLd data={business} />
    </>
  )
}
