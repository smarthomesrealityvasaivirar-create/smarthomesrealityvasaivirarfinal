import 'server-only'
import { createClient } from '@supabase/supabase-js'

/** Only API routes may import this. Never expose this secret to client components. */
export function createLeadWriter() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) throw new Error('Lead storage is not configured')
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
