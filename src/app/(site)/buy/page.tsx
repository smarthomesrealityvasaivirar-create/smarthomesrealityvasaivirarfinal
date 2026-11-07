import type { Metadata } from 'next'
import { Suspense } from 'react'
import { ListingPage } from '@/components/listing/ListingPage'
import type { ListingSearchParams } from '@/lib/listing-params'

export const metadata: Metadata = {
  title: 'Flats, Shops & Plots for Sale in Virar & Vasai',
  description: 'Ready-possession flats with OC, shops and NA plots for sale in Virar and Vasai. Clear titles and home-loan guidance.',
  alternates: { canonical: '/buy' },
}

export default async function BuyPage({ searchParams }: { searchParams: Promise<ListingSearchParams> }) {
  return (
    <Suspense>
      <ListingPage purpose="buy" searchParams={await searchParams} />
    </Suspense>
  )
}
