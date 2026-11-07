'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Building2, Heart, Home, KeyRound, MessageCircle } from 'lucide-react'
import { generalWhatsappUrl } from '@/lib/utils/whatsapp'
import { useFavourites } from '@/lib/favourites'
import { cn } from '@/lib/utils/cn'

/**
 * App-style bottom tab bar for phones (most visitors). Thumb-reachable, 64px tall, safe-area aware.
 * Replaces the floating WhatsApp button on mobile. Hidden on property pages (they have a Call/WhatsApp bar).
 */
export function BottomNav() {
  const pathname = usePathname()
  const saved = useFavourites().length
  if (pathname.startsWith('/properties/')) return null
  const tabs = [
    { href: '/', label: 'Home', icon: Home, active: pathname === '/' },
    { href: '/rent', label: 'Rent', icon: KeyRound, active: pathname.startsWith('/rent') },
    { href: '/buy', label: 'Buy', icon: Building2, active: pathname.startsWith('/buy') },
    { href: '/saved', label: 'Saved', icon: Heart, active: pathname.startsWith('/saved'), badge: saved },
  ]
  return (
    <nav data-floating aria-label="Quick navigation" className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink/95 pb-[env(safe-area-inset-bottom)] text-bone backdrop-blur lg:hidden">
      <ul className="grid h-16 grid-cols-5">
        {tabs.map(t => (
          <li key={t.href}>
            <Link href={t.href} aria-current={t.active ? 'page' : undefined} className={cn('relative flex h-full flex-col items-center justify-center gap-1 text-[11px]', t.active ? 'text-gold-light' : 'text-bone/70')}>
              <t.icon className="h-5 w-5" aria-hidden />
              {t.label}
              {!!t.badge && <span className="absolute right-[22%] top-2 min-w-4 rounded-full bg-red-600 px-1 text-center text-[10px] leading-4 text-white">{t.badge}</span>}
            </Link>
          </li>
        ))}
        <li>
          <a href={generalWhatsappUrl()} target="_blank" rel="noopener noreferrer" className="flex h-full flex-col items-center justify-center gap-1 text-[11px] text-whatsapp">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-whatsapp text-ink"><MessageCircle className="h-5 w-5" aria-hidden /></span>
            <span className="sr-only">WhatsApp us</span>
          </a>
        </li>
      </ul>
    </nav>
  )
}
