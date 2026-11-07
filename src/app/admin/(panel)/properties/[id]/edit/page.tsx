import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PropertyForm } from '@/components/admin/PropertyForm'
import { adminGetProperty } from '@/lib/queries/admin'
import { requireAdmin } from '@/lib/auth'

export default async function EditProperty({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  const property = await adminGetProperty((await params).id)
  if (!property) notFound()
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl">Edit property</h1>
        <Link href={`/properties/${property.slug}`} target="_blank" className="btn-outline">View on site</Link>
      </div>
      <PropertyForm property={property} demo={admin.demo} />
    </div>
  )
}
