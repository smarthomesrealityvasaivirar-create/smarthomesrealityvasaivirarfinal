import { site, absoluteUrl } from '@/config/site'

export function whatsappUrl(message: string, phone: string = site.whatsapp): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}

export function generalWhatsappUrl(): string {
  return whatsappUrl(`Hi ${site.name}, I'd like to enquire about properties in Virar/Vasai.`)
}

/** Exact message format requested by the client. */
export function propertyWhatsappUrl(p: { title: string; reference_number: string; slug: string }): string {
  return whatsappUrl(
    `Hi ${site.name}, I'm interested in ${p.title} (Ref: ${p.reference_number}). Please share details.\n${absoluteUrl(`/properties/${p.slug}`)}`
  )
}

export function telHref(tenDigits: string) {
  return `tel:+91${tenDigits}`
}

export function formatIndianMobile(tenDigits: string) {
  return `+91 ${tenDigits.slice(0, 5)} ${tenDigits.slice(5)}`
}
