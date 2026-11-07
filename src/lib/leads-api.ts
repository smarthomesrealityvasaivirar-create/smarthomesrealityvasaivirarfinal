import 'server-only'
import { NextResponse } from 'next/server'
import type { z } from 'zod'
import { firstErrors } from '@/lib/validations/lead'
import { rateLimit } from '@/lib/rate-limit'

export type LeadResponse = { ok: true; demo?: boolean } | { ok: false; message: string; errors?: Record<string, string> }

export async function parseLead<S extends z.ZodTypeAny>(request: Request, schema: S, bucket: string) {
  if (!request.headers.get('content-type')?.includes('application/json')) {
    return { response: NextResponse.json<LeadResponse>({ ok: false, message: 'Expected JSON' }, { status: 415 }) }
  }
  const origin = request.headers.get('origin')
  if (origin && origin !== new URL(request.url).origin) {
    return { response: NextResponse.json<LeadResponse>({ ok: false, message: 'Invalid origin' }, { status: 403 }) }
  }
  // Trust the Vercel-provided header only on Vercel. This remains a best-effort per-instance limiter.
  const ip = process.env.VERCEL
    ? request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    : 'local'
  if (!rateLimit(`${bucket}:${ip}`, 5, 10 * 60_000)) {
    return { response: NextResponse.json<LeadResponse>({ ok: false, message: 'Too many requests. Please WhatsApp us instead.' }, { status: 429 }) }
  }
  let body: unknown
  try {
    const max = 16 * 1024
    if (Number(request.headers.get('content-length') || 0) > max) throw new Error('too large')
    const reader = request.body?.getReader()
    if (!reader) throw new Error('empty')
    const chunks: Uint8Array[] = []
    let size = 0
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > max) { await reader.cancel(); throw new Error('too large') }
      chunks.push(value)
    }
    const bytes = new Uint8Array(size)
    let offset = 0
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length }
    body = JSON.parse(new TextDecoder().decode(bytes))
  } catch {
    return { response: NextResponse.json<LeadResponse>({ ok: false, message: 'Invalid request' }, { status: 400 }) }
  }
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    const errors = firstErrors(parsed.error)
    // Honeypot hit: pretend success so bots learn nothing
    if (errors.website) return { response: NextResponse.json<LeadResponse>({ ok: true }) }
    return { response: NextResponse.json<LeadResponse>({ ok: false, message: 'Please check the form', errors }, { status: 422 }) }
  }
  return { data: parsed.data as z.output<S> }
}
