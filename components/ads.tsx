'use client'

// Adsterra ad units. Each ad runs inside its own sandboxed iframe (no access to the page, its storage or the login data).
import { useEffect, useRef, useState } from 'react'
import { useMediaQuery } from '@/components/use-media-query'

// Scripts may run and an ad click may open a new tab, but the frame is a separate origin: it cannot read this site's localStorage.
const SANDBOX = 'allow-scripts allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation'

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
      sandbox={SANDBOX}
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

// Native Banner: also inside a sandboxed iframe. The frame tells the page how tall the ad is so the frame can grow to fit.
function nativeDoc(id: string) {
  return (
    '<!doctype html><html><head><meta charset="utf-8"><base target="_blank"><style>html,body{margin:0;padding:0;background:transparent}</style></head><body>' +
    `<script async data-cfasync="false" src="https://bicea.org/21/${NATIVE_KEY}"></script><div id="container-${NATIVE_KEY}"></div>` +
    `<script>(function(){var last=0;function send(){var h=document.documentElement.scrollHeight;if(h&&h!==last){last=h;parent.postMessage({omeAdH:h,omeAdId:'${id}'},'*')}}` +
    "if(window.ResizeObserver){new ResizeObserver(send).observe(document.body)}setInterval(send,1000);window.addEventListener('load',send)})();</script>" +
    '</body></html>'
  )
}

// Home page, between the About text and Features (Native Banner)
export function HomeNativeAd() {
  const frame = useRef<HTMLIFrameElement>(null)
  const [id] = useState(() => Math.random().toString(36).slice(2))
  const [h, setH] = useState(0)
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.source !== frame.current?.contentWindow) return
      const d = e.data
      if (d && d.omeAdId === id && typeof d.omeAdH === 'number') setH(Math.min(Math.max(Math.round(d.omeAdH), 0), 1500))
    }
    window.addEventListener('message', onMsg)
    return () => window.removeEventListener('message', onMsg)
  }, [id])
  return (
    <section aria-label="Advertisement" className="mx-auto w-full max-w-xl px-4 pt-6 md:max-w-2xl lg:max-w-4xl">
      <Label />
      <iframe
        ref={frame}
        title="Advertisement"
        srcDoc={nativeDoc(id)}
        sandbox={SANDBOX}
        scrolling="no"
        loading="lazy"
        style={{ border: 0, display: 'block', width: '100%', height: h || 0 }}
      />
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
