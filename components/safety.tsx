const rules = [
  'Be respectful. No harassment, hate or threats.',
  'Never share personal info like your address or phone.',
  'Nudity and sexual content are not allowed.',
  'Use Report if someone makes you uncomfortable.',
]

export function Safety() {
  return (
    <section id="safety" className="scroll-mt-24 px-4 pb-16">
      <div className="mx-auto max-w-5xl rounded-[2rem] lg:max-w-7xl 2xl:max-w-[88rem] border bg-card/60 p-6 backdrop-blur sm:p-10">
        <h2 className="text-2xl font-semibold tracking-tight">House rules</h2>
        <ol className="mt-6 flex flex-col gap-4">
          {rules.map((rule, i) => (
            <li key={rule} className="flex items-start gap-4">
              <span className="font-mono text-sm text-primary">{String(i + 1).padStart(2, '0')}</span>
              <span className="text-sm leading-relaxed text-muted-foreground">{rule}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export function SiteFooter() {
  return (
    <footer className="border-t px-4 py-8">
      <div className="mx-auto flex max-w-5xl items-center lg:max-w-7xl 2xl:max-w-[88rem] justify-between gap-4 text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">Bearchat</span>
        <span>{'\u00A9 2026 Bearchat'}</span>
      </div>
    </footer>
  )
}
