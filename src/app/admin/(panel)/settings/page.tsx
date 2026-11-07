import { site, fullAddress } from '@/config/site'
import { isSupabaseConfigured } from '@/lib/env'
import { formatIndianMobile } from '@/lib/utils/whatsapp'

/** Read-only view. Contact details live in one file (src/config/site.ts) so a change updates every page. */
export default function Settings() {
  const rows: [string, string][] = [
    ['WhatsApp (all buttons)', `+${site.whatsapp}`],
    ['Header call button', site.phone.display],
    ['Email', site.email],
    ['Address', fullAddress],
    ['Hours', site.hours.label],
    ['Team', site.team.map(t => `${t.name} ${formatIndianMobile(t.phone)}`).join(', ')],
    ['RERA agent number', site.reraAgentNumber ?? 'Hidden (none provided)'],
    ['Database', isSupabaseConfigured() ? 'Credentials configured (verify by saving a test listing)' : 'Demo mode (not connected)'],
    ['WhatsApp lead alerts', process.env.CALLMEBOT_APIKEY ? `On (to +${process.env.CALLMEBOT_PHONE})` : 'Off (set CALLMEBOT_PHONE + CALLMEBOT_APIKEY)'],
    ['Email lead alerts', process.env.RESEND_API_KEY ? 'On' : 'Off (optional)'],
  ]
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Settings</h1>
      <dl className="divide-y divide-ink/10 border border-ink/10 bg-white">
        {rows.map(([k, v]) => (
          <div key={k} className="grid gap-1 p-4 sm:grid-cols-[220px_1fr]">
            <dt className="text-sm text-stone">{k}</dt>
            <dd className="text-ink">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="text-sm text-stone">To change contact details, edit <code>src/config/site.ts</code> and redeploy (or ask your developer). Alerts and database keys are set in Vercel &rarr; Settings &rarr; Environment Variables.</p>
    </div>
  )
}
