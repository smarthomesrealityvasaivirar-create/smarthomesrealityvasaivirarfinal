import type { PriceUnit } from '@/types/property'
/** Compare total rupees, not 1.2 crores against 45 lacs as bare numbers. */
export function totalRupees(price: number, unit: PriceUnit, area: number | null): number | null {
  if (unit === 'lacs') return price * 100000
  if (unit === 'crores') return price * 10000000
  if (unit === 'per_sqft') return area ? price * area : null
  return price
}
