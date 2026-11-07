'use client'
import { Heart } from 'lucide-react'
import { toggleFavourite, useFavourites } from '@/lib/favourites'
import { cn } from '@/lib/utils/cn'

export function FavouriteButton({ id, withLabel = false }: { id: string; withLabel?: boolean }) {
  const saved = useFavourites().includes(id)
  return (
    <button
      type="button"
      onClick={() => toggleFavourite(id)}
      aria-pressed={saved}
      aria-label={saved ? 'Remove from saved homes' : 'Save this home'}
      className={cn(
        'inline-flex min-h-11 items-center justify-center gap-2',
        withLabel ? 'btn-outline w-11 px-0 sm:w-auto sm:px-6' : 'h-11 w-11 rounded-full bg-white/90 text-ink shadow hover:bg-white'
      )}
    >
      <Heart className={cn('h-5 w-5', saved && 'fill-red-600 text-red-600')} aria-hidden />
      {withLabel && <span className="hidden sm:inline">{saved ? 'Saved' : 'Save'}</span>}
    </button>
  )
}
