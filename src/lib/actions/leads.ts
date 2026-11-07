'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { assertAdminWrite, AuthError } from '@/lib/auth'
import { ENQUIRY_STATUSES, SELL_STATUSES, type EnquiryStatus, type SellRequestStatus } from '@/types/lead'
import type { ActionResult } from '@/lib/actions/properties'

function fail(e: unknown): { ok: false; message: string } {
  return { ok: false, message: e instanceof AuthError || e instanceof Error ? e.message : 'Something went wrong' }
}

export async function updateEnquiry(id: string, patch: { status?: EnquiryStatus; notes?: string }): Promise<ActionResult> {
  try {
    await assertAdminWrite()
    if (patch.status && !ENQUIRY_STATUSES.includes(patch.status)) throw new Error('Invalid status')
    const update: Record<string, string | null> = {}
    if (patch.status) update.status = patch.status
    if (patch.notes !== undefined) update.notes = patch.notes.slice(0, 2000) || null
    const supabase = await createClient()
    const { error } = await supabase.from('enquiries').update(update).eq('id', id)
    if (error) throw new Error(error.message)
    revalidatePath('/admin', 'layout')
    return { ok: true, message: 'Lead updated' }
  } catch (e) {
    return fail(e)
  }
}

export async function updateSellRequest(id: string, patch: { status?: SellRequestStatus; notes?: string }): Promise<ActionResult> {
  try {
    await assertAdminWrite()
    if (patch.status && !SELL_STATUSES.includes(patch.status)) throw new Error('Invalid status')
    const update: Record<string, string | null> = {}
    if (patch.status) update.status = patch.status
    if (patch.notes !== undefined) update.notes = patch.notes.slice(0, 2000) || null
    const supabase = await createClient()
    const { error } = await supabase.from('sell_requests').update(update).eq('id', id)
    if (error) throw new Error(error.message)
    revalidatePath('/admin', 'layout')
    return { ok: true, message: 'Request updated' }
  } catch (e) {
    return fail(e)
  }
}

/** Approve an owner request and create a DRAFT listing from it. Nothing is published automatically. */
export async function createDraftFromSellRequest(id: string): Promise<ActionResult<{ id: string }>> {
  try {
    await assertAdminWrite()
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('draft_from_request', { request_id: id })
    if (error) throw new Error(error.message)
    if (typeof data !== 'string') throw new Error('Database did not confirm the draft')
    revalidatePath('/admin', 'layout')
    return { ok: true, data: { id: data }, message: 'Draft ready. Add photos, description and price before publishing.' }
  } catch (e) {
    return fail(e)
  }
}
