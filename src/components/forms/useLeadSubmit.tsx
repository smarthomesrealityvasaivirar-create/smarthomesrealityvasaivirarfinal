'use client'
import { useState } from 'react'

type Result = { ok: true; demo?: boolean } | { ok: false; message: string; errors?: Record<string, string> }

export function useLeadSubmit(endpoint: '/api/enquiries' | '/api/sell-requests') {
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [message, setMessage] = useState<string | null>(null)
  const [demo, setDemo] = useState(false)

  async function submit(payload: Record<string, unknown>) {
    setState('sending')
    setErrors({})
    setMessage(null)
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = (await res.json()) as Result
      if (data.ok) {
        setDemo(!!data.demo)
        setState('done')
        return true
      }
      setErrors(data.errors ?? {})
      setMessage(data.message)
    } catch {
      setMessage('Network problem. Please try again or WhatsApp us.')
    }
    setState('idle')
    return false
  }
  return { state, errors, message, demo, submit, reset: () => setState('idle') }
}

/** Off-screen honeypot. Bots fill it, people never see it. */
export function Honeypot() {
  return (
    <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
      <label>
        Website
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  )
}
