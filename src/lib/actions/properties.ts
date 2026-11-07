'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { assertAdminWrite, AuthError } from '@/lib/auth'
import { propertySchema, type PropertyFormInput } from '@/lib/validations/property'
import { firstErrors } from '@/lib/validations/lead'
import { slugify } from '@/lib/utils/slug'
import type { PropertyStatus } from '@/types/property'

export type ActionResult<T = undefined> =
  | { ok: true; data?: T; message?: string }
  | { ok: false; message: string; errors?: Record<string, string> }

function fail(e: unknown): { ok: false; message: string } {
  if (e instanceof AuthError) return { ok: false, message: e.message }
  const msg = e instanceof Error ? e.message : 'Something went wrong'
  return { ok: false, message: msg }
}

function revalidatePublic(slug?: string) {
  revalidatePath('/')
  revalidatePath('/rent')
  revalidatePath('/buy')
  revalidatePath('/sitemap.xml')
  if (slug) revalidatePath(`/properties/${slug}`)
  revalidatePath('/admin', 'layout')
}

async function uniqueSlug(supabase: Awaited<ReturnType<typeof createClient>>, base: string, excludeId?: string) {
  const root = slugify(base) || 'property'
  for (let i = 0; i < 50; i++) {
    const candidate = i === 0 ? root : `${root}-${i + 1}`
    let q = supabase.from('properties').select('id').eq('slug', candidate)
    if (excludeId) q = q.neq('id', excludeId)
    const { data, error } = await q.limit(1)
    if (error) throw new Error(error.message)
    if (!data?.length) return candidate
  }
  return `${root}-${Date.now()}`
}

export async function saveProperty(input: PropertyFormInput): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    await assertAdminWrite()
    const parsed = propertySchema.safeParse(input)
    if (!parsed.success) return { ok: false, message: 'Please fix the highlighted fields', errors: firstErrors(parsed.error) }
    const { id, images, ...fields } = parsed.data
    const supabase = await createClient()

    const slug = await uniqueSlug(supabase, fields.slug, id)
    const cover = images.find(i => i.is_cover) ?? images[0]
    const row = { ...fields, slug, cover_image_url: cover?.url ?? null }

    let oldSlug: string | undefined
    if (id) {
      const previous = await supabase.from('properties').select('slug').eq('id', id).single()
      if (previous.error) throw new Error(previous.error.message)
      oldSlug = previous.data.slug as string
    }
    const { data, error } = await supabase.rpc('save_property', { p_id: id ?? null, p_fields: row, p_images: images })
    if (error) throw new Error(error.message)
    if (typeof data !== 'string') throw new Error('Database did not confirm the save')
    const propertyId = data
    // Files may be shared by duplicated listings. Never delete them automatically on a row edit.
    if (oldSlug && oldSlug !== slug) revalidatePublic(oldSlug)

    revalidatePublic(slug)
    return { ok: true, data: { id: propertyId, slug }, message: fields.status === 'published' ? 'Saved and published' : 'Saved' }
  } catch (e) {
    return fail(e)
  }
}

export async function setPropertyStatus(id: string, status: PropertyStatus): Promise<ActionResult> {
  try {
    await assertAdminWrite()
    const supabase = await createClient()
    const { data, error } = await supabase.from('properties').update({ status }).eq('id', id).select('slug').single()
    if (error) throw new Error(error.message.includes('check') ? 'That status does not match the listing type' : error.message)
    revalidatePublic(data.slug as string)
    return { ok: true, message: 'Status updated' }
  } catch (e) {
    return fail(e)
  }
}

export async function duplicateProperty(id: string): Promise<ActionResult<{ id: string }>> {
  try {
    await assertAdminWrite()
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('duplicate_property', { source_id: id })
    if (error) throw new Error(error.message)
    if (typeof data !== 'string') throw new Error('Database did not confirm the duplicate')
    revalidatePath('/admin', 'layout')
    return { ok: true, data: { id: data }, message: 'Duplicated as a draft' }
  } catch (e) {
    return fail(e)
  }
}

export async function deleteProperty(id: string): Promise<ActionResult> {
  try {
    await assertAdminWrite()
    const supabase = await createClient()
    const { data, error } = await supabase.from('properties').delete().eq('id', id).select('slug').single()
    if (error) throw new Error(error.message)
    // Retain Storage files: another listing may still reference the same photo.
    revalidatePublic(data.slug as string)
    return { ok: true, message: 'Property deleted' }
  } catch (e) {
    return fail(e)
  }
}
