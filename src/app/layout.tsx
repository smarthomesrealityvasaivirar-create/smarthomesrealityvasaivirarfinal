import type { Metadata, Viewport } from 'next'
import { site } from '@/config/site'
import './globals.css'


export const viewport: Viewport = { themeColor: '#080808', width: 'device-width', initialScale: 1 }

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name}: Flats for Rent & Sale in Virar, Vasai & Nallasopara`, template: `%s | ${site.name}` },
  description: site.description,
  applicationName: site.name,
  openGraph: { type: 'website', locale: site.locale, siteName: site.name, images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: site.name }] },
  twitter: { card: 'summary_large_image', images: ['/og-image.jpg'] },
  icons: { icon: '/icon.png', apple: '/icon.png' },
  formatDetection: { telephone: false, email: false, address: false },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN">
      <body className="flex min-h-dvh flex-col">{children}</body>
    </html>
  )
}
