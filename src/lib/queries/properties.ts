import 'server-only'
import { cache } from 'react'
import { createPublicClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/env'
import { MOCK_PROPERTIES, toCard } from '@/lib/data/mockProperties'
import { totalRupees } from '@/lib/utils/price'
import {
  PUBLIC_STATUSES,
  type Property,
  type PropertyCard,
  type PropertyFilters,
  type PropertyImage,
  type SortKey,
} from '@/types/property'

export const PAGE_SIZE = 12

const CARD_COLUMNS =
  'id, reference_number, slug, title, purpose, category, bhk_type, price, price_unit, area_sqft, area_type, locality, city, bedrooms, bathrooms, furnishing, tenant_preference, direct_owner, status, featured, cover_image_url, created_at, property_images(count)'

type CardRow = Omit<PropertyCard, 'image_count'> & { property_images: { count: number }[] | null }

function rowToCard(r: CardRow): PropertyCard {
  const { property_images, ...rest } = r
  return { ...rest, price: Number(rest.price), image_count: property_images?.[0]?.count ?? 0 }
}

function matchesFilters(p: Property, f: PropertyFilters) {
  if (f.purpose && p.purpose !== f.purpose) return false
  if (f.category && p.category !== f.category) return false
  if (f.bhk?.length && !f.bhk.includes(p.bhk_type ?? '')) return false
  if (f.localities?.length && !f.localities.some(l => p.locality.toLowerCase().includes(l.toLowerCase()))) return false
  if (f.furnished?.length && !(p.furnishing && f.furnished.includes(p.furnishing))) return false
  if (f.tenant && f.tenant !== 'any' && !(p.tenant_preference === f.tenant || p.tenant_preference === 'any')) return false
  if (f.directOwner && !p.direct_owner) return false
  const comparable = totalRupees(p.price, p.price_unit, p.area_sqft)
  const factor = f.purpose === 'buy' ? 100000 : 1
  if (f.minPrice !== undefined && (comparable === null || comparable < f.minPrice * factor)) return false
  if (f.maxPrice !== undefined && (comparable === null || comparable > f.maxPrice * factor)) return false
  if (f.featured && !p.featured) return false
  return true
}

/**
 * Public listing query. Shows published + sold/rented (with ribbons). Sold/rented sort after available homes.
 * Uses Supabase when configured, mock data otherwise.
 */
export async function getListings(
  filters: PropertyFilters = {},
  sort: SortKey = 'newest',
  page = 1,
  pageSize = PAGE_SIZE
): Promise<{ properties: PropertyCard[]; total: number }> {
  const from = (Math.max(page, 1) - 1) * pageSize

  if (!isSupabaseConfigured()) {
    const list = MOCK_PROPERTIES.filter(p => PUBLIC_STATUSES.includes(p.status) && matchesFilters(p, filters))
    list.sort((a, b) => {
      const avail = Number(a.status !== 'published') - Number(b.status !== 'published')
      if (avail) return avail
      const ap = totalRupees(a.price, a.price_unit, a.area_sqft)
      const bp = totalRupees(b.price, b.price_unit, b.area_sqft)
      if (sort !== 'newest' && (ap === null || bp === null)) return Number(ap === null) - Number(bp === null)
      if (sort === 'price_asc') return ap! - bp!
      if (sort === 'price_desc') return bp! - ap!
      return b.created_at.localeCompare(a.created_at)
    })
    return { properties: list.slice(from, from + pageSize).map(toCard), total: list.length }
  }

  const supabase = createPublicClient()
  let q = supabase.from('properties').select(CARD_COLUMNS, { count: 'exact' }).in('status', PUBLIC_STATUSES)
  if (filters.purpose) q = q.eq('purpose', filters.purpose)
  if (filters.category) q = q.eq('category', filters.category)
  if (filters.bhk?.length) q = q.in('bhk_type', filters.bhk)
  if (filters.localities?.length)
    q = q.or(filters.localities.map(l => `locality.ilike.%${l.replace(/[,()%*]/g, ' ')}%`).join(','))
  if (filters.furnished?.length) q = q.in('furnishing', filters.furnished)
  if (filters.tenant && filters.tenant !== 'any') q = q.in('tenant_preference', [filters.tenant, 'any'])
  if (filters.directOwner) q = q.eq('direct_owner', true)
  const factor = filters.purpose === 'buy' ? 100000 : 1
  if (filters.minPrice !== undefined) q = q.gte('normalized_price', filters.minPrice * factor)
  if (filters.maxPrice !== undefined) q = q.lte('normalized_price', filters.maxPrice * factor)
  if (filters.featured) q = q.eq('featured', true)

  q = q.order('status', { ascending: true }) // enum order: published < sold < rented
  if (sort === 'price_asc') q = q.order('normalized_price', { ascending: true, nullsFirst: false })
  else if (sort === 'price_desc') q = q.order('normalized_price', { ascending: false, nullsFirst: false })
  else q = q.order('created_at', { ascending: false })

  const { data, error, count } = await q.range(from, from + pageSize - 1)
  if (error) {
    console.error('[getListings]', error.message)
    throw new Error('Listings are temporarily unavailable. Please try again or contact the team.')
  }
  return { properties: (data as unknown as CardRow[]).map(rowToCard), total: count ?? 0 }
}

/** Homepage: one call, then split so the same listing never appears in two sections. */
export async function getHomepageListings(limit = 3) {
  const { properties } = await getListings({}, 'newest', 1, 40)
  const available = properties.filter(p => p.status === 'published')
  const seen = new Set<string>()
  const pick = (pred: (p: PropertyCard) => boolean) => {
    const featuredFirst = [...available.filter(p => p.featured), ...available.filter(p => !p.featured)]
    const out: PropertyCard[] = []
    for (const p of featuredFirst) {
      if (out.length >= limit) break
      if (!seen.has(p.id) && pred(p)) {
        seen.add(p.id)
        out.push(p)
      }
    }
    return out
  }
  return { rentals: pick(p => p.purpose === 'rent'), sales: pick(p => p.purpose === 'buy') }
}

function sortImages(images: PropertyImage[] | null | undefined): PropertyImage[] {
  const list = [...(images ?? [])].sort((a, b) => a.display_order - b.display_order)
  const cover = list.findIndex(i => i.is_cover)
  if (cover > 0) list.unshift(...list.splice(cover, 1))
  return list
}

/** cache() dedupes the call between generateMetadata and the page render. */
export const getPropertyBySlug = cache(async (slug: string): Promise<Property | null> => {
  if (!isSupabaseConfigured()) {
    const p = MOCK_PROPERTIES.find(x => x.slug === slug && PUBLIC_STATUSES.includes(x.status))
    return p ? { ...p, images: sortImages(p.images) } : null
  }
  const supabase = createPublicClient()
  const { data, error } = await supabase
    .from('properties')
    .select('*, images:property_images(*)')
    .eq('slug', slug)
    .in('status', PUBLIC_STATUSES)
    .maybeSingle()
  if (error) throw new Error('This listing could not be loaded. Please try again.')
  if (!data) return null
  const p = data as unknown as Property
  return { ...p, price: Number(p.price), images: sortImages(p.images) }
})

/** Similar homes: same purpose, prefers same category/BHK, never the current property, deduped by id. */
export async function getSimilarProperties(current: Property, limit = 3): Promise<PropertyCard[]> {
  const { properties } = await getListings({ purpose: current.purpose }, 'newest', 1, 24)
  const unique = new Map<string, PropertyCard>()
  for (const p of properties) if (p.id !== current.id && p.status === 'published') unique.set(p.id, p)
  const score = (p: PropertyCard) =>
    Number(p.category === current.category) * 2 + Number(p.bhk_type === current.bhk_type) + Number(p.locality === current.locality)
  return [...unique.values()].sort((a, b) => score(b) - score(a)).slice(0, limit)
}

export async function getPublicSlugs(): Promise<{ slug: string; updated_at: string }[]> {
  if (!isSupabaseConfigured()) {
    return MOCK_PROPERTIES.filter(p => PUBLIC_STATUSES.includes(p.status)).map(p => ({ slug: p.slug, updated_at: p.updated_at }))
  }
  const { data } = await createPublicClient().from('properties').select('slug, updated_at').in('status', PUBLIC_STATUSES)
  return data ?? []
}

/** All public cards, used by the Saved page (inventory is small; revisit past ~300 listings). */
export async function getAllPublicCards(): Promise<PropertyCard[]> {
  const { properties } = await getListings({}, 'newest', 1, 300)
  return properties
}
