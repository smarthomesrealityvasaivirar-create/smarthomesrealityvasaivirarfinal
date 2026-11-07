import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'
import { adminEmails, isSupabaseConfigured } from '@/lib/env'

/**
 * Next.js 16 "proxy" (formerly middleware). First line of defence for /admin.
 * Every admin page and server action ALSO re-checks the session (requireAdmin), so this is not the only gate.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (!isSupabaseConfigured()) return NextResponse.next() // demo mode: admin shows mock data, writes are disabled

  const { response, email } = await updateSession(request)
  const isLogin = pathname === '/admin/login'
  const allowed = !!email && adminEmails().includes(email)

  if (!allowed && !isLogin) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    url.search = email ? '?error=not-allowed' : `?next=${encodeURIComponent(pathname)}`
    return NextResponse.redirect(url)
  }
  // Do not redirect the login page on the email allowlist alone.
  // The database may not authorize this email yet; doing so would create a redirect loop.
  return response
}

export const config = {
  matcher: ['/admin/:path*'],
}
