import 'server-only'
import { site } from '@/config/site'

/**
 * New-lead alerts. Client chose WhatsApp (5 Nov 2026).
 * 1) WhatsApp via CallMeBot (free, personal alerts to ONE number): set CALLMEBOT_PHONE + CALLMEBOT_APIKEY.
 *    Setup: from the broker's phone send "I allow callmebot to send me messages" to +34 644 71 99 25 on WhatsApp,
 *    you get an API key back. (Third-party free service: fine for alerts, not for customer messages.)
 * 2) Optional email via Resend: RESEND_API_KEY + RESEND_FROM_EMAIL (+ LEAD_NOTIFY_EMAIL).
 * Failures never block the lead, which is already saved.
 */
export async function notifyBroker(kind: 'enquiry' | 'owner') {
  const subject = kind === 'owner' ? 'New owner request' : 'New website enquiry'
  const path = kind === 'owner' ? '/admin/sell-requests' : '/admin/enquiries'
  const entries: [string, string][] = [['Review securely', `${site.url}${path}`]]
  const outcomes = await Promise.allSettled([sendWhatsapp(subject, entries), sendEmail(subject, entries)])
  outcomes.forEach((result, i) => {
    if (result.status === 'rejected') console.warn(`[notifications] ${i === 0 ? 'WhatsApp' : 'email'} delivery failed`)
  })
}

async function sendWhatsapp(subject: string, entries: [string, string][]) {
  const phone = process.env.CALLMEBOT_PHONE
  const apikey = process.env.CALLMEBOT_APIKEY
  if (!phone || !apikey) return
  const text = [`*${subject}*`, ...entries.map(([k, v]) => `${k}: ${v}`)].join('\n')
  const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(apikey)}`
  const response = await fetch(url, { signal: AbortSignal.timeout(6000) })
  if (!response.ok) throw new Error('WhatsApp notification failed')
}

async function sendEmail(subject: string, entries: [string, string][]) {
  const key = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM_EMAIL
  if (!key || !from) return
  const esc = (s: string) => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string)
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: process.env.LEAD_NOTIFY_EMAIL || site.email,
      subject,
      html: entries.map(([k, v]) => `<p><strong>${esc(k)}:</strong> ${esc(v)}</p>`).join(''),
    }),
    signal: AbortSignal.timeout(6000),
  })
  if (!response.ok) throw new Error('Email notification failed')
}
