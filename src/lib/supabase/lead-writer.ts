import 'server-only'
import { createClient } from '@supabase/supabase-js'

/** Only API routes may import this. Never expose this secret to client components. */
export function createLeadWriter() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY
  if (!url || !key) throw new Error('Lead storage is not configured')
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
