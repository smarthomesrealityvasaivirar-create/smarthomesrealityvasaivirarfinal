import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export function SectionHeader({
  eyebrow,
  title,
  description,
  link,
  align = 'left',
  tone = 'light',
  as: Tag = 'h2',
}: {
  eyebrow?: string
  title: React.ReactNode
  description?: string
  link?: { href: string; label: string }
  align?: 'left' | 'center'
  tone?: 'light' | 'dark'
  as?: 'h1' | 'h2'
}) {
  const dark = tone === 'dark'
  return (
    <div className={cn('flex flex-col gap-3 md:flex-row md:gap-6 md:items-end md:justify-between', align === 'center' && 'items-center text-center md:flex-col md:items-center')}>
      <div className="max-w-2xl">
        {eyebrow && <p className={cn('eyebrow', dark ? 'text-gold-light' : 'text-gold-deep')}>{eyebrow}</p>}
        <Tag className={cn('mt-2 font-display text-[26px] leading-[1.15] sm:text-[38px] md:mt-3 md:text-[44px]', dark ? 'text-bone' : 'text-ink')}>{title}</Tag>
        {description && <p className={cn('mt-3 text-[15px] leading-relaxed md:mt-4 md:text-base', dark ? 'text-bone/70' : 'text-stone')}>{description}</p>}
      </div>
      {link && (
        <Link href={link.href} className={cn('group inline-flex min-h-11 shrink-0 items-center gap-2 self-start border-b font-mono text-xs uppercase tracking-wide2 md:self-auto', dark ? 'border-bone/30 text-bone/80 hover:text-gold-light' : 'border-ink/25 text-ink hover:text-gold-deep')}>
          {link.label}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
        </Link>
      )}
    </div>
  )
}
