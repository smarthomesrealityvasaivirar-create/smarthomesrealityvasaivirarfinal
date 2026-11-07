'use client'

import { MessageCircle, Send } from 'lucide-react'
import { Field } from '@/components/forms/Field'
import { Honeypot, useLeadSubmit } from '@/components/forms/useLeadSubmit'
import { SuccessPanel } from '@/components/forms/SuccessPanel'
import { propertyWhatsappUrl, generalWhatsappUrl } from '@/lib/utils/whatsapp'

type Props =
  | { mode: 'visit'; property: { id: string; title: string; reference_number: string; slug: string } }
  | { mode: 'contact'; property?: undefined }

export function EnquiryForm(props: Props) {
  const { state, errors, message, demo, submit, reset } = useLeadSubmit('/api/enquiries')
  const p = props.property
  const wa = p ? propertyWhatsappUrl(p) : generalWhatsappUrl()
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })

  if (state === 'done')
    return (
      <SuccessPanel
        title={p ? 'Visit request received' : 'Message received'}
        body="We usually call back within a few working hours, from one of the numbers listed on this site."
        demo={demo}
        whatsappHref={wa}
        onReset={reset}
      />
    )

  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={async e => {
        e.preventDefault()
        const form = e.currentTarget
        const f = new FormData(form)
        const ok = await submit({
          name: f.get('name'),
          phone: f.get('phone'),
          email: f.get('email') ?? '',
          message: f.get('message'),
          visit_date: f.get('visit_date') ?? '',
          website: f.get('website'),
          enquiry_type: p ? 'property_visit' : 'general',
          ...(p ? { property_id: p.id, property_title: p.title, property_ref: p.reference_number } : {}),
        })
        if (ok) form.reset()
      }}
    >
      <Honeypot />
      <Field label="Your name" name="name" required error={errors.name}>
        <input id="name" name="name" className="field" autoComplete="name" required aria-invalid={!!errors.name} />
      </Field>
      <Field label="Mobile / WhatsApp number" name="phone" required error={errors.phone} hint="10-digit Indian mobile">
        <input id="phone" name="phone" type="tel" inputMode="numeric" autoComplete="tel" className="field" required aria-invalid={!!errors.phone} placeholder="98XXX XXXXX" />
      </Field>
      {p ? (
        <Field label="Preferred visit date" name="visit_date" error={errors.visit_date}>
          <input id="visit_date" name="visit_date" type="date" min={today} className="field" />
        </Field>
      ) : (
        <Field label="Email (optional)" name="email" error={errors.email}>
          <input id="email" name="email" type="email" autoComplete="email" className="field" />
        </Field>
      )}
      <Field label={p ? 'Questions (optional)' : 'What are you looking for?'} name="message" error={errors.message}>
        <textarea id="message" name="message" rows={3} className="field" placeholder={p ? 'Pets allowed? Can I visit this evening?' : '2 BHK on rent, budget, preferred area...'} />
      </Field>
      {message && <p className="field-error" role="alert">{message}</p>}
      <button type="submit" disabled={state === 'sending'} className="btn-dark w-full">
        <Send className="h-4 w-4" aria-hidden /> {state === 'sending' ? 'Sending...' : p ? 'Book a site visit' : 'Send enquiry'}
      </button>
      <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-whatsapp w-full">
        <MessageCircle className="h-4 w-4" aria-hidden /> Or WhatsApp us now
      </a>
    </form>
  )
}
