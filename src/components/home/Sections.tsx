import { ListingImage as Image } from '@/components/property/ListingImage'
import Link from 'next/link'
import { ArrowUpRight, BadgeIndianRupee, Compass, FileCheck, MessageCircle, ShieldCheck } from 'lucide-react'
import { SectionHeader } from '@/components/common/SectionHeader'
import { site } from '@/config/site'
import { whatsappUrl } from '@/lib/utils/whatsapp'

// DEMO imagery (client asked to use demo images for now). Replace with real Virar/Vasai photos in /public.
const IMG = {
  hero: '/doors/interior.webp',
  keys: '/doors/interior.webp',
}

export function Hero({ children }: { children: React.ReactNode }) {
  return (
    <section className="relative isolate overflow-hidden bg-ink">
      <Image src={IMG.hero} alt="" fill priority sizes="100vw" className="-z-10 object-cover" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/85 via-ink/70 to-ink" />
      <div className="mx-auto max-w-7xl px-5 pb-10 pt-10 md:px-8 md:pb-24 md:pt-24">
        <p className="eyebrow text-gold-light">Virar &bull; Vasai &bull; Nallasopara</p>
        <h1 className="mt-4 max-w-3xl font-display text-[34px] leading-[1.08] text-bone sm:text-[56px] md:mt-6 lg:text-[68px]">
          Let our family show your family <span className="block italic text-gold-light">the perfect home.</span>
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-bone/75 md:mt-6">
          Browse every listing freely. No locked cards, no pop-ups. WhatsApp us when one feels right.
        </p>
        {children}
      </div>
    </section>
  )
}

