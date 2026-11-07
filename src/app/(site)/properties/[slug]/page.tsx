import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Bath, Bed, Building, Calendar, Car, CheckCircle2, Layers, MapPin, Maximize2, MessageCircle, Phone, Users } from 'lucide-react'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { JsonLd } from '@/components/common/JsonLd'
import { PropertyGallery } from '@/components/property/PropertyGallery'
import { PropertyCard } from '@/components/property/PropertyCard'
import { FavouriteButton } from '@/components/property/FavouriteButton'
import { PrintButton, ShareButton } from '@/components/property/DetailActions'
import { EnquiryForm } from '@/components/forms/EnquiryForm'
import { getPropertyBySlug, getPublicSlugs, getSimilarProperties } from '@/lib/queries/properties'
import { formatArea, formatAvailability, formatPrice, titleCase } from '@/lib/utils/format'
import { propertyWhatsappUrl } from '@/lib/utils/whatsapp'
import { absoluteUrl, site } from '@/config/site'

export const revalidate = 300
export const dynamicParams = true

export async function generateStaticParams() {
  return (await getPublicSlugs()).map(s => ({ slug: s.slug }))
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getPropertyBySlug((await params).slug)
  if (!p) return { title: 'Property not found', robots: { index: false } }
  const title = `${p.title}, ${p.locality} (${formatPrice(p.price, p.price_unit)})`
  const description = `${p.purpose === 'rent' ? 'For rent' : 'For sale'}: ${p.description}`.slice(0, 158)
  const image = p.images[0]?.url ?? p.cover_image_url ?? '/og-image.jpg'
  return {
    title,
    description,
    alternates: { canonical: `/properties/${p.slug}` },
    openGraph: { title, description, url: `/properties/${p.slug}`, images: [{ url: image, width: 1200, height: 800, alt: p.title }] },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  }
}

