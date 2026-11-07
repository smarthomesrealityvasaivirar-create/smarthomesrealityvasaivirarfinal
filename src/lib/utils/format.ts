import type { AreaType, PriceUnit, PropertyStatus } from '@/types/property'

const inr = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 })
const dec = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 })

/**
 * formatPrice(43.5, 'lacs')      -> "Rs 43.5 Lacs" style: "₹43.5 Lacs"
 * formatPrice(16500, 'per_month') -> "₹16,500 / month"
 * formatPrice(1.25, 'crores')    -> "₹1.25 Cr"
 */
export function formatPrice(price: number, unit: PriceUnit): string {
  switch (unit) {
    case 'lacs':
      return `₹${dec.format(price)} Lacs`
    case 'crores':
      return `₹${dec.format(price)} Cr`
    case 'per_month':
      return `₹${inr.format(price)} / month`
    case 'per_sqft':
      return `₹${inr.format(price)} / sq ft`
  }
}

/** Short price for tight spaces (cards): no "/ month" suffix, caller shows it. */
export function formatPriceShort(price: number, unit: PriceUnit): { amount: string; suffix: string | null } {
  switch (unit) {
    case 'per_month':
      return { amount: `₹${inr.format(price)}`, suffix: '/ month' }
    case 'per_sqft':
      return { amount: `₹${inr.format(price)}`, suffix: '/ sq ft' }
    default:
      return { amount: formatPrice(price, unit), suffix: null }
  }
}

const AREA_LABEL: Record<AreaType, string> = { carpet: 'carpet', built_up: 'built-up', plot_area: 'plot' }

export function formatArea(sqft: number, type: AreaType | null): string {
  return `${inr.format(sqft)} sq ft${type ? ` ${AREA_LABEL[type]}` : ''}`
}

/** Past or today -> "Available now"; future -> "From 15 Nov 2026". */
export function formatAvailability(dateStr: string | null, now = new Date()): string | null {
  if (!dateStr) return null
  const d = new Date(`${dateStr.slice(0, 10)}T00:00:00+05:30`)
  if (Number.isNaN(d.getTime())) return null
  const today = new Date(now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }) + 'T00:00:00+05:30')
  if (d.getTime() <= today.getTime()) return 'Available now'
  return `From ${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' })}`
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata',
  })
}

export const STATUS_LABEL: Record<PropertyStatus, string> = {
  draft: 'Draft',
  published: 'Published',
  sold: 'Sold',
  rented: 'Rented',
  archived: 'Archived',
}

export function titleCase(s: string) {
  return s.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}
