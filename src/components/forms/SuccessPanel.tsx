import { CheckCircle2, MessageCircle } from 'lucide-react'

export function SuccessPanel({ title, body, demo, whatsappHref, onReset }: { title: string; body: string; demo: boolean; whatsappHref: string; onReset: () => void }) {
  return (
    <div className="space-y-4 py-6 text-center" role="status">
      <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-700" aria-hidden />
      <h3 className="font-display text-2xl text-ink">{title}</h3>
      <p className="text-stone">{body}</p>
      {demo && <p className="border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">Demo mode: this site is not connected to a database yet, so the request was NOT saved. Please also send it on WhatsApp.</p>}
      <div className="flex flex-wrap justify-center gap-2">
        <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
          <MessageCircle className="h-4 w-4" aria-hidden /> Also send on WhatsApp
        </a>
        <button type="button" onClick={onReset} className="btn-outline">Send another</button>
      </div>
    </div>
  )
}
