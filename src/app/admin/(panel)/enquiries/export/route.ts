import { getAdmin } from '@/lib/auth'
import { adminListEnquiries } from '@/lib/queries/admin'

const cell = (v: unknown) => {
  const s = v === null || v === undefined ? '' : String(v)
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s // block CSV formula injection in Excel
  return `"${safe.replace(/"/g, '""')}"`
}

export async function GET(request: Request) {
  const admin = await getAdmin()
  if (!admin) return new Response('Unauthorized', { status: 401 })
  const sp = new URL(request.url).searchParams
  const { rows } = await adminListEnquiries({ status: sp.get('status') ?? undefined, from: sp.get('from') ?? undefined, to: sp.get('to') ?? undefined }, true)
  const head = ['created_at', 'name', 'phone', 'email', 'enquiry_type', 'property_ref', 'property_title', 'visit_date', 'status', 'message', 'notes']
  const csv = [head.join(','), ...rows.map(r => head.map(h => cell(r[h as keyof typeof r])).join(','))].join('\r\n')
  return new Response('\uFEFF' + csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="enquiries-${new Date().toISOString().slice(0, 10)}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}
