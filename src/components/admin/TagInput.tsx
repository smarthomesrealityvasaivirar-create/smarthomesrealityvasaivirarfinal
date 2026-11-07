'use client'
import { useState } from 'react'
import { X } from 'lucide-react'

export function TagInput({ id, value, onChange, placeholder, suggestions = [] }: { id: string; value: string[]; onChange: (v: string[]) => void; placeholder?: string; suggestions?: string[] }) {
  const [text, setText] = useState('')
  const add = (t: string) => {
    const v = t.trim()
    if (v && !value.includes(v)) onChange([...value, v])
    setText('')
  }
  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {value.map(t => (
          <span key={t} className="inline-flex items-center gap-1 bg-bone-200 px-2 py-1 text-sm">
            {t}
            <button type="button" aria-label={`Remove ${t}`} onClick={() => onChange(value.filter(x => x !== t))}><X className="h-3.5 w-3.5" /></button>
          </span>
        ))}
      </div>
      <input
        id={id}
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            add(text)
          }
        }}
        onBlur={() => text && add(text)}
        placeholder={placeholder ?? 'Type and press Enter'}
        className="field mt-2"
      />
      {suggestions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {suggestions.filter(s => !value.includes(s)).map(s => (
            <button key={s} type="button" onClick={() => add(s)} className="border border-dashed border-ink/20 px-2 py-1 text-xs text-stone hover:border-gold-deep">+ {s}</button>
          ))}
        </div>
      )}
    </div>
  )
}
