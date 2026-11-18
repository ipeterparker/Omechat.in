import type { ReactNode } from 'react'
import { SiteHeader } from '@/components/site-header'

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="relative z-10 mx-auto w-full max-w-xl px-4 py-8">
        <article className="rounded-3xl border bg-card/60 p-6 backdrop-blur-xl sm:p-8">
          <h1 className="text-balance text-2xl font-bold tracking-tight">{title}</h1>
          <p className="mt-1 text-xs text-muted-foreground">Last updated {updated}</p>
          <div className="mt-6 flex flex-col gap-4 leading-relaxed text-muted-foreground [&_h2]:mt-2 [&_h2]:font-semibold [&_h2]:text-foreground">
            {children}
          </div>
        </article>
      </main>
    </>
  )
}
