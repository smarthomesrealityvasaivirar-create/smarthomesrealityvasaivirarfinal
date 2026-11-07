'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { adminEmails, isSupabaseConfigured } from '@/lib/env'
import { rateLimit } from '@/lib/rate-limit'
import { headers } from 'next/headers'

export async function signIn(_prev: { error: string | null }, formData: FormData): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured()) redirect('/admin/dashboard')
  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (!rateLimit(`login:${ip}`, 8, 10 * 60_000)) return { error: 'Too many attempts. Try again in 10 minutes.' }

  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')
  if (!email || !password) return { error: 'Enter email and password' }
  if (!adminEmails().includes(email)) return { error: 'This email is not allowed to access the admin' }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: 'Wrong email or password' }
  const membership = await supabase.rpc('is_admin')
  if (membership.error || membership.data !== true) {
    await supabase.auth.signOut()
    return { error: 'Admin setup is incomplete. Add this same email to public.admins in Supabase.' }
  }
  const next = String(formData.get('next') ?? '')
  redirect(next.startsWith('/admin') && !next.startsWith('/admin/login') ? next : '/admin/dashboard')
}

export async function signOut() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient()
    await supabase.auth.signOut()
  }
  redirect('/admin/login')
}
