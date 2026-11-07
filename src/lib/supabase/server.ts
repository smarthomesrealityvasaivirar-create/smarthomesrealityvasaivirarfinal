import 'server-only'
import { createServerClient } from '@supabase/ssr'
import { createClient as createPlainClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

/** Cookie-aware client (admin session). Use in admin pages, server actions and route handlers. */
export async function createClient() {
  const cookieStore = await cookies()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY!
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // Called from a Server Component: the proxy refreshes the session instead.
        }
      },
    },
  })
}

/**
 * Anonymous, cookie-free client for PUBLIC reads. Keeps public pages static/ISR-friendly
 * (reading cookies would force every page to render dynamically). RLS limits it to public rows.
 */
export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY!
  return createPlainClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
