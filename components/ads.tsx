'use client'

// Adsterra ad units. Each banner runs inside its own small iframe so the ad script cannot touch the page.
import { useEffect, useRef } from 'react'
import { useMediaQuery } from '@/components/use-media-query'

type Banner = { key: string; width: number; height: number }

const B320: Banner = { key: 'eee276032bf52dd0b2a92b47094d8bcd', width: 320, height: 50 }
const B728: Banner = { key: '088d94497faf7aaee2779f8c00268120', width: 728, height: 90 }
const B300: Banner = { key: '6f6b8f5e5defeac15f8679eaba429032', width: 300, height: 250 }
const NATIVE_KEY = '145cb108fb7f656a2213da8e43eeab0b'

function bannerDoc(b: Banner) {
  return (
    '<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;background:transparent;overflow:hidden}</style></head><body>' +
    `<script>atOptions={'key':'${b.key}','format':'iframe','height':${b.height},'width':${b.width},'params':{}};</script>` +
    `<script data-cfasync="false" src="https://bicea.org/22/${b.key}"></script>` +
    '</body></html>'
  )
}

function Label() {
  return <p className="mb-1 text-center text-[10px] font-medium uppercase tracking-wider opacity-50">Advertisement</p>
}

function BannerFrame({ b }: { b: Banner }) {
  return (
    <iframe
      title="Advertisement"
      srcDoc={bannerDoc(b)}
      width={b.width}
      height={b.height}
      scrolling="no"
      loading="lazy"
      style={{ border: 0, display: 'block', width: b.width, height: b.height, maxWidth: '100%' }}
    />
  )
}

// Home page, right under the Start button: phones and tablets (320x50)
export function HomeBannerSmall() {
  const show = useMediaQuery('(max-width: 1023px)')
  return (
    <div className="mx-auto w-full max-w-xl px-4 pt-4 lg:hidden">
      <Label />
      <div className="mx-auto flex justify-center" style={{ minHeight: B320.height }}>{show && <BannerFrame b={B320} />}</div>
    </div>
  )
}

// Home page, full width on laptops (728x90)
export function HomeBannerWide() {
  const show = useMediaQuery('(min-width: 1024px)')
  return (
    <div className="mx-auto hidden w-full max-w-4xl px-4 pt-8 lg:block">
      <Label />
      <div className="mx-auto flex justify-center" style={{ minHeight: B728.height }}>{show && <BannerFrame b={B728} />}</div>
    </div>
  )
}

// Home page, between the About text and Features (Native Banner)
export function HomeNativeAd() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const host = ref.current
    if (!host) return
    const s = document.createElement('script')
    s.async = true
    s.setAttribute('data-cfasync', 'false')
    s.setAttribute('fetchpriority', 'high')
    s.src = `https://bicea.org/21/${NATIVE_KEY}`
    document.body.appendChild(s)
    return () => {
      s.remove()
      host.innerHTML = ''
    }
  }, [])
  return (
    <section aria-label="Advertisement" className="mx-auto w-full max-w-xl px-4 pt-6 md:max-w-2xl lg:max-w-4xl">
      <Label />
      <div ref={ref} id={`container-${NATIVE_KEY}`} />
    </section>
  )
}

// Chat page, only on the first screen (before the chat starts), in the empty space above the rules (300x250)
export function ChatIdleAd() {
  const roomy = useMediaQuery('(min-height: 640px)')
  if (!roomy) return null
  return (
    <div className="flex flex-col items-center">
      <Label />
      <BannerFrame b={B300} />
    </div>
  )
}
