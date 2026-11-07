'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'
import { Field } from '@/components/forms/Field'
import { Honeypot, useLeadSubmit } from '@/components/forms/useLeadSubmit'
import { SuccessPanel } from '@/components/forms/SuccessPanel'
import { generalWhatsappUrl } from '@/lib/utils/whatsapp'

const TYPES = ['1 RK', '1BHK Flat', '2BHK Flat', '3BHK Flat', 'Shop', 'Office', 'Plot']

/** Owners submit details only (no photos, per client). Nothing is published until the broker reviews it. */
export function SellForm() {
  const [intention, setIntention] = useState<'rent_out' | 'sell'>('rent_out')
  const { state, errors, message, demo, submit, reset } = useLeadSubmit('/api/sell-requests')

  if (state === 'done')
    return (
      <SuccessPanel
        title="Thank you, we have your details"
        body="Our team will call you to arrange a visit. Your property is NOT published until we have seen it and you approve the listing."
        demo={demo}
        whatsappHref={generalWhatsappUrl()}
        onReset={reset}
      />
    )

  return (
    <form
      noValidate
      className="space-y-5"
      onSubmit={async e => {
        e.preventDefault()
        const f = new FormData(e.currentTarget)
        await submit({
          owner_name: f.get('owner_name'),
          phone: f.get('phone'),
          email: f.get('email') ?? '',
          intention,
          property_type: f.get('property_type'),
          locality: f.get('locality'),
          expected_price: f.get('expected_price'),
          description: f.get('description'),
          website: f.get('website'),
        })
      }}
    >
      <Honeypot />
      <fieldset>
        <legend className="field-label">I want to</legend>
        <div className="grid grid-cols-2 gap-2">
          {(['rent_out', 'sell'] as const).map(v => (
            <button key={v} type="button" aria-pressed={intention === v} onClick={() => setIntention(v)} className={intention === v ? 'btn-dark' : 'btn-outline'}>
              {v === 'rent_out' ? 'Rent it out' : 'Sell it'}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Owner name" name="owner_name" required error={errors.owner_name}>
          <input id="owner_name" name="owner_name" className="field" autoComplete="name" />
        </Field>
        <Field label="Mobile / WhatsApp" name="phone" required error={errors.phone}>
          <input id="phone" name="phone" type="tel" inputMode="numeric" className="field" autoComplete="tel" />
        </Field>
        <Field label="Property type" name="property_type" required error={errors.property_type}>
          <select id="property_type" name="property_type" className="field" defaultValue="2BHK Flat">
            {TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Locality / building" name="locality" required error={errors.locality}>
          <input id="locality" name="locality" className="field" placeholder="e.g. Global City, Virar West" />
        </Field>
        <Field label={intention === 'rent_out' ? 'Expected rent per month' : 'Expected price'} name="expected_price" error={errors.expected_price}>
          <input id="expected_price" name="expected_price" className="field" placeholder={intention === 'rent_out' ? '₹15,000' : '₹45 Lacs'} />
        </Field>
        <Field label="Email (optional)" name="email" error={errors.email}>
          <input id="email" name="email" type="email" className="field" autoComplete="email" />
        </Field>
      </div>
      <Field label="Details" name="description" error={errors.description}>
        <textarea id="description" name="description" rows={4} className="field" placeholder="Floor, furnishing, parking, OC status, tenant preference..." />
      </Field>
      {message && <p className="field-error" role="alert">{message}</p>}
      <button type="submit" disabled={state === 'sending'} className="btn-dark w-full sm:w-auto">
        <Send className="h-4 w-4" aria-hidden /> {state === 'sending' ? 'Sending...' : 'Send my property details'}
      </button>
    </form>
  )
}
