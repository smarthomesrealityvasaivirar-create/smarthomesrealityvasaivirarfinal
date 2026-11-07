import { Breadcrumbs } from '@/components/common/Breadcrumbs'

export function LegalPage({ title, updated, sections }: { title: string; updated: string; sections: { h: string; p: string[] }[] }) {
  return (
    <div className="mx-auto max-w-3xl px-5 py-10 md:py-14">
      <Breadcrumbs items={[{ label: title }]} />
      <h1 className="mt-4 font-display text-3xl text-ink sm:text-4xl">{title}</h1>
      <p className="mt-2 text-sm text-stone">Last updated {updated}. Template text: have it reviewed by a lawyer before launch.</p>
      <div className="mt-8 space-y-8">
        {sections.map(s => (
          <section key={s.h}>
            <h2 className="font-display text-2xl text-ink">{s.h}</h2>
            {s.p.map(t => <p key={t} className="mt-3 text-base leading-relaxed text-ink/85">{t}</p>)}
          </section>
        ))}
      </div>
    </div>
  )
}
