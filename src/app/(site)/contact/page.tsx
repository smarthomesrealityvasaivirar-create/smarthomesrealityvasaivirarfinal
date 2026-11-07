import type { Metadata } from 'next'
import { Clock, MapPin, Mail, MessageCircle, Navigation, Phone } from 'lucide-react'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { EnquiryForm } from '@/components/forms/EnquiryForm'
import { site, fullAddress } from '@/config/site'
import { formatIndianMobile, generalWhatsappUrl, telHref, whatsappUrl } from '@/lib/utils/whatsapp'

export const metadata: Metadata = {
  title: 'Contact & Office Address in Virar West',
  description: `Visit ${site.name} at ${fullAddress}, or call the team directly. Open ${site.hours.label}.`,
  alternates: { canonical: '/contact' },
}

/**
 * Phone-first: one-tap Call / WhatsApp at the top, the team as tappable rows,
 * then the form, then address + map. Desktop keeps a two-column layout.
 */
export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-14">
      <div className="hidden md:block"><Breadcrumbs items={[{ label: 'Contact' }]} /></div>
      <h1 className="font-display text-[28px] leading-tight text-ink sm:text-5xl md:mt-4">Visit us or call directly</h1>
      <p className="mt-2 text-stone">Office open {site.hours.label}.</p>

      <div className="mt-6 grid grid-cols-2 gap-2 md:hidden">
        <a href={`tel:${site.phone.tel}`} className="btn-dark h-12"><Phone className="h-4 w-4" aria-hidden /> Call now</a>
        <a href={generalWhatsappUrl()} target="_blank" rel="noopener noreferrer" className="btn-whatsapp h-12"><MessageCircle className="h-4 w-4" aria-hidden /> WhatsApp</a>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 md:mt-10 lg:grid-cols-2 lg:gap-10">
        <div className="min-w-0 space-y-6">
          <section aria-labelledby="team" className="-mx-5 border-y border-ink/10 bg-white px-5 py-2 md:mx-0 md:border md:p-6">
            <h2 id="team" className="eyebrow pt-3 text-gold-deep md:pt-0">Talk to the team</h2>
            <ul className="divide-y divide-ink/10">
              {site.team.map(m => (
                <li key={m.phone} className="flex items-center gap-3 py-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink font-display text-lg text-gold-light" aria-hidden>{m.name[0]}</span>
                  <span className="min-w-0 flex-1">
                    <strong className="block text-ink">{m.name}</strong>
                    <span className="block text-sm text-stone">{m.role}</span>
                    <a href={telHref(m.phone)} className="mt-0.5 hidden font-mono text-sm text-ink underline md:inline">{formatIndianMobile(m.phone)}</a>
                  </span>
                  <a href={telHref(m.phone)} aria-label={`Call ${m.name} on ${formatIndianMobile(m.phone)}`} className="inline-flex h-11 w-11 shrink-0 items-center justify-center border border-ink/15 text-ink hover:border-gold">
                    <Phone className="h-4 w-4" aria-hidden />
                  </a>
                  <a href={whatsappUrl(`Hi ${m.name}, I found you on the ${site.name} website.`, `91${m.phone}`)} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp ${m.name}`} className="inline-flex h-11 w-11 shrink-0 items-center justify-center bg-whatsapp text-ink">
                    <MessageCircle className="h-4 w-4" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <address className="-mx-5 overflow-hidden border-y border-ink/10 bg-white not-italic md:mx-0 md:border">
            <div className="space-y-4 p-5 md:p-6">
              <p className="flex gap-3"><MapPin className="mt-1 h-5 w-5 shrink-0 text-gold-deep" aria-hidden /><span>{fullAddress}</span></p>
              <p className="flex gap-3"><Clock className="mt-1 h-5 w-5 shrink-0 text-gold-deep" aria-hidden />{site.hours.label}</p>
              <p className="flex gap-3"><Mail className="mt-1 h-5 w-5 shrink-0 text-gold-deep" aria-hidden /><a href={`mailto:${site.email}`} className="min-w-0 break-all underline">{site.email}</a></p>
              <a className="btn-outline w-full sm:w-auto" href={site.mapsUrl} target="_blank" rel="noopener noreferrer"><Navigation className="h-4 w-4" aria-hidden /> Get directions</a>
            </div>
            <iframe title={`${site.name} office on Google Maps`} src={site.mapsEmbedUrl} className="block aspect-[16/10] w-full border-t border-ink/10 bg-bone-200" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </address>
        </div>

        <div className="-mx-5 min-w-0 border-y border-ink/10 bg-white p-5 md:mx-0 md:border md:p-8 lg:order-none">
          <h2 className="font-display text-2xl text-ink">Send us your requirement</h2>
          <p className="mt-1 text-sm text-stone">Tell us the area and budget and the team will get back to you.</p>
          <div className="mt-5"><EnquiryForm mode="contact" /></div>
        </div>
      </div>
    </div>
  )
}
