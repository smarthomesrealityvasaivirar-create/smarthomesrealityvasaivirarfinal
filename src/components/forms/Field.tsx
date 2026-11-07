import { cn } from '@/lib/utils/cn'

export function Field({
  label,
  name,
  error,
  required,
  hint,
  children,
  className,
}: {
  label: string
  name: string
  error?: string
  required?: boolean
  hint?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('relative', className)}>
      <label htmlFor={name} className="field-label">
        {label}
        {required && <span className="text-red-700"> *</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-sm text-stone">{hint}</p>}
      {error && <p id={`${name}-error`} className="field-error" role="alert">{error}</p>}
    </div>
  )
}
