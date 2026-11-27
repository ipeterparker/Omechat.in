import { EyeOff, Zap, ShieldCheck, Globe } from 'lucide-react'

const features = [
  { icon: EyeOff, title: 'Fully anonymous', body: 'No account and no name needed for text chat. You decide what to share.' },
  { icon: Zap, title: 'Instant matching', body: 'One tap and you are talking. Skip anytime to meet someone else.' },
  { icon: Globe, title: 'Worldwide', body: 'Strangers from every corner of the world, any hour of the day.' },
  { icon: ShieldCheck, title: 'Safer chats', body: 'Skip in one tap. Telegram and paid promotions are blocked automatically.' },
]

export function Features() {
  return (
    <section id="features" className="scroll-mt-24 px-4 py-16">
      <div className="mx-auto max-w-5xl lg:max-w-7xl 2xl:max-w-[88rem]">
        <p className="text-sm font-medium text-primary">Why Omechat</p>
        <h2 className="mt-2 max-w-md text-balance text-3xl font-semibold tracking-tight">
          Simple by design. Calm by default.
        </h2>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex gap-4 rounded-3xl border bg-card/60 p-5 backdrop-blur">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
