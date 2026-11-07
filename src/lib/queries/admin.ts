import 'server-only'
import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/env'
import { MOCK_PROPERTIES } from '@/lib/data/mockProperties'
import { MOCK_ENQUIRIES, MOCK_SELL_REQUESTS } from '@/lib/data/mockLeads'
import type { Property, PropertyStatus, PropertyPurpose } from '@/types/property'
import type { Enquiry, EnquiryStatus, SellRequest, SellRequestStatus } from '@/types/lead'

export const ADMIN_PAGE_SIZE = 20

export type AdminPropertyRow = Pick<
  Property,
  'id' | 'reference_number' | 'slug' | 'title' | 'purpose' | 'category' | 'price' | 'price_unit' | 'locality' | 'status' | 'featured' | 'cover_image_url' | 'updated_at'
>

export interface AdminPropertyQuery {
  q?: string
  status?: PropertyStatus
  purpose?: PropertyPurpose
  locality?: string
  sort?: 'updated' | 'price_asc' | 'price_desc' | 'title'
  page?: number
}

export async function adminListProperties(opts: AdminPropertyQuery) {
  const page = Math.max(opts.page ?? 1, 1)
  const from = (page - 1) * ADMIN_PAGE_SIZE
  if (!isSupabaseConfigured()) {
    let list = [...MOCK_PROPERTIES]
    if (opts.q) {
      const q = opts.q.toLowerCase()
      list = list.filter(p => `${p.title} ${p.reference_number} ${p.locality}`.toLowerCase().includes(q))
    }
    if (opts.status) list = list.filter(p => p.status === opts.status)
    if (opts.purpose) list = list.filter(p => p.purpose === opts.purpose)
    if (opts.locality) list = list.filter(p => p.locality.toLowerCase().includes(opts.locality!.toLowerCase()))
    list.sort((a, b) =>
      opts.sort === 'price_asc' ? a.price - b.price : opts.sort === 'price_desc' ? b.price - a.price : opts.sort === 'title' ? a.title.localeCompare(b.title) : b.updated_at.localeCompare(a.updated_at)
    )
    return { rows: list.slice(from, from + ADMIN_PAGE_SIZE) as AdminPropertyRow[], total: list.length }
  }
  const supabase = await createClient()
  let q = supabase
    .from('properties')
    .select('id, reference_number, slug, title, purpose, category, price, price_unit, locality, status, featured, cover_image_url, updated_at', { count: 'exact' })
  if (opts.q) {
    const term = opts.q.replace(/[,()%*]/g, ' ').trim()
    q = q.or(`title.ilike.%${term}%,reference_number.ilike.%${term}%,locality.ilike.%${term}%`)
  }
  if (opts.status) q = q.eq('status', opts.status)
  if (opts.purpose) q = q.eq('purpose', opts.purpose)
  if (opts.locality) q = q.ilike('locality', `%${opts.locality.replace(/[%*]/g, '')}%`)
  if (opts.sort === 'price_asc') q = q.order('price', { ascending: true })
  else if (opts.sort === 'price_desc') q = q.order('price', { ascending: false })
  else if (opts.sort === 'title') q = q.order('title', { ascending: true })
  else q = q.order('updated_at', { ascending: false })
  const { data, count, error } = await q.range(from, from + ADMIN_PAGE_SIZE - 1)
  if (error) throw new Error(error.message)
  return { rows: (data ?? []).map(r => ({ ...r, price: Number(r.price) })) as AdminPropertyRow[], total: count ?? 0 }
}

export async function adminGetProperty(id: string): Promise<Property | null> {
  if (!isSupabaseConfigured()) return MOCK_PROPERTIES.find(p => p.id === id) ?? null
  const supabase = await createClient()
  const { data } = await supabase.from('properties').select('*, images:property_images(*)').eq('id', id).maybeSingle()
  if (!data) return null
  const p = data as unknown as Property
  return { ...p, price: Number(p.price), images: [...(p.images ?? [])].sort((a, b) => a.display_order - b.display_order) }
}

