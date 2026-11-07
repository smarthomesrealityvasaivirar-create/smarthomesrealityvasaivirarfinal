'use client'
import { useState } from 'react'
import { Printer, Share2 } from 'lucide-react'

export function ShareButton({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      className="btn-outline w-11 px-0 sm:w-auto sm:px-6"
      aria-label={copied ? 'Link copied' : 'Share this home'}
      onClick={async () => {
        if (navigator.share) {
          try {
            await navigator.share({ title, url })
          } catch {}
          return
        }
        try {
          await navigator.clipboard.writeText(url)
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        } catch {
          window.prompt('Copy this property link:', url)
        }
      }}
    >
      <Share2 className="h-4 w-4" aria-hidden /> <span className="hidden sm:inline">{copied ? 'Link copied' : 'Share'}</span>
    </button>
  )
}

/** Print-friendly brochure: the print stylesheet hides header, footer and floating buttons. */
export function PrintButton() {
  return (
    <button type="button" className="btn-outline hidden md:inline-flex" onClick={() => window.print()}>
      <Printer className="h-4 w-4" aria-hidden /> Brochure
    </button>
  )
}
