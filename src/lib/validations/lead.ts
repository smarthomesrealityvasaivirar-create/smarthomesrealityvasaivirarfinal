import { z } from 'zod'
import { normalizeIndianMobile } from '@/lib/utils/phone'
import { isISODate } from '@/lib/utils/date'

const phone = z
  .string()
  .trim()
  .transform((v, ctx) => {
    const n = normalizeIndianMobile(v)
    if (!n) {
      ctx.addIssue({ code: 'custom', message: 'Enter a valid 10-digit Indian mobile number' })
      return z.NEVER
    }
    return n
  })

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform(v => (v ? v : null))

/** Honeypot: real users never see or fill the "website" field. */
const honeypot = z.string().max(0, 'Spam detected').optional()

export const enquirySchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name').max(80),
  phone,
  email: z
    .string()
    .trim()
    .email('Enter a valid email')
    .optional()
    .or(z.literal(''))
    .transform(v => (v ? v : null)),
  message: optionalText(1000),
  visit_date: z
    .string()
    .refine(isISODate, 'Enter a valid date')
    .optional()
    .or(z.literal(''))
    .transform(v => (v ? v : null)),
  enquiry_type: z.enum(['general', 'property_visit', 'callback']).default('general'),
  property_id: z.string().max(64).optional().transform(v => v ?? null),
  property_title: optionalText(160),
  property_ref: optionalText(32),
  website: honeypot,
})
export type EnquiryInput = z.input<typeof enquirySchema>

export const sellRequestSchema = z.object({
  owner_name: z.string().trim().min(2, 'Please enter your name').max(80),
  phone,
  email: z
    .string()
    .trim()
    .email('Enter a valid email')
    .optional()
    .or(z.literal(''))
    .transform(v => (v ? v : null)),
  intention: z.enum(['sell', 'rent_out']),
  property_type: z.string().trim().min(2).max(60),
  locality: z.string().trim().min(2, 'Tell us the locality or building').max(120),
  expected_price: optionalText(60),
  description: optionalText(2000),
  website: honeypot,
})
export type SellRequestInput = z.input<typeof sellRequestSchema>

export function firstErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'form')
    if (!out[key]) out[key] = issue.message
  }
  return out
}
