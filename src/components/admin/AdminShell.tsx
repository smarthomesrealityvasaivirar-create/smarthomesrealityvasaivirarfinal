'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Building2, ExternalLink, Inbox, KeyRound, LayoutDashboard, LogOut, Menu, PlusCircle, Settings, X } from 'lucide-react'
import { signOut } from '@/lib/actions/auth'
import { cn } from '@/lib/utils/cn'

const NAV = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/properties', label: 'Properties', icon: Building2 },
  { href: '/admin/properties/new', label: 'Add property', icon: PlusCircle },
  { href: '/admin/enquiries', label: 'Enquiries', icon: Inbox },
  { href: '/admin/sell-requests', label: 'Owner requests', icon: KeyRound },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export function AdminShell({ email, demo, children }: { email: string; demo: boolean; children: React.ReactNode }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const nav = (
    <nav className="space-y-1 p-3">
      {NAV.map(n => {
        const active = pathname === n.href || (n.href === '/admin/properties' && pathname.startsWith('/admin/properties/') && !pathname.endsWith('/new'))
        return (
          <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className={cn('flex min-h-11 items-center gap-3 px-3 text-sm', active ? 'bg-gold font-semibold text-ink' : 'text-bone/80 hover:bg-white/5')}>
            <n.icon className="h-4 w-4" aria-hidden />
            {n.label}
          </Link>
        )
      })}
    </nav>
  )
  return (
    <div className="lg:flex">
      <aside className="hidden w-60 shrink-0 bg-ink text-bone lg:fixed lg:inset-y-0 lg:flex lg:flex-col">
        <div className="border-b border-white/10 p-5 font-display text-lg">Smart Home Reality<span className="block font-mono text-xs uppercase tracking-wide2 text-gold-light">Admin</span></div>
        <div className="flex-1">{nav}</div>
        <div className="space-y-2 border-t border-white/10 p-4 text-sm">
          <p className="truncate text-bone/60">{email}</p>
          <Link href="/" target="_blank" className="flex items-center gap-2 text-gold-light">View website <ExternalLink className="h-3.5 w-3.5" aria-hidden /></Link>
          <form action={signOut}><button type="submit" className="flex min-h-11 items-center gap-2 text-red-300"><LogOut className="h-4 w-4" aria-hidden /> Sign out</button></form>
        </div>
      </aside>
      <div className="flex-1 lg:pl-60">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between bg-ink px-4 text-bone lg:hidden">
          <span className="font-display">SHR Admin</span>
          <button type="button" onClick={() => setOpen(o => !o)} aria-expanded={open} aria-label="Menu" className="inline-flex h-11 w-11 items-center justify-center">{open ? <X /> : <Menu />}</button>
        </header>
        {open && (
          <div className="bg-ink text-bone lg:hidden">
            {nav}
            <form action={signOut} className="px-6 pb-4"><button type="submit" className="min-h-11 text-sm text-red-300">Sign out</button></form>
          </div>
        )}
        {demo && <div className="bg-amber-100 px-4 py-2 text-center text-sm text-amber-900">Demo mode: showing sample data. Changes are not saved until Supabase is connected (see README).</div>}
        <main className="mx-auto max-w-6xl p-4 sm:p-8">{children}</main>
      </div>
    </div>
  )
}