export default async function PropertyPage({ params }: Props) {
  const p = await getPropertyBySlug((await params).slug)
  if (!p) notFound()
  const similar = await getSimilarProperties(p)
  const isRent = p.purpose === 'rent'
  const closed = p.status === 'sold' || p.status === 'rented'
  const url = absoluteUrl(`/properties/${p.slug}`)
  const availability = formatAvailability(p.available_from)

  const specs = [
    p.bhk_type && { icon: Bed, label: 'Layout', value: p.bhk_type },
    p.bathrooms && { icon: Bath, label: 'Bathrooms', value: String(p.bathrooms) },
    p.area_sqft && { icon: Maximize2, label: 'Area', value: formatArea(p.area_sqft, p.area_type) },
    p.floor !== null && p.total_floors && { icon: Layers, label: 'Floor', value: `${p.floor} of ${p.total_floors}` },
    p.furnishing && { icon: Building, label: 'Furnishing', value: titleCase(p.furnishing) },
    p.parking !== null && { icon: Car, label: 'Parking', value: p.parking ? `${p.parking} reserved` : 'Open / bike' },
    isRent && { icon: Users, label: 'Tenants', value: p.tenant_preference === 'any' ? 'Family or bachelor' : titleCase(p.tenant_preference) },
    availability && { icon: Calendar, label: isRent ? 'Move in' : 'Possession', value: availability },
  ].filter(Boolean) as { icon: typeof Bed; label: string; value: string }[]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': p.category === 'apartment' ? 'Apartment' : 'Place',
    name: p.title,
    description: p.description,
    url,
    image: p.images.map(i => i.url),
    address: { '@type': 'PostalAddress', addressLocality: p.locality, addressRegion: 'Maharashtra', addressCountry: 'IN' },
    ...(p.bedrooms ? { numberOfRooms: p.bedrooms } : {}),
    ...(p.area_sqft ? { floorSize: { '@type': 'QuantitativeValue', value: p.area_sqft, unitCode: 'FTK' } } : {}),
    offers: {
      '@type': 'Offer',
      businessFunction: isRent ? 'http://purl.org/goodrelations/v1#LeaseOut' : 'http://purl.org/goodrelations/v1#Sell',
      priceCurrency: 'INR',
      price: p.price_unit === 'lacs' ? p.price * 100000 : p.price_unit === 'crores' ? p.price * 10000000 : p.price,
      availability: closed ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
      seller: { '@type': 'RealEstateAgent', name: site.name, telephone: site.phone.tel },
    },
  }

  return (
    <div className="mx-auto max-w-7xl px-5 pb-28 md:px-8 md:pb-16 md:pt-8">
      <div className="hidden md:block">
        <Breadcrumbs items={[{ label: isRent ? 'Rent' : 'Buy', href: isRent ? '/rent' : '/buy' }, { label: p.title }]} />
      </div>

      {/* Phones: photos first (full-bleed), then title/price, details, visit form.
          Desktop: header across the top, gallery + details left, sticky visit form right. */}
      <div className="grid grid-cols-1 gap-x-10 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="-mx-5 min-w-0 md:mx-0 md:mt-8 lg:col-start-1 lg:row-start-2">
          <PropertyGallery images={p.images} title={p.title} />
        </div>

        <header className="mt-5 flex min-w-0 flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-4 lg:col-span-2 lg:row-start-1">
          <div className="min-w-0">
            <div className="flex flex-wrap gap-2 font-mono text-[11px] uppercase tracking-wide2 md:text-xs">
              <span className={isRent ? 'bg-gold px-2.5 py-1 text-ink' : 'bg-ink px-2.5 py-1 text-gold-light'}>{isRent ? 'For rent' : 'For sale'}</span>
              <span className="border border-ink/15 px-2.5 py-1 text-stone">Ref {p.reference_number}</span>
              {p.direct_owner && <span className="border border-ink/15 px-2.5 py-1 text-stone">Direct owner</span>}
              {closed && <span className="bg-red-700 px-2.5 py-1 text-white">{p.status === 'sold' ? 'Sold' : 'Rented'}</span>}
            </div>
            <h1 className="mt-3 font-display text-[26px] leading-tight text-ink md:text-[44px]">{p.title}</h1>
            <p className="mt-1.5 flex items-center gap-1.5 text-[15px] text-stone"><MapPin className="h-4 w-4 shrink-0 text-gold-deep" aria-hidden />{p.locality}, {p.city}</p>
          </div>
          <div className="flex items-end justify-between gap-3 border-y border-ink/10 py-3 md:block md:border-0 md:py-0 md:text-right">
            <div>
              <p className="whitespace-nowrap font-display text-[28px] leading-none text-ink md:text-4xl">{formatPrice(p.price, p.price_unit)}</p>
              {p.price_negotiable && <p className="mt-1 text-sm text-stone">Negotiable</p>}
            </div>
            <div className="flex shrink-0 gap-2 md:mt-3 md:justify-end no-print">
              <FavouriteButton id={p.id} withLabel />
              <ShareButton title={p.title} url={url} />
              <PrintButton />
            </div>
          </div>
        </header>

        <div className="mt-8 min-w-0 space-y-8 md:space-y-10 lg:col-start-1 lg:row-start-3">
          <section aria-labelledby="specs">
            <h2 id="specs" className="font-display text-xl text-ink md:text-2xl">Overview</h2>
            <dl className="mt-4 grid grid-cols-2 gap-px border border-ink/10 bg-ink/10 sm:grid-cols-4">
              {specs.map(s => (
                <div key={s.label} className="min-w-0 bg-white p-3 md:p-4">
                  <dt className="flex items-center gap-1.5 text-sm text-stone"><s.icon className="h-4 w-4 shrink-0 text-gold-deep" aria-hidden />{s.label}</dt>
                  <dd className="mt-1 font-semibold text-ink">{s.value}</dd>
                </div>
              ))}
            </dl>
          </section>
          {p.highlights.length > 0 && (
            <section aria-labelledby="hl">
              <h2 id="hl" className="font-display text-xl text-ink md:text-2xl">Highlights</h2>
              <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {p.highlights.map(h => <li key={h} className="flex gap-2 text-[15px] text-ink/85"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" aria-hidden />{h}</li>)}
              </ul>
            </section>
          )}
          {p.amenities.length > 0 && (
            <section aria-labelledby="am">
              <h2 id="am" className="font-display text-xl text-ink md:text-2xl">Amenities</h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {p.amenities.map(a => <li key={a} className="border border-ink/10 bg-white px-3 py-2 text-sm text-ink">{a}</li>)}
              </ul>
            </section>
          )}
          <section aria-labelledby="about">
            <h2 id="about" className="font-display text-xl text-ink md:text-2xl">About this home</h2>
            <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-ink/85">{p.description}</p>
            {p.full_address && <p className="mt-4 text-[15px] text-stone"><strong className="text-ink">Address:</strong> {p.full_address}</p>}
          </section>
        </div>

        <aside id="visit" className="no-print mt-10 min-w-0 scroll-mt-20 lg:sticky lg:top-24 lg:col-start-2 lg:row-span-2 lg:row-start-2 lg:mt-8 lg:self-start">
          <div className="-mx-5 border-y border-ink/10 bg-white p-5 md:mx-0 md:border md:p-6">
            <h2 className="font-display text-xl text-ink md:text-2xl">{closed ? 'Looking for something similar?' : 'Book a free visit'}</h2>
            <p className="mt-1 text-sm text-stone">Accompanied by our team. No charge for visits.</p>
            <div className="mt-5">
              <EnquiryForm mode="visit" property={{ id: p.id, title: p.title, reference_number: p.reference_number, slug: p.slug }} />
            </div>
          </div>
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="mt-12 no-print md:mt-16" aria-labelledby="similar">
          <h2 id="similar" className="font-display text-2xl text-ink md:text-3xl">Similar homes</h2>
          <div className="rail mt-5 md:mt-6 md:grid-cols-2 lg:grid-cols-3">
            {similar.map(s => <PropertyCard key={s.id} property={s} />)}
          </div>
        </section>
      )}

      {/* Mobile sticky Call + WhatsApp (the floating WhatsApp button is hidden on this page) */}
      <div data-floating className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-2 border-t border-ink/10 bg-white/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
        <div className="mr-auto min-w-0">
          <p className="truncate font-display text-lg leading-tight text-ink">{formatPrice(p.price, p.price_unit)}</p>
          <a href="#visit" className="text-xs font-semibold text-gold-deep underline">Book free visit</a>
        </div>
        <a href={`tel:${site.phone.tel}`} aria-label="Call Smart Home Reality" className="btn-dark h-12 w-12 shrink-0 px-0"><Phone className="h-5 w-5" aria-hidden /></a>
        <a href={propertyWhatsappUrl(p)} target="_blank" rel="noopener noreferrer" className="btn-whatsapp h-12 shrink-0 px-4"><MessageCircle className="h-5 w-5" aria-hidden /> WhatsApp</a>
      </div>
      <JsonLd data={jsonLd} />
    </div>
  )
}
