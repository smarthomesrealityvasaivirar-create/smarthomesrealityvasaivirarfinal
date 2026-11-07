'use client'
import Link from 'next/link'
import { useFavourites } from '@/lib/favourites'
import { PropertyCard } from '@/components/property/PropertyCard'
import type { PropertyCard as Card } from '@/types/property'

export function SavedList({ cards }: { cards: Card[] }) {
  const ids = useFavourites()
  const saved = cards.filter(c => ids.includes(c.id))
  if (!saved.length)
    return (
      <div className="mt-8 border border-dashed border-ink/20 bg-white p-10 text-center">
        <p className="font-display text-2xl text-ink">No saved homes yet</p>
        <p className="mt-2 text-stone">Tap the heart on any listing to keep it here.</p>
        <Link href="/rent" className="btn-dark mt-6">Browse rentals</Link>
      </div>
    )
  return <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">{saved.map(c => <PropertyCard key={c.id} property={c} />)}</div>
}
