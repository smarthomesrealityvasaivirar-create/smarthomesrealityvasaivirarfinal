import Link from 'next/link'
import { JsonLd } from '@/components/common/JsonLd'
import { absoluteUrl } from '@/config/site'

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  const all = [{ label: 'Home', href: '/' }, ...items]
  return (
    <>
      <nav aria-label="Breadcrumb" className="font-mono text-xs text-stone">
        <ol className="flex flex-wrap items-center gap-2">
          {all.map((c, i) => (
            <li key={c.label} className="flex items-center gap-2">
              {i > 0 && <span aria-hidden>/</span>}
              {c.href && i < all.length - 1 ? <Link href={c.href} className="hover:text-gold-deep">{c.label}</Link> : <span aria-current="page" className="text-ink">{c.label}</span>}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: all.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.label, item: c.href ? absoluteUrl(c.href) : undefined })),
        }}
      />
    </>
  )
}
