import { NextResponse } from 'next/server'
import { sellRequestSchema } from '@/lib/validations/lead'
import { parseLead, type LeadResponse } from '@/lib/leads-api'
import { isSupabaseConfigured } from '@/lib/env'
import { createLeadWriter } from '@/lib/supabase/lead-writer'
import { notifyBroker } from '@/lib/notify'

export async function POST(request: Request) {
  const result = await parseLead(request, sellRequestSchema, 'sell')
  if (!result.data) return result.response
  const { website: _hp, ...req } = result.data
  void _hp
  if (!isSupabaseConfigured()) return NextResponse.json<LeadResponse>({ ok: true, demo: true })

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return NextResponse.json<LeadResponse>({ ok: false, message: 'Online enquiries are not ready. Please WhatsApp us.' }, { status: 503 })
  try {
  const { error } = await createLeadWriter().from('sell_requests').insert(req)
  if (error) {
    console.error('[sell-requests]', error.message)
    return NextResponse.json<LeadResponse>({ ok: false, message: 'Could not save right now. Please WhatsApp us.' }, { status: 500 })
  }
  await notifyBroker('owner')
  return NextResponse.json<LeadResponse>({ ok: true })
  } catch {
    return NextResponse.json<LeadResponse>({ ok: false, message: 'Could not save right now. Please WhatsApp us.' }, { status: 503 })
  }
}