export async function adminDashboard() {
  const todayIST = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
  const since = new Date(`${todayIST}T00:00:00+05:30`).toISOString()
  if (!isSupabaseConfigured()) {
    const by = (s: PropertyStatus) => MOCK_PROPERTIES.filter(p => p.status === s).length
    return {
      published: by('published'), rented: by('rented'), sold: by('sold'), drafts: by('draft'),
      enquiriesToday: MOCK_ENQUIRIES.filter(e => e.created_at >= since).length,
      newEnquiries: MOCK_ENQUIRIES.filter(e => e.status === 'new').length,
      newSellRequests: MOCK_SELL_REQUESTS.filter(s => s.status === 'new').length,
      latest: MOCK_ENQUIRIES.slice(0, 5),
    }
  }
  const supabase = await createClient()
  const head = (table: 'properties' | 'enquiries' | 'sell_requests') => supabase.from(table).select('id', { count: 'exact', head: true })
  const results = await Promise.all([
    head('properties').eq('status', 'published'),
    head('properties').eq('status', 'rented'),
    head('properties').eq('status', 'sold'),
    head('properties').eq('status', 'draft'),
    head('enquiries').gte('created_at', since),
    head('enquiries').eq('status', 'new'),
    head('sell_requests').eq('status', 'new'),
  ])
  const [published, rented, sold, drafts, enquiriesToday, newEnquiries, newSellRequests] = results.map(r => r.count ?? 0)
  const { data: latestRows } = await supabase.from('enquiries').select('*').order('created_at', { ascending: false }).limit(5)
  const latest = (latestRows ?? []) as Enquiry[]
  return { published, rented, sold, drafts, enquiriesToday, newEnquiries, newSellRequests, latest }
}

export interface LeadQuery {
  status?: string
  from?: string
  to?: string
  page?: number
}

function dateBounds(from?: string, to?: string) {
  return {
    gte: from && /^\d{4}-\d{2}-\d{2}$/.test(from) ? new Date(`${from}T00:00:00+05:30`).toISOString() : undefined,
    lte: to && /^\d{4}-\d{2}-\d{2}$/.test(to) ? new Date(`${to}T23:59:59+05:30`).toISOString() : undefined,
  }
}

export async function adminListEnquiries(opts: LeadQuery, all = false) {
  const page = Math.max(opts.page ?? 1, 1)
  const { gte, lte } = dateBounds(opts.from, opts.to)
  if (!isSupabaseConfigured()) {
    const list = MOCK_ENQUIRIES.filter(
      e => (!opts.status || e.status === opts.status) && (!gte || e.created_at >= gte) && (!lte || e.created_at <= lte)
    )
    return { rows: all ? list : list.slice((page - 1) * ADMIN_PAGE_SIZE, page * ADMIN_PAGE_SIZE), total: list.length }
  }
  const supabase = await createClient()
  let q = supabase.from('enquiries').select('*', { count: 'exact' }).order('created_at', { ascending: false })
  if (opts.status) q = q.eq('status', opts.status as EnquiryStatus)
  if (gte) q = q.gte('created_at', gte)
  if (lte) q = q.lte('created_at', lte)
  const { data, count, error } = await (all ? q.limit(5000) : q.range((page - 1) * ADMIN_PAGE_SIZE, page * ADMIN_PAGE_SIZE - 1))
  if (error) throw new Error(error.message)
  return { rows: (data ?? []) as Enquiry[], total: count ?? 0 }
}

export async function adminListSellRequests(opts: LeadQuery) {
  const page = Math.max(opts.page ?? 1, 1)
  if (!isSupabaseConfigured()) {
    const list = MOCK_SELL_REQUESTS.filter(s => !opts.status || s.status === opts.status)
    return { rows: list.slice((page - 1) * ADMIN_PAGE_SIZE, page * ADMIN_PAGE_SIZE), total: list.length }
  }
  const supabase = await createClient()
  let q = supabase.from('sell_requests').select('*', { count: 'exact' }).order('created_at', { ascending: false })
  if (opts.status) q = q.eq('status', opts.status as SellRequestStatus)
  const { data, count, error } = await q.range((page - 1) * ADMIN_PAGE_SIZE, page * ADMIN_PAGE_SIZE - 1)
  if (error) throw new Error(error.message)
  return { rows: (data ?? []) as SellRequest[], total: count ?? 0 }
}

export async function adminGetSellRequest(id: string): Promise<SellRequest | null> {
  if (!isSupabaseConfigured()) return MOCK_SELL_REQUESTS.find(s => s.id === id) ?? null
  const supabase = await createClient()
  const { data } = await supabase.from('sell_requests').select('*').eq('id', id).maybeSingle()
  return (data as SellRequest | null) ?? null
}
