'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Save } from 'lucide-react'
import { saveProperty } from '@/lib/actions/properties'
import { propertySchema, type PropertyFormInput } from '@/lib/validations/property'
import { firstErrors } from '@/lib/validations/lead'
import { slugify } from '@/lib/utils/slug'
import { ImageUploader, type UploadItem } from '@/components/admin/ImageUploader'
import { TagInput } from '@/components/admin/TagInput'
import { useActionToast } from '@/components/admin/Toast'
import { Field } from '@/components/forms/Field'
import type { Property } from '@/types/property'

const AMENITIES = ['Lift', 'Power backup', 'Security / CCTV', 'Reserved parking', 'Piped gas', 'Gym', 'Swimming pool', 'Children play area', '24h water']

type Form = Omit<PropertyFormInput, 'images'>

function initial(p?: Property): Form {
  return {
    id: p?.id,
    title: p?.title ?? '',
    slug: p?.slug ?? '',
    purpose: p?.purpose ?? 'rent',
    category: p?.category ?? 'apartment',
    bhk_type: p?.bhk_type ?? '2BHK',
    price: p?.price ?? '',
    price_unit: p?.price_unit ?? 'per_month',
    price_negotiable: p?.price_negotiable ?? false,
    area_sqft: p?.area_sqft ?? '',
    area_type: p?.area_type ?? 'carpet',
    locality: p?.locality ?? '',
    city: p?.city ?? 'Vasai-Virar',
    full_address: p?.full_address ?? '',
    floor: p?.floor ?? '',
    total_floors: p?.total_floors ?? '',
    bedrooms: p?.bedrooms ?? '',
    bathrooms: p?.bathrooms ?? '',
    balconies: p?.balconies ?? '',
    parking: p?.parking ?? '',
    furnishing: p?.furnishing ?? 'semi-furnished',
    tenant_preference: p?.tenant_preference ?? 'any',
    direct_owner: p?.direct_owner ?? false,
    age_years: p?.age_years ?? '',
    available_from: p?.available_from ?? '',
    description: p?.description ?? '',
    highlights: p?.highlights ?? [],
    amenities: p?.amenities ?? [],
    status: p?.status ?? 'draft',
    featured: p?.featured ?? false,
  }
}

