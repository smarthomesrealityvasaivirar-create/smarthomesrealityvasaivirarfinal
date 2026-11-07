import { PropertyForm } from '@/components/admin/PropertyForm'
import { requireAdmin } from '@/lib/auth'

export default async function NewProperty() {
  const admin = await requireAdmin()
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Add property</h1>
      <PropertyForm demo={admin.demo} />
    </div>
  )
}
