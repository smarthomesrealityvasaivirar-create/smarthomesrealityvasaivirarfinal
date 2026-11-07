'use client'

import { usePathname } from 'next/navigation'
import { MessageCircle } from 'lucide-react'
import { generalWhatsappUrl } from '@/lib/utils/whatsapp'

/** Floating WhatsApp for tablet/desktop only (phones use the bottom tab bar). Hidden on property pages. */
export function WhatsAppFAB() {
  const pathname = usePathname()
  if (pathname.startsWith('/properties/')) return null
  return (
    <a
      href={generalWhatsappUrl()}
      target="_blank"
      rel="noopener noreferrer"
      data-floating
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-6 right-6 z-40 hidden h-14 w-14 lg:flex items-center justify-center rounded-full bg-whatsapp text-ink shadow-[0_10px_25px_rgba(37,211,102,0.4)] transition-transform hover:scale-105"
    >
      <MessageCircle className="h-7 w-7" aria-hidden />
    </a>
  )
}
