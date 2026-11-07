import { ListingImage as Image } from '@/components/property/ListingImage'
import Link from 'next/link'
import { Bath, Bed, Camera, MapPin, Maximize2, MessageCircle } from 'lucide-react'
import { formatPriceShort, titleCase } from '@/lib/utils/format'
import { propertyWhatsappUrl } from '@/lib/utils/whatsapp'
import { FavouriteButton } from '@/components/property/FavouriteButton'
import type { PropertyCard as Card } from '@/types/property'

const PLACEHOLDER = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=900&q=70'

/**
 * Server component. Uses a CONTAINER query, not the screen width: in the 2-column phone grid
 * (the "shopping" layout the client asked for) the card is ~170px and shows a compact product tile;
 * in swipe rails and on desktop (>= 15rem wide) it shows the full card.
 */
export function PropertyCard({ property: p, priority = false }: { property: Card; priority?: boolean }) {
  const href = `/properties/${p.slug}`
  const price = formatPriceShort(p.price, p.price_unit)
  const closed = p.status === 'sold' || p.status === 'rented'

  return (
    <article className="@container group relative flex h-full flex-col overflow-hidden border border-ink/10 bg-white transition-shadow duration-300 hover:shadow-[0_18px_40px_-20px_rgba(8,8,8,0.35)]">
      <Link href={href} className="relative block aspect-[4/5] overflow-hidden bg-bone-200 @[15rem]:aspect-[4/3]" aria-label={p.title}>
        <Image
          src={p.cover_image_url || PLACEHOLDER}
          alt=""
          fill
          priority={priority}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-luxe group-hover:scale-[1.06]"
        />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-2 @[15rem]:p-3">
          <span className={`px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide2 @[15rem]:px-2.5 @[15rem]:py-1 @[15rem]:text-[11px] ${p.purpose === 'rent' ? 'bg-gold text-ink' : 'bg-ink text-gold-light'}`}>
            {p.purpose === 'rent' ? 'Rent' : 'Sale'}
          </span>
        </div>
        {p.image_count > 1 && (
          <span className="absolute bottom-2 right-2 flex items-center gap-1 bg-ink/70 px-1.5 py-0.5 font-mono text-[11px] text-white @[15rem]:bottom-auto @[15rem]:right-3 @[15rem]:top-3">
            <Camera className="h-3.5 w-3.5" aria-hidden /> {p.image_count}
            <span className="sr-only">photos</span>
          </span>
        )}
        {closed && (
          <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 bg-red-700/90 py-1.5 text-center font-mono text-xs font-semibold uppercase tracking-wide3 text-white">
            {p.status === 'sold' ? 'Sold' : 'Rented'}
          </span>
        )}
        <div className="absolute inset-x-0 bottom-0 hidden bg-gradient-to-t from-ink/90 to-transparent px-4 pb-3 pt-10 @[15rem]:block">
          <p className="font-display text-2xl leading-tight text-white">
            {price.amount}
            {price.suffix && <span className="ml-1 font-sans text-sm text-white/80">{price.suffix}</span>}
          </p>
        </div>
      </Link>
      <div className="absolute right-1.5 top-8 @[15rem]:right-3 @[15rem]:top-12">
        <FavouriteButton id={p.id} />
      </div>

      <div className="flex flex-1 flex-col p-2.5 @[15rem]:p-5">
        {/* Compact tile: price first, like a shopping app */}
        <p className="font-semibold text-ink @[15rem]:hidden">
          {price.amount}
          {price.suffix && <span className="text-xs font-normal text-stone"> {price.suffix.replace('/ month', '/mo')}</span>}
        </p>
        <h3 className="mt-0.5 line-clamp-2 text-sm leading-snug text-ink @[15rem]:mt-2 @[15rem]:font-display @[15rem]:text-xl">
          <Link href={href} className="hover:text-gold-deep">{p.title}</Link>
        </h3>
        <p className="mt-1 flex items-center gap-1 text-xs text-stone @[15rem]:order-first @[15rem]:text-sm">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-gold-deep @[15rem]:h-4 @[15rem]:w-4" aria-hidden />
          <span className="truncate">{p.locality}</span>
        </p>
        <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-stone @[15rem]:mt-4 @[15rem]:gap-x-4 @[15rem]:border-t @[15rem]:border-ink/10 @[15rem]:pt-3 @[15rem]:text-sm">
          {p.bhk_type && <li className="flex items-center gap-1"><Bed className="h-3.5 w-3.5 text-gold-deep @[15rem]:h-4 @[15rem]:w-4" aria-hidden />{p.bhk_type}</li>}
          {p.area_sqft ? <li className="flex items-center gap-1"><Maximize2 className="h-3.5 w-3.5 text-gold-deep @[15rem]:h-4 @[15rem]:w-4" aria-hidden />{p.area_sqft} ft²</li> : null}
          {p.bathrooms ? <li className="hidden items-center gap-1 @[15rem]:flex"><Bath className="h-4 w-4 text-gold-deep" aria-hidden />{p.bathrooms} bath</li> : null}
          {p.furnishing && <li className="hidden @[15rem]:block">{titleCase(p.furnishing)}</li>}
        </ul>
        <div className="mt-auto flex gap-2 pt-2.5 @[15rem]:pt-4">
          {!closed && (
            <a href={propertyWhatsappUrl(p)} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp about ${p.title}`} className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 bg-whatsapp px-2 font-mono text-[11px] font-semibold uppercase tracking-wide2 text-ink @[15rem]:min-h-11 @[15rem]:text-xs">
              <MessageCircle className="h-4 w-4" aria-hidden /> WhatsApp
            </a>
          )}
          <Link href={href} className="btn-dark hidden flex-1 px-3 @[15rem]:inline-flex">Details</Link>
        </div>
      </div>
    </article>
  )
}

export function PropertyCardSkeleton() {
  return (
    <div className="border border-ink/10 bg-white" aria-hidden>
      <div className="skeleton aspect-[4/3]" />
      <div className="space-y-3 p-5">
        <div className="skeleton h-4 w-1/2" />
        <div className="skeleton h-6 w-4/5" />
        <div className="skeleton h-11 w-full" />
      </div>
    </div>
  )
}
