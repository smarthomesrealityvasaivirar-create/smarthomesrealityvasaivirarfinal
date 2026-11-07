import 'server-only'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { adminEmails, isSupabaseConfigured } from '@/lib/env'

export type AdminSession = { email: string; demo: boolean }

/** Returns the admin session or null. In demo mode (no Supabase) returns a read-only demo session. */
export async function getAdmin(): Promise<AdminSession | null> {
  if (!isSupabaseConfigured()) return { email: 'demo@localhost', demo: true }
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  const email = data.user?.email?.toLowerCase()
  if (!email || !adminEmails().includes(email)) return null
  const { data: databaseAdmin, error } = await supabase.rpc('is_admin')
  if (error || databaseAdmin !== true) return null
  return { email, demo: false }
}

/** Use at the top of every admin page. */
export async function requireAdmin(): Promise<AdminSession> {
  const admin = await getAdmin()
  if (!admin) redirect('/admin/login')
  return admin
}

export class AuthError extends Error {}

/** Use at the top of every admin server action. Throws instead of redirecting. Demo mode is rejected. */
export async function assertAdminWrite(): Promise<AdminSession> {
  const admin = await getAdmin()
  if (!admin) throw new AuthError('Not signed in')
  if (admin.demo) throw new AuthError('Demo mode: connect Supabase to save changes')
  return admin
}
