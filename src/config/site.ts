/**
 * SINGLE SOURCE OF TRUTH for brand + contact details.
 * Change a phone number, address or hours here and it updates everywhere.
 * Items marked CONFIRM came from the V1 build and still need the client's sign-off.
 */

export type TeamMember = {
  name: string
  role: string
  /** 10-digit Indian mobile, digits only */
  phone: string
  primary?: boolean
}

const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export const site = {
  name: 'Smart Home Reality',
  shortName: 'SHR',
  tagline: 'Your Dream Home, Our Priority',
  description:
    'Hyperlocal property consultancy in Virar West. Verified 1, 2 and 3 BHK rentals, ready-possession flats, shops and plots across Virar, Vasai and Nallasopara.',
  url: rawSiteUrl.replace(/\/$/, ''),
  locale: 'en_IN',

  // Confirmed by client 5 Nov 2026 (Avinash = primary WhatsApp)
  whatsapp: '919673247515',
  phone: { display: '+91 96732 47515', tel: '+919673247515' },
  email: 'smarthomesrealityvasaivirar@gmail.com',
  team: [
    { name: 'Avinash', role: 'Senior broker, resale & owners', phone: '9673247515', primary: true },
    { name: 'Swapnali', role: 'Rentals & tenant onboarding', phone: '7066246138' },
    { name: 'Yash', role: 'Site visits & key handover', phone: '7507591932' },
  ] as TeamMember[],

  // Confirmed by client 5 Nov 2026
  address: {
    line1: 'Shop No. 31, Viva Raj Maitri Heights',
    line2: 'Near Bhoomi Acropolis',
    locality: 'Virar West',
    region: 'Maharashtra',
    postalCode: '401303',
    country: 'IN',
    geo: { lat: 19.4678, lng: 72.7959 },
  },
  hours: { label: 'Mon to Sun, 9:30 AM to 8:30 PM', opens: '09:30', closes: '20:30' },
  mapsUrl: 'https://maps.google.com/?q=Viva+Raj+Maitri+Heights+Shop+31+Near+Bhoomi+Acropolis+Virar+West+401303',
  mapsEmbedUrl:
    'https://maps.google.com/maps?q=Viva%20Raj%20Maitri%20Heights%20Virar%20West%20401303&t=&z=16&ie=UTF8&iwloc=&output=embed',

  /** Show only when the client gives a real MahaRERA agent number. Wrong numbers are a legal risk. */
  reraAgentNumber: null as string | null,

  social: {
    instagram: null as string | null,
    facebook: null as string | null,
    youtube: null as string | null,
  },

  /** Localities offered in filters and the hero search. CONFIRM list with client. */
  localities: [
    'Tirupati Nagar',
    'Yashwant Nagar',
    'Station Road',
    'Bolinj',
    'Global City',
    'Chikhal Dongri',
    'Stella',
    'Evershine City',
    'Nallasopara',
  ],

  /** Client asked to keep these (5 Nov 2026). Set to null to hide the strip. */
  stats: [
    { value: '500+', label: 'Families settled' },
    { value: '8 yrs', label: 'In Virar & Vasai' },
    { value: '3', label: 'Consultants on call' },
    { value: '7 days', label: 'Office open weekly' },
  ] as { value: string; label: string }[] | null,
}

export const fullAddress = `${site.address.line1}, ${site.address.line2}, ${site.address.locality}, ${site.address.region} ${site.address.postalCode}`

export function absoluteUrl(path = '/') {
  return `${site.url}${path.startsWith('/') ? path : `/${path}`}`
}
