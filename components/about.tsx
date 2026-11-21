import { Globe2, Lock, UserX } from 'lucide-react'

const stats = [
  { icon: Globe2, value: '120+', label: 'Countries' },
  { icon: UserX, value: 'Zero', label: 'Sign up' },
  { icon: Lock, value: '24/7', label: 'Moderated' },
]

export function About() {
  return (
    <section aria-labelledby="about-title" className="mx-auto w-full max-w-xl px-4 pt-10 md:max-w-2xl lg:mx-0 lg:max-w-none lg:px-0">
      <div className="rounded-3xl border bg-card/60 p-6 backdrop-blur-xl sm:p-8">
        <h2 id="about-title" className="text-balance text-2xl font-bold leading-tight tracking-tight">
          {'About Omechat \u2014 The Next-Gen Social Odyssey'}
        </h2>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          Welcome to Omechat, a digital sanctuary designed to bridge physical boundaries and foster genuine,
          unfiltered human connections across the globe. In an era where online interactions often feel scripted,
          Omechat brings back the thrill of meeting someone new, one random conversation at a time.
        </p>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Pick text or video, tap Start Matching, and you are instantly paired with a stranger. Not feeling it? Skip
          to the next person in a single tap.
        </p>
      </div>

      <ul className="mt-4 grid grid-cols-3 divide-x divide-border rounded-3xl border bg-card/60 py-5 backdrop-blur-xl">
        {stats.map(({ icon: Icon, value, label }) => (
          <li key={label} className="flex flex-col items-center gap-1 px-2 text-center">
            <Icon className="size-4 text-primary" aria-hidden="true" />
            <span className="text-lg font-bold leading-none">{value}</span>
            <span className="text-xs text-muted-foreground">{label}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
