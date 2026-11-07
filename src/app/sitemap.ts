import type { MetadataRoute } from 'next'
import { getPublicSlugs } from '@/lib/queries/properties'
import { absoluteUrl } from '@/config/site'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const statics = ['/', '/rent', '/buy', '/sell', '/about', '/contact', '/privacy-policy', '/terms'].map(p => ({ url: absoluteUrl(p), changeFrequency: 'weekly' as const, priority: p === '/' ? 1 : 0.7 }))
  const props = (await getPublicSlugs()).map(s => ({ url: absoluteUrl(`/properties/${s.slug}`), lastModified: s.updated_at, changeFrequency: 'weekly' as const, priority: 0.8 }))
  return [...statics, ...props]
}
