import { requireAdmin } from '@/lib/auth'
import { AdminShell } from '@/components/admin/AdminShell'
import { ToastProvider } from '@/components/admin/Toast'

export const dynamic = 'force-dynamic'

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin()
  return (
    <ToastProvider>
      <AdminShell email={admin.email} demo={admin.demo}>{children}</AdminShell>
    </ToastProvider>
  )
}
