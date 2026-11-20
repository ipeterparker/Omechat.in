'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { RunningBear } from '@/components/running-bear'
import { cn } from '@/lib/utils'

const AdScene = dynamic(() => import('./three/ad-scene'), {
  ssr: false,
  loading: () => <div className="size-full animate-pulse bg-card/40" />,
})

const captions = [
  { eyebrow: 'Feeling bored?', title: 'Meet someone new' },
  { eyebrow: 'Text or video', title: 'Say hi in one tap' },
  { eyebrow: 'Only on Omechat', title: 'Your next great chat' },
]

export function AdBanner() {
  const [sceneIndex, setSceneIndex] = useState(0)
  const [inView, setInView] = useState(false)
  const containerRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    const node = containerRef.current
    if (!node) return
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.15 })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const caption = captions[sceneIndex]

  return (
    <section aria-label="Omechat promo video" className="mx-auto w-full max-w-xl px-4 pt-4 md:max-w-2xl lg:mx-0 lg:max-w-none lg:px-0 lg:pt-0">
      <Link
        ref={containerRef}
        href="/chat?mode=text"
        className="group relative block aspect-[16/10] overflow-hidden rounded-3xl border text-white bg-[radial-gradient(ellipse_at_50%_30%,oklch(0.26_0.07_265)_0%,#0a0e1a_70%)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <div className="absolute inset-0" aria-hidden="true">
          <AdScene active={inView} onSceneChange={setSceneIndex} />
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#0a0e1a] via-[#0a0e1a]/60 to-transparent" />

        <div className="absolute inset-x-4 top-3 flex gap-1.5" aria-hidden="true">
          {captions.map((item, index) => (
            <span key={item.title} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/15">
              <span
                key={index === sceneIndex ? `active-${sceneIndex}` : 'idle'}
                className={cn(
                  'block h-full rounded-full bg-white/90',
                  index < sceneIndex && 'w-full',
                  index === sceneIndex && 'ad-progress',
                  index > sceneIndex && 'w-0',
                )}
              />
            </span>
          ))}
        </div>

        <span className="absolute left-4 top-6 flex items-center gap-1.5 rounded-full border border-white/10 bg-black/30 px-2.5 py-1 text-[11px] font-semibold backdrop-blur-md">
          <RunningBear tone="light" className="h-3 w-[15px]" />
          Omechat
        </span>

        <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
          <div key={sceneIndex} className="ad-caption" aria-live="polite">
            <p className="text-xs font-semibold uppercase tracking-wider text-flame">{caption.eyebrow}</p>
            <p className="text-balance text-xl font-bold leading-tight sm:text-2xl">{caption.title}</p>
          </div>
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground transition-transform group-hover:translate-x-0.5">
            Try it
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </span>
        </div>
      </Link>
    </section>
  )
}
