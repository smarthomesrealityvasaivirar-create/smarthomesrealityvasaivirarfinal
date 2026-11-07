import { LoginForm } from '@/components/admin/LoginForm'
import { isSupabaseConfigured } from '@/lib/env'

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const sp = await searchParams
  return (
    <div className="flex min-h-dvh items-center justify-center bg-ink px-5">
      <div className="w-full max-w-sm bg-bone p-8">
        <h1 className="font-display text-3xl text-ink">Admin sign in</h1>
        {!isSupabaseConfigured() && (
          <p className="mt-4 border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">Demo mode: Supabase is not connected, so the admin opens read-only without a password.</p>
        )}
        {sp.error === 'not-allowed' && <p className="mt-4 text-sm text-red-700" role="alert">That account is not on the admin list.</p>}
        <LoginForm next={sp.next ?? ''} />
      </div>
    </div>
  )
}
