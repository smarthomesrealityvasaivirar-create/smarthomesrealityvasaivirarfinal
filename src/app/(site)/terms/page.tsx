import type { Metadata } from 'next'
import { LegalPage } from '@/components/common/LegalPage'
import { site } from '@/config/site'

export const metadata: Metadata = { title: 'Terms of Use', description: `Terms for using the ${site.name} website.`, alternates: { canonical: '/terms' } }

export default function Page() {
  return (
    <LegalPage
      title="Terms of Use"
      updated="5 November 2026"
      sections={[
        { h: 'Listings', p: ['Prices, photos and availability are provided by owners and can change without notice. Demo photos may be used until real photos are uploaded.'] },
        { h: 'Brokerage', p: ['Our brokerage is agreed in writing before a deal. Site visits are free.'] },
        { h: 'No guarantee', p: [`${site.name} helps you find and verify properties but is not a party to the agreement between owner and tenant or buyer. Verify title, OC and RERA documents independently.`] },
        { h: 'Contact', p: [`Questions: ${site.email}`] },
      ]}
    />
  )
}
