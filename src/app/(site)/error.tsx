'use client'

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-6 py-24 text-center">
      <h1 className="font-display text-4xl text-ink">Something went wrong</h1>
      <p className="mt-3 text-stone">Please try again. If it keeps happening, WhatsApp us and we will help.</p>
      <button type="button" onClick={reset} className="btn-dark mt-8">Try again</button>
    </div>
  )
}
