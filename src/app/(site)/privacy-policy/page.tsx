import type { Metadata } from 'next'
import { LegalPage } from '@/components/common/LegalPage'
import { site, fullAddress } from '@/config/site'

export const metadata: Metadata = { title: 'Privacy Policy', description: `How ${site.name} collects and uses enquiry details.`, alternates: { canonical: '/privacy-policy' } }

export default function Page() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="5 November 2026"
      sections={[
        { h: 'What we collect', p: ['When you send a form we store your name, mobile number, optional email, your message and, for visits, the property and preferred date. Owners who list a property also share its type, locality and expected price.'] },
        { h: 'Why we use it', p: ['Only to call or WhatsApp you about your requirement, arrange visits and prepare agreements. We do not sell or rent your details to anyone.'] },
        { h: 'Where it is stored', p: ['On Supabase (a hosted database) with access limited to our staff. The website uses no advertising trackers or analytics cookies.'] },
        { h: 'Optional notifications and external services', p: ['If enabled, our team receives enquiry notifications through CallMeBot (WhatsApp) or Resend (email). Notifications contain a link to the admin dashboard, not your contact details. Opening WhatsApp or Google Maps takes you to their services and privacy policies. Saved homes are stored locally in your browser; admin login uses authentication cookies.'] },
        { h: 'Your choices', p: [`Ask us to correct or delete your details at any time: ${site.email}, or visit ${fullAddress}.`] },
        { h: 'RERA note', p: ['Listings are shared by owners and builders. Please verify the project RERA registration on maharera.maharashtra.gov.in and all documents before paying any token amount.'] },
      ]}
    />
  )
}
