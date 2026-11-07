'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Phone, X, Heart } from 'lucide-react'
import { site } from '@/config/site'
import { cn } from '@/lib/utils/cn'

const LINKS = [
  { label: 'Rent', href: '/rent' },
  { label: 'Buy', href: '/buy' },
  { label: 'List your property', href: '/sell' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

export function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  useEffect(() => setOpen(false), [pathname])

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink/95 text-bone backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 md:h-[72px] md:px-8" aria-label="Main">
        <Link href="/" className="flex items-center gap-3" aria-label={`${site.name} home`}>
          <Image src="/brand/logo-emblem.png" alt="" width={56} height={29} priority className="h-8 w-auto" />
          <span className="leading-tight">
            <span className="block font-display text-[12px] uppercase tracking-[0.12em] min-[390px]:text-[14px] sm:text-base">{site.name}</span>
            <span className="hidden font-mono text-[11px] uppercase tracking-wide2 text-gold-light sm:block">{site.tagline}</span>
          </span>
        </Link>

        <ul className="hidden items-center gap-7 lg:flex">
          {LINKS.map(l => {
            const active = pathname === l.href || pathname.startsWith(`${l.href}/`)
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn('py-2 font-mono text-xs uppercase tracking-wide2 transition-colors hover:text-gold-light', active ? 'text-gold-light' : 'text-bone/85')}
                >
                  {l.label}
                </Link>
              </li>
            )
          })}
        </ul>

        <div className="flex items-center gap-2">
          <Link href="/saved" className="hidden min-h-11 min-w-11 items-center justify-center text-bone/80 hover:text-gold-light sm:inline-flex" aria-label="Saved homes">
            <Heart className="h-5 w-5" />
          </Link>
          {/* The single header CTA. WhatsApp lives in the floating button, so it is not repeated here. */}
          <a href={`tel:${site.phone.tel}`} className="btn-gold hidden px-4 sm:inline-flex">
            <Phone className="h-4 w-4" aria-hidden />
            <span>Call {site.phone.display}</span>
          </a>
          <button
            type="button"
            onClick={() => setOpen(o => !o)}
            className="inline-flex min-h-11 min-w-11 items-center justify-center lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {open && (
        <div id="mobile-menu" className="border-t border-white/10 bg-ink px-5 pb-6 pt-2 lg:hidden">
          <ul className="divide-y divide-white/10">
            {[...LINKS, { label: 'Saved homes', href: '/saved' }].map(l => (
              <li key={l.href}>
                <Link href={l.href} className="block py-3.5 font-mono text-sm uppercase tracking-wide2 text-bone">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <a href={`tel:${site.phone.tel}`} className="btn-gold mt-4 w-full">
            <Phone className="h-4 w-4" aria-hidden /> Call {site.phone.display}
          </a>
        </div>
      )}
    </header>
  )
}
