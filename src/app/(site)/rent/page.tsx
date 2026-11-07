import type { Metadata } from 'next'
import { Suspense } from 'react'
import { ListingPage } from '@/components/listing/ListingPage'
import type { ListingSearchParams } from '@/lib/listing-params'

export const metadata: Metadata = {
  title: 'Flats for Rent in Virar & Vasai',
  description: 'Verified 1, 2 and 3 BHK rentals in Virar West, Bolinj, Global City and Vasai. Filter by budget, furnishing, family or bachelor, and direct owner.',
  alternates: { canonical: '/rent' },
}

export default async function RentPage({ searchParams }: { searchParams: Promise<ListingSearchParams> }) {
  return (
    <Suspense>
      <ListingPage purpose="rent" searchParams={await searchParams} />
    </Suspense>
  )
}
