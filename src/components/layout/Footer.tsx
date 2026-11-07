import Image from 'next/image'
import Link from 'next/link'
import { Clock, MapPin, Mail, MessageCircle, Phone } from 'lucide-react'
import { site, fullAddress } from '@/config/site'
import { formatIndianMobile, telHref, whatsappUrl } from '@/lib/utils/whatsapp'

const EXPLORE = [
  { label: 'Homes for rent', href: '/rent' },
  { label: 'Homes for sale', href: '/buy' },
  { label: 'List your property', href: '/sell' },
  { label: 'Saved homes', href: '/saved' },
  { label: 'About us', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

/** The ONLY place (with /contact) where address, hours and team lines are shown. */
export function Footer() {
  return (
    <footer className="bg-ink pb-16 text-bone lg:pb-0">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:grid-cols-2 md:px-8 md:py-16 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Image src="/brand/logo-clean.png" alt={site.name} width={160} height={145} className="h-20 w-auto md:h-24" />
          <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-bone/70">
            A hyperlocal property consultancy for the Vasai&ndash;Virar corridor. Rentals, resale, shops and plots, visited in person before they are listed.
          </p>
        </div>

        <div className="lg:col-span-2">
          <h2 className="eyebrow text-gold-light">Explore</h2>
          <ul className="mt-4 grid grid-cols-2 gap-x-4 lg:grid-cols-1">
            {EXPLORE.map(l => (
              <li key={l.href}>
                <Link href={l.href} className="inline-block py-1.5 text-[15px] text-bone/75 hover:text-gold-light">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-3">
          <h2 className="eyebrow text-gold-light">Visit the office</h2>
          <address className="mt-4 space-y-3 text-[15px] not-italic text-bone/75">
            <p className="flex gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
              <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-gold-light">{fullAddress}</a>
            </p>
            <p className="flex gap-2.5"><Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />{site.hours.label}</p>
            <p className="flex gap-2.5">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
              <a href={`mailto:${site.email}`} className="break-all hover:text-gold-light">{site.email}</a>
            </p>
          </address>
        </div>

        <div className="lg:col-span-3">
          <h2 className="eyebrow text-gold-light">Talk to the team</h2>
          <ul className="mt-4 space-y-3">
            {site.team.map(m => (
              <li key={m.phone} className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
                <div>
                  <p className="font-display text-lg">{m.name}</p>
                  <p className="text-sm text-bone/60">{m.role}</p>
                </div>
                <div className="flex gap-1.5">
                  <a href={telHref(m.phone)} aria-label={`Call ${m.name} on ${formatIndianMobile(m.phone)}`} className="inline-flex h-11 w-11 items-center justify-center border border-white/15 hover:border-gold">
                    <Phone className="h-4 w-4 text-gold" aria-hidden />
                  </a>
                  <a href={whatsappUrl(`Hi ${m.name}, I found you on the ${site.name} website.`, `91${m.phone}`)} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp ${m.name}`} className="inline-flex h-11 w-11 items-center justify-center bg-whatsapp text-ink">
                    <MessageCircle className="h-4 w-4" aria-hidden />
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-6 text-sm text-bone/55 md:flex-row md:items-center md:justify-between md:px-8">
          <p>&copy; {new Date().getFullYear()} {site.name}. Listings, prices and availability are shared by owners and may change; please verify documents before paying any token.</p>
          <p className="flex gap-5">
            <Link href="/privacy-policy" className="hover:text-gold-light">Privacy</Link>
            <Link href="/terms" className="hover:text-gold-light">Terms</Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
