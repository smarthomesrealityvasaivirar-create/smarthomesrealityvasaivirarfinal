import { z } from 'zod'
import { isImageUrl } from '@/lib/utils/image-url'
import { isISODate } from '@/lib/utils/date'

const intOrNull = z
  .union([z.number(), z.string()])
  .optional()
  .nullable()
  .transform((v, ctx) => {
    if (v === '' || v === null || v === undefined) return null
    const n = Number(v)
    if (!Number.isInteger(n) || n < 0) {
      ctx.addIssue({ code: 'custom', message: 'Must be a whole number' })
      return z.NEVER
    }
    return n
  })

export const imageSchema = z.object({
  id: z.string().optional(),
  url: z.string().refine(isImageUrl, 'Use an uploaded photo, an Unsplash URL, or a configured Supabase Storage URL'),
  storage_path: z.string().nullable().optional(),
  alt_text: z.string().max(140).nullable().optional(),
  is_cover: z.boolean(),
})

export const propertySchema = z
  .object({
    id: z.string().uuid().optional(),
    title: z.string().trim().min(5, 'Title needs at least 5 characters').max(140),
    slug: z
      .string()
      .trim()
      .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Use lower-case letters, numbers and dashes'),
    purpose: z.enum(['buy', 'rent']),
    category: z.enum(['apartment', 'commercial', 'plot']),
    bhk_type: z.string().trim().max(20).optional().nullable().transform(v => v || null),
    price: z.coerce.number().positive('Enter a price'),
    price_unit: z.enum(['lacs', 'crores', 'per_month', 'per_sqft']),
    price_negotiable: z.boolean(),
    area_sqft: intOrNull.refine(v => v === null || v > 0, 'Area must be greater than zero'),
    area_type: z.enum(['carpet', 'built_up', 'plot_area']).nullable(),
    locality: z.string().trim().min(2, 'Locality is required').max(120),
    city: z.string().trim().min(2).max(60),
    full_address: z.string().trim().max(240).optional().nullable().transform(v => v || null),
    floor: intOrNull,
    total_floors: intOrNull,
    bedrooms: intOrNull,
    bathrooms: intOrNull,
    balconies: intOrNull,
    parking: intOrNull,
    furnishing: z.enum(['unfurnished', 'semi-furnished', 'furnished']).nullable(),
    tenant_preference: z.enum(['any', 'family', 'bachelor']),
    direct_owner: z.boolean(),
    age_years: intOrNull,
    available_from: z
      .string()
      .optional()
      .nullable()
      .refine(v => !v || isISODate(v), 'Enter a valid date')
      .transform(v => (v ? v : null)),
    description: z.string().trim().min(30, 'Write at least 30 characters').max(5000),
    highlights: z.array(z.string().trim().min(1).max(120)).max(12),
    amenities: z.array(z.string().trim().min(1).max(60)).max(30),
    status: z.enum(['draft', 'published', 'sold', 'rented', 'archived']),
    featured: z.boolean(),
    images: z.array(imageSchema).max(15, 'Maximum 15 photos per property'),
  })
  .superRefine((v, ctx) => {
    if (v.status === 'sold' && v.purpose !== 'buy') ctx.addIssue({ code: 'custom', path: ['status'], message: 'Only sale listings can be Sold' })
    if (v.status === 'rented' && v.purpose !== 'rent') ctx.addIssue({ code: 'custom', path: ['status'], message: 'Only rental listings can be Rented' })
    if (v.purpose === 'buy' && v.price_unit === 'per_month')
      ctx.addIssue({ code: 'custom', path: ['price_unit'], message: 'Sale listings cannot use monthly rent' })
    if (v.purpose === 'rent' && !(v.price_unit === 'per_month' || (v.category === 'commercial' && v.price_unit === 'per_sqft')))
      ctx.addIssue({ code: 'custom', path: ['price_unit'], message: 'Use monthly rent, or per sq ft for commercial rentals' })
    if (v.status === 'published' && v.images.length === 0)
      ctx.addIssue({ code: 'custom', path: ['images'], message: 'Add at least one photo before publishing' })
    if (v.floor !== null && v.total_floors !== null && v.floor > v.total_floors)
      ctx.addIssue({ code: 'custom', path: ['floor'], message: 'Floor is higher than total floors' })
  })

export type PropertyFormInput = z.input<typeof propertySchema>
export type PropertyFormValues = z.output<typeof propertySchema>
