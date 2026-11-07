import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-ink px-6 text-center text-bone">
      <p className="eyebrow text-gold-light">Error 404</p>
      <h1 className="mt-4 font-display text-4xl md:text-6xl">This door leads nowhere.</h1>
      <p className="mt-4 max-w-md text-bone/70">The page or listing may have been rented, sold or moved.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/rent" className="btn-gold">Browse rentals</Link>
        <Link href="/" className="btn-outline-light">Home</Link>
      </div>
    </div>
  )
}
