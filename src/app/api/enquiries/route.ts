import { NextResponse } from 'next/server'
import { enquirySchema } from '@/lib/validations/lead'
import { parseLead, type LeadResponse } from '@/lib/leads-api'
import { isSupabaseConfigured } from '@/lib/env'
import { createLeadWriter } from '@/lib/supabase/lead-writer'
import { notifyBroker } from '@/lib/notify'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(request: Request) {
  const result = await parseLead(request, enquirySchema, 'enquiry')
  if (!result.data) return result.response
  const { website: _hp, ...lead } = result.data
  void _hp
  if (!isSupabaseConfigured()) return NextResponse.json<LeadResponse>({ ok: true, demo: true })

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return NextResponse.json<LeadResponse>({ ok: false, message: 'Online enquiries are not ready. Please WhatsApp us.' }, { status: 503 })
  try {
  const { error } = await createLeadWriter()
    .from('enquiries')
    .insert({ ...lead, property_id: lead.property_id && UUID.test(lead.property_id) ? lead.property_id : null })
  if (error) {
    console.error('[enquiries]', error.message)
    return NextResponse.json<LeadResponse>({ ok: false, message: 'Could not save right now. Please WhatsApp us.' }, { status: 500 })
  }
  await notifyBroker('enquiry')
  return NextResponse.json<LeadResponse>({ ok: true })
  } catch {
    return NextResponse.json<LeadResponse>({ ok: false, message: 'Could not save right now. Please WhatsApp us.' }, { status: 503 })
  }
}