export function Stats() {
  if (!site.stats) return null
  return (
    <section aria-label="Key figures" className="border-b border-ink/10 bg-bone-100">
      <dl className="mx-auto grid max-w-7xl grid-cols-4 px-2 md:px-8">
        {site.stats.map(s => (
          <div key={s.label} className="flex flex-col-reverse px-1 py-5 text-center md:py-8">
            <dt className="mt-1.5 text-[11px] leading-tight text-stone md:mt-2 md:text-sm">{s.label}</dt>
            <dd className="font-display text-xl leading-none text-ink md:text-[42px]">{s.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

const CATEGORIES = [
  { label: '1 BHK homes', caption: 'Compact, near the station', href: '/rent?bhk=1BHK', image: 'https://media.base44.com/images/public/6adf7eb5ea80584ccf4f43e1/217df0c99_generated_2c46adfb.png' },
  { label: '2 BHK family flats', caption: 'The most asked-for layout', href: '/rent?bhk=2BHK', image: 'https://media.base44.com/images/public/6adf7eb5ea80584ccf4f43e1/4ece2f747_generated_5d9b3618.png' },
  { label: 'Homes to buy', caption: 'Ready possession with OC', href: '/buy', image: 'https://media.base44.com/images/public/6adf7eb5ea80584ccf4f43e1/7a91a5699_generated_6f017376.png' },
  { label: 'Shops & offices', caption: 'High-footfall commercial', href: '/rent?type=commercial', image: 'https://media.base44.com/images/public/6adf7eb5ea80584ccf4f43e1/5ff7b94dd_generated_ff7f91aa.png' },
]

/** Category shortcuts. Deliberately different from the hero search (search = filter, these = browse). */
export function Categories() {
  return (
    <section className="section bg-bone">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeader eyebrow="Browse by requirement" title="Start where you are." />
        <ul className="mt-6 grid grid-cols-2 gap-3 md:mt-10 md:gap-4 lg:grid-cols-4">
          {CATEGORIES.map(c => (
            <li key={c.label}>
              <Link href={c.href} className="group relative block aspect-square overflow-hidden bg-ink md:aspect-[3/4]">
                <Image src={c.image} alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover opacity-90 transition-transform duration-700 ease-luxe group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3 md:p-5">
                  <h3 className="font-display text-lg leading-tight text-bone md:text-2xl">{c.label}</h3>
                  <p className="mt-1 hidden text-sm text-bone/75 md:block">{c.caption}</p>
                  <span className="mt-3 hidden items-center gap-1 font-mono text-xs uppercase tracking-wide2 text-gold-light">View <ArrowUpRight className="h-4 w-4" aria-hidden /></span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

const REASONS = [
  { icon: ShieldCheck, title: 'Every home visited', body: 'We walk each flat before it goes live: water, society dues, parking, lift and neighbours.' },
  { icon: FileCheck, title: 'Paperwork at your door', body: 'Leave & License, stamp duty, biometric registration and police verification, handled end to end.' },
  { icon: BadgeIndianRupee, title: 'Brokerage stated upfront', body: 'Our fee is quoted in the first conversation and written into the deal. No surprise charges.' },
  { icon: Compass, title: 'We live here too', body: 'We know which societies accept bachelors, pets or a family of six, before you visit.' },
]

export function WhyUs() {
  return (
    <section className="section bg-bone-100">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeader eyebrow="Why families choose us" title="A broker you can call again." />
        <ul className="rail mt-6 md:mt-10 md:grid-cols-2 lg:grid-cols-4">
          {REASONS.map(r => (
            <li key={r.title} className="border border-ink/10 bg-bone p-5 md:p-7">
              <r.icon className="h-6 w-6 text-gold-deep" strokeWidth={1.7} aria-hidden />
              <h3 className="mt-5 font-display text-xl text-ink">{r.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-stone">{r.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export function OwnerBanner() {
  return (
    <section className="bg-ink text-bone">
      <div className="mx-auto grid max-w-7xl md:grid-cols-2 md:px-8">
        <div className="relative min-h-[200px] md:min-h-[440px]">
          <Image src={IMG.keys} alt="" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
        </div>
        <div className="flex flex-col justify-center px-5 py-10 md:px-12 md:py-14">
          <p className="eyebrow text-gold-light">For flat owners</p>
          <h2 className="mt-3 font-display text-[28px] leading-tight md:mt-4 md:text-[42px]">Your flat, rented to the <span className="italic text-gold-light">right family.</span></h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-bone/70">Tell us about your property. We visit, photograph, screen tenants and handle the agreement. You approve every tenant.</p>
          <Link href="/sell" className="btn-gold mt-6 w-full sm:w-auto sm:self-start md:mt-8">List your property</Link>
        </div>
      </div>
    </section>
  )
}

const TESTIMONIALS = [
  { quote: 'We had a two-week deadline. They shortlisted four flats in Tirupati Nagar, took us for visits the same evening, and the agreement was done in two days.', name: 'Amit Kolhe', detail: '2 BHK tenant, Tirupati Nagar' },
  { quote: 'Every tenant was screened, the deposit was fair, and I get a WhatsApp reminder before rent is due.', name: 'Sneha Jadhav', detail: 'Flat owner, Global City' },
  { quote: 'They were honest about the OC status of two buildings instead of pushing the deal. We bought in Vasai East with a bank loan.', name: 'Praveen Nair', detail: 'Buyer, Evershine City' },
]

export function Testimonials() {
  return (
    <section className="section bg-bone">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeader align="center" eyebrow="Word of mouth" title="Families who stayed." />
        <ul className="rail mt-6 md:mt-10 md:grid-cols-3">
          {TESTIMONIALS.map(t => (
            <li key={t.name}>
              <figure className="flex h-full flex-col justify-between border border-ink/10 bg-white p-5 md:p-7">
                <blockquote className="font-display text-base italic md:text-lg leading-relaxed text-ink/85">&ldquo;{t.quote}&rdquo;</blockquote>
                <figcaption className="mt-6 border-t border-ink/10 pt-4">
                  <p className="font-semibold text-ink">{t.name}</p>
                  <p className="text-sm text-stone">{t.detail}</p>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

const FAQS = [
  { q: 'What documents do I need to rent a flat?', a: 'Aadhaar or passport, PAN, two photographs and income proof (recent salary slips or a bank statement). We tell you up front if a society needs anything extra.' },
  { q: 'How much deposit is normal in Virar and Vasai?', a: 'Usually two to three months of rent for an unfurnished home, more for fully furnished. Brokerage is agreed in writing before the visit.' },
  { q: 'Why does an Occupancy Certificate matter when buying?', a: 'An OC confirms the building is complete and approved as built. Without it, banks may refuse or cut your home loan.' },
  { q: 'Do you charge for site visits?', a: 'No. Visits are free and accompanied, usually evenings or weekends.' },
  { q: 'Can bachelors rent through you?', a: 'Yes. Many societies restrict bachelors, so we only show buildings that accept your profile. Use the "Bachelor friendly" filter.' },
]

export function Faq() {
  return (
    <section className="section bg-bone-100">
      <div className="mx-auto grid max-w-7xl gap-6 md:gap-10 px-5 md:px-8 lg:grid-cols-[0.8fr_1.2fr]">
        <SectionHeader eyebrow="Straight answers" title="Questions we hear every week." />
        <div className="divide-y divide-ink/10 border-y border-ink/10">
          {FAQS.map((f, i) => (
            <details key={f.q} className="group py-3 md:py-4" open={i === 0}>
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-display text-base text-ink md:text-lg">
                {f.q}
                <span className="text-gold-deep transition-transform group-open:rotate-45" aria-hidden>+</span>
              </summary>
              <p className="mt-2 pr-8 text-[15px] leading-relaxed text-stone">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

export function VisitBanner() {
  return (
    <section className="bg-ink">
      <div className="mx-auto flex max-w-7xl flex-col items-start gap-5 px-5 py-10 md:flex-row md:py-14 md:items-center md:justify-between md:px-8">
        <div>
          <h2 className="font-display text-[30px] leading-tight text-bone md:text-[38px]">See three homes in <span className="italic text-gold-light">one evening.</span></h2>
          <p className="mt-2 max-w-lg text-bone/70">Send your budget and move-in date. We plan the route.</p>
        </div>
        <a href={whatsappUrl("Hi, I'd like to plan site visits this weekend in Virar/Vasai. Budget: , move-in date: ")} target="_blank" rel="noopener noreferrer" className="btn-whatsapp w-full md:w-auto">
          <MessageCircle className="h-4 w-4" aria-hidden /> Plan my visits
        </a>
      </div>
    </section>
  )
}
