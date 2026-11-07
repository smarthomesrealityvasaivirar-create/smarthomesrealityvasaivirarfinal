import type { FurnishingStatus, PropertyCategory, PropertyFilters, PropertyPurpose, SortKey, TenantPreference } from '@/types/property'

export type ListingSearchParams = Record<string, string | string[] | undefined>

const list = (v: string | string[] | undefined) => (Array.isArray(v) ? v : v ? v.split(',') : []).map(s => s.trim()).filter(Boolean)
const num = (v: string | string[] | undefined) => {
  const n = Number(Array.isArray(v) ? v[0] : v)
  return Number.isFinite(n) && n > 0 ? n : undefined
}
const FURNISH: FurnishingStatus[] = ['unfurnished', 'semi-furnished', 'furnished']
const CATS: PropertyCategory[] = ['apartment', 'commercial', 'plot']

/** URL <-> filters. Keys: bhk, loc, furnish, tenant, owner=1, min, max, type, sort, page */
export function parseListingParams(purpose: PropertyPurpose, sp: ListingSearchParams) {
  const type = (Array.isArray(sp.type) ? sp.type[0] : sp.type) as PropertyCategory | undefined
  const tenant = (Array.isArray(sp.tenant) ? sp.tenant[0] : sp.tenant) as TenantPreference | undefined
  const sortRaw = Array.isArray(sp.sort) ? sp.sort[0] : sp.sort
  const filters: PropertyFilters = {
    purpose,
    category: type && CATS.includes(type) ? type : undefined,
    bhk: list(sp.bhk).filter(b => /^\dBHK$|^1RK$/.test(b)),
    localities: list(sp.loc).slice(0, 10),
    furnished: list(sp.furnish).filter((f): f is FurnishingStatus => FURNISH.includes(f as FurnishingStatus)),
    tenant: tenant === 'family' || tenant === 'bachelor' ? tenant : undefined,
    directOwner: sp.owner === '1',
    minPrice: num(sp.min),
    maxPrice: num(sp.max),
  }
  const sort: SortKey = sortRaw === 'price_asc' || sortRaw === 'price_desc' ? sortRaw : 'newest'
  const page = Math.max(1, Math.floor(num(sp.page) ?? 1))
  return { filters, sort, page }
}
