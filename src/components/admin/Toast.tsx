'use client'
import { createContext, useCallback, useContext, useState } from 'react'

type Toast = { id: number; text: string; tone: 'ok' | 'error' }
const Ctx = createContext<(text: string, tone?: Toast['tone']) => void>(() => {})

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([])
  const push = useCallback((text: string, tone: Toast['tone'] = 'ok') => {
    const id = Date.now() + Math.random()
    setItems(t => [...t, { id, text, tone }])
    setTimeout(() => setItems(t => t.filter(x => x.id !== id)), 4000)
  }, [])
  return (
    <Ctx.Provider value={push}>
      {children}
      <div className="fixed bottom-4 left-1/2 z-[80] flex w-[min(92vw,420px)] -translate-x-1/2 flex-col gap-2" aria-live="polite">
        {items.map(t => (
          <div key={t.id} className={`px-4 py-3 text-sm shadow-lg ${t.tone === 'ok' ? 'bg-ink text-bone' : 'bg-red-700 text-white'}`}>{t.text}</div>
        ))}
      </div>
    </Ctx.Provider>
  )
}

export const useToast = () => useContext(Ctx)

/** Run a server action result through a toast. */
export function useActionToast() {
  const toast = useToast()
  return (r: { ok: boolean; message?: string }) => toast(r.message ?? (r.ok ? 'Done' : 'Something went wrong'), r.ok ? 'ok' : 'error')
}
