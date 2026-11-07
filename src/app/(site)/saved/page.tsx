import type { Metadata } from 'next'
import { getAllPublicCards } from '@/lib/queries/properties'
import { SavedList } from '@/components/property/SavedList'

export const metadata: Metadata = { title: 'Saved Homes', robots: { index: false }, alternates: { canonical: '/saved' } }
export const revalidate = 300

export default async function SavedPage() {
  const cards = await getAllPublicCards()
  return (
    <div className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
      <h1 className="font-display text-3xl text-ink sm:text-5xl">Saved homes</h1>
      <p className="mt-2 text-stone">Saved on this device only.</p>
      <SavedList cards={cards} />
    </div>
  )
}