export function PropertyForm({ property, demo }: { property?: Property; demo: boolean }) {
  const router = useRouter()
  const toast = useActionToast()
  const [pending, start] = useTransition()
  const [f, setF] = useState<Form>(() => initial(property))
  const [slugTouched, setSlugTouched] = useState(!!property)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [dirty, setDirty] = useState(false)
  const [folderId] = useState(() => property?.id ?? `new-${crypto.randomUUID()}`)
  const [images, setImages] = useState<UploadItem[]>(() =>
    (property?.images ?? []).map(i => ({ key: i.id, url: i.url, storage_path: i.storage_path, alt_text: i.alt_text ?? '', is_cover: i.is_cover, status: 'done' as const, progress: 100 }))
  )

  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    setDirty(true)
    setF(prev => {
      const next = { ...prev, [k]: v }
      if (k === 'title' && !slugTouched) next.slug = slugify(String(v))
      if (k === 'purpose') next.price_unit = v === 'rent' ? 'per_month' : 'lacs'
      if (k === 'category' && v !== 'commercial' && next.purpose === 'rent') next.price_unit = 'per_month'
      return next
    })
  }

  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const uploading = images.some(i => i.status === 'uploading')
  const failed = images.some(i => i.status === 'error')
  const payload = useMemo(
    () => ({ ...f, images: images.filter(i => i.status === 'done').map(i => ({ url: i.url, storage_path: i.storage_path, alt_text: i.alt_text || null, is_cover: i.is_cover })) }),
    [f, images]
  )

  function submit(status: Form['status']) {
    const data = { ...payload, status }
    const check = propertySchema.safeParse(data)
    if (!check.success) {
      setErrors(firstErrors(check.error))
      toast({ ok: false, message: 'Please fix the highlighted fields' })
      document.querySelector('[aria-invalid="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    setErrors({})
    start(async () => {
      const r = await saveProperty(data)
      toast(r)
      if (r.ok) {
        setDirty(false)
        if (r.data && !property) router.replace(`/admin/properties/${r.data.id}/edit`)
        router.refresh()
      } else if (r.errors) setErrors(r.errors)
    })
  }

  const num = (k: keyof Form, label: string) => (
    <Field label={label} name={k} error={errors[k]}>
      <input id={k} type="number" inputMode="numeric" min={0} className="field" value={String(f[k] ?? '')} onChange={e => set(k, e.target.value as never)} aria-invalid={!!errors[k]} />
    </Field>
  )

  return (
    <form className="space-y-8" onSubmit={e => (e.preventDefault(), submit(f.status))} noValidate>
      <section className="space-y-4 border border-ink/10 bg-white p-5">
        <h2 className="font-display text-xl">Photos</h2>
        <ImageUploader folderId={folderId} items={images} onChange={fn => (setDirty(true), setImages(fn))} demo={demo} />
        {errors.images && <p className="field-error">{errors.images}</p>}
      </section>

      <section className="grid gap-4 border border-ink/10 bg-white p-5 sm:grid-cols-2">
        <h2 className="font-display text-xl sm:col-span-2">Basics</h2>
        <Field label="Title" name="title" required error={errors.title} className="sm:col-span-2">
          <input id="title" className="field" value={f.title} onChange={e => set('title', e.target.value)} aria-invalid={!!errors.title} />
        </Field>
        <Field label="URL slug" name="slug" required error={errors.slug} hint={`/properties/${f.slug || '...'}`} className="sm:col-span-2">
          <input id="slug" className="field" value={f.slug} onChange={e => (setSlugTouched(true), set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')))} onBlur={() => set('slug', slugify(f.slug))} aria-invalid={!!errors.slug} />
        </Field>
        <Field label="Purpose" name="purpose" required>
          <select id="purpose" className="field" value={f.purpose} onChange={e => set('purpose', e.target.value as Form['purpose'])}>
            <option value="rent">For rent</option>
            <option value="buy">For sale</option>
          </select>
        </Field>
        <Field label="Category" name="category" required>
          <select id="category" className="field" value={f.category} onChange={e => set('category', e.target.value as Form['category'])}>
            <option value="apartment">Apartment</option>
            <option value="commercial">Shop / office</option>
            <option value="plot">Plot</option>
          </select>
        </Field>
        <Field label="Configuration" name="bhk_type">
          <select id="bhk_type" className="field" value={f.bhk_type ?? ''} onChange={e => set('bhk_type', e.target.value)}>
            <option value="">Not applicable</option>
            {['1RK', '1BHK', '2BHK', '3BHK', '4BHK'].map(b => <option key={b}>{b}</option>)}
          </select>
        </Field>
        <Field label="Locality" name="locality" required error={errors.locality}>
          <input id="locality" className="field" list="localities" value={f.locality} onChange={e => set('locality', e.target.value)} aria-invalid={!!errors.locality} placeholder="Tirupati Nagar, Virar West" />
        </Field>
        <Field label="Full address (optional)" name="full_address" className="sm:col-span-2">
          <input id="full_address" className="field" value={f.full_address ?? ''} onChange={e => set('full_address', e.target.value)} />
        </Field>
      </section>

      <section className="grid gap-4 border border-ink/10 bg-white p-5 sm:grid-cols-3">
        <h2 className="font-display text-xl sm:col-span-3">Price</h2>
        <Field label={f.price_unit === 'per_month' ? 'Rent (₹ per month)' : f.price_unit === 'lacs' ? 'Price (₹ lacs)' : 'Price'} name="price" required error={errors.price}>
          <input id="price" type="number" step="any" min={0} className="field" value={String(f.price ?? '')} onChange={e => set('price', e.target.value)} aria-invalid={!!errors.price} />
        </Field>
        <Field label="Unit" name="price_unit" error={errors.price_unit}>
          <select id="price_unit" className="field" value={f.price_unit} onChange={e => set('price_unit', e.target.value as Form['price_unit'])}>
            {f.purpose === 'rent' && <option value="per_month">per month</option>}
            {f.purpose === 'buy' && <><option value="lacs">lacs</option><option value="crores">crores</option></>}
            {(f.purpose === 'buy' || f.category === 'commercial') && <option value="per_sqft">per sq ft{f.purpose === 'rent' ? ' per month' : ''}</option>}
          </select>
        </Field>
        <label className="flex min-h-11 items-center gap-3 self-end"><input type="checkbox" className="h-5 w-5" checked={f.price_negotiable} onChange={e => set('price_negotiable', e.target.checked)} /> Negotiable</label>
      </section>

      <section className="grid gap-4 border border-ink/10 bg-white p-5 sm:grid-cols-4">
        <h2 className="font-display text-xl sm:col-span-4">Details</h2>
        {num('area_sqft', 'Area (sq ft)')}
        <Field label="Area type" name="area_type">
          <select id="area_type" className="field" value={f.area_type ?? ''} onChange={e => set('area_type', (e.target.value || null) as Form['area_type'])}>
            <option value="carpet">Carpet</option>
            <option value="built_up">Built-up</option>
            <option value="plot_area">Plot</option>
          </select>
        </Field>
        {num('floor', 'Floor')}
        {num('total_floors', 'Total floors')}
        {num('bedrooms', 'Bedrooms')}
        {num('bathrooms', 'Bathrooms')}
        {num('balconies', 'Balconies')}
        {num('parking', 'Parking spots')}
        <Field label="Furnishing" name="furnishing">
          <select id="furnishing" className="field" value={f.furnishing ?? ''} onChange={e => set('furnishing', (e.target.value || null) as Form['furnishing'])}>
            <option value="unfurnished">Unfurnished</option>
            <option value="semi-furnished">Semi-furnished</option>
            <option value="furnished">Furnished</option>
          </select>
        </Field>
        <Field label="Tenants" name="tenant_preference">
          <select id="tenant_preference" className="field" value={f.tenant_preference} onChange={e => set('tenant_preference', e.target.value as Form['tenant_preference'])}>
            <option value="any">Family or bachelor</option>
            <option value="family">Family only</option>
            <option value="bachelor">Bachelor friendly</option>
          </select>
        </Field>
        {num('age_years', 'Building age (yrs)')}
        <Field label="Available from" name="available_from">
          <input id="available_from" type="date" className="field" value={f.available_from ?? ''} onChange={e => set('available_from', e.target.value)} />
        </Field>
        <label className="flex min-h-11 items-center gap-3 sm:col-span-2"><input type="checkbox" className="h-5 w-5" checked={f.direct_owner} onChange={e => set('direct_owner', e.target.checked)} /> Direct owner listing</label>
        <label className="flex min-h-11 items-center gap-3 sm:col-span-2"><input type="checkbox" className="h-5 w-5" checked={f.featured} onChange={e => set('featured', e.target.checked)} /> Featured on homepage</label>
        {errors.floor && <p className="field-error sm:col-span-4">{errors.floor}</p>}
      </section>

      <section className="space-y-4 border border-ink/10 bg-white p-5">
        <h2 className="font-display text-xl">Description</h2>
        <Field label="Description" name="description" required error={errors.description}>
          <textarea id="description" rows={6} className="field" value={f.description} onChange={e => set('description', e.target.value)} aria-invalid={!!errors.description} />
        </Field>
        <Field label="Highlights" name="highlights"><TagInput id="highlights" value={f.highlights} onChange={v => set('highlights', v)} placeholder="5 min from Virar station" /></Field>
        <Field label="Amenities" name="amenities"><TagInput id="amenities" value={f.amenities} onChange={v => set('amenities', v)} suggestions={AMENITIES} /></Field>
      </section>

      <div className="sticky bottom-0 z-20 flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 bg-[#f4f3f0]/95 py-3 backdrop-blur">
        <p className="text-sm text-stone">
          {property ? <>Ref {property.reference_number} &middot; </> : 'Reference number is created on first save. '}
          {uploading && 'Photos still uploading... '}
          {failed && 'Some photos failed (retry or delete them). '}
          {errors.status && <span className="text-red-700">{errors.status}</span>}
        </p>
        <div className="flex flex-wrap gap-2">
          <select aria-label="Status" className="field w-40" value={f.status} onChange={e => set('status', e.target.value as Form['status'])}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            {f.purpose === 'rent' ? <option value="rented">Rented</option> : <option value="sold">Sold</option>}
            <option value="archived">Archived</option>
          </select>
          <button type="button" disabled={demo || pending || uploading || failed} className="btn-outline" onClick={() => submit('draft')}>Save draft</button>
          <button type="button" disabled={demo || pending || uploading || failed} className="btn-dark" onClick={() => submit(f.status === 'draft' ? 'published' : f.status)}>
            <Save className="h-4 w-4" aria-hidden /> {pending ? 'Saving...' : f.status === 'draft' ? 'Publish' : 'Save'}
          </button>
        </div>
      </div>
      <datalist id="localities">
        {['Tirupati Nagar, Virar West', 'Bolinj, Virar West', 'Global City, Virar West', 'Yashwant Nagar, Virar West', 'Station Road, Virar West', 'Stella, Vasai West', 'Evershine City, Vasai East', 'Nallasopara East'].map(l => <option key={l} value={l} />)}
      </datalist>
    </form>
  )
}
