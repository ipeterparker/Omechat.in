'use client'

// Adsterra ad units (same 4 places as before: home phone banner, home laptop banner, home native ad, chat start screen).
//
// SANDBOX_ADS is OFF on purpose: Adsterra ad scripts do not draw (or draw very rarely) inside a sandboxed iframe, which
// made the ads disappear and would cut earnings. Each ad runs in its own plain iframe, exactly like before.
// The little script at the end of every ad page tells the page how tall the ad is. An empty native ad is hidden.
import { useEffect, useRef, useState } from 'react'
import { useMediaQuery } from '@/components/use-media-query'

type Banner = { key: string; width: number; height: number }

const B320: Banner = { key: 'eee276032bf52dd0b2a92b47094d8bcd', width: 320, height: 50 }
const B728: Banner = { key: '088d94497faf7aaee2779f8c00268120', width: 728, height: 90 }
const B300: Banner = { key: '6f6b8f5e5defeac15f8679eaba429032', width: 300, height: 250 }
const NATIVE_KEY = '145cb108fb7f656a2213da8e43eeab0b'

const SANDBOX_ADS = false
// scripts + new-tab links + opening the advertiser after a real tap. No same-origin => no access to this site's data.
const SANDBOX = 'allow-scripts allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation'
const WAIT_MS = 8000

// Runs inside the ad page: tells the parent page when the ad has drawn something and how tall it is.
function reporter(id: string) {
  return (
    '<script>(function(){var id=' +
    JSON.stringify(id) +
    ',ready=false,last=0,n=0;' +
    'function post(m){try{parent.postMessage(m,"*")}catch(e){}}' +
    'function check(){var h=document.body?document.body.offsetHeight:0;' +
    'if(h>8){if(!ready){ready=true;post({omechatAd:id,ready:true})}if(h!==last){last=h;post({omechatAd:id,h:h})}}}' +
    'try{new MutationObserver(check).observe(document.documentElement,{childList:true,subtree:true,attributes:true})}catch(e){}' +
    'window.addEventListener("load",check);' +
    'var t=setInterval(function(){check();if(++n>80)clearInterval(t)},500)})()</script>'
  )
}

// <base target="_blank">: a link without its own target opens a new tab instead of loading inside the small ad box
const HEAD =
  '<!doctype html><html><head><meta charset="utf-8"><base target="_blank"><style>html,body{margin:0;padding:0;background:transparent;overflow:hidden}</style></head><body>'

function bannerDoc(b: Banner, id: string) {
  return (
    HEAD +
    `<script>atOptions={'key':'${b.key}','format':'iframe','height':${b.height},'width':${b.width},'params':{}};</script>` +
    `<script data-cfasync="false" src="https://bicea.org/22/${b.key}"></script>` +
    reporter(id) +
    '</body></html>'
  )
}

function nativeDoc(id: string) {
  return (
    HEAD +
    `<div id="container-${NATIVE_KEY}"></div>` +
    `<script async data-cfasync="false" src="https://bicea.org/21/${NATIVE_KEY}"></script>` +
    reporter(id) +
    '</body></html>'
  )
}

function Label() {
  return <p className="mb-1 text-center text-[10px] font-medium uppercase tracking-wider opacity-50">Advertisement</p>
}

type FrameProps = {
  build: (id: string) => string
  width?: number // fixed width (banners). Leave out for a full-width frame (native ad)
  height: number // banner height, or the starting height of an auto-height frame
  auto?: boolean // native ad: the frame grows to the height the ad reports
  lazy?: boolean
}

function AdFrame({ build, width, height, auto = false, lazy = true }: FrameProps) {
  const ref = useRef<HTMLIFrameElement>(null)
  const [id] = useState(() => Math.random().toString(36).slice(2, 12))
  const mode: 'sandbox' | 'open' = SANDBOX_ADS ? 'sandbox' : 'open'
  const [loaded, setLoaded] = useState(false)
  const [h, setH] = useState(height)
  const [dead, setDead] = useState(false)
  const readyRef = useRef(false)

  // messages from the ad page (only from OUR frame, only with its own id)
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.source !== ref.current?.contentWindow) return
      const d = e.data as { omechatAd?: string; ready?: boolean; h?: number } | null
      if (!d || typeof d !== 'object' || d.omechatAd !== id) return
      if (d.ready === true) {
        readyRef.current = true
        setDead(false)
      }
      if (auto && typeof d.h === 'number' && d.h > 0 && d.h <= 1000) setH(Math.ceil(d.h))
    }
    window.addEventListener('message', onMsg)
    return () => window.removeEventListener('message', onMsg)
  }, [id, auto])

  // the timer starts only after the frame has really loaded (a lazy frame below the screen has not started yet)
  useEffect(() => {
    if (!loaded) return
    const t = window.setTimeout(() => {
      if (readyRef.current) return
      if (auto) setDead(true) // blocked by an ad blocker / no ad: do not keep an empty box
    }, WAIT_MS)
    return () => window.clearTimeout(t)
  }, [loaded, auto])

  const shownHeight = auto && dead ? 0 : h
  return (
    <iframe
      key={mode}
      ref={ref}
      title="Advertisement"
      srcDoc={build(id)}
      sandbox={mode === 'sandbox' ? SANDBOX : undefined}
      width={width}
      height={shownHeight}
      scrolling="no"
      loading={lazy ? 'lazy' : 'eager'}
      onLoad={() => setLoaded(true)}
      style={{ border: 0, display: 'block', width: width ?? '100%', height: shownHeight, maxWidth: '100%' }}
    />
  )
}

// Home page, right under the Start button: phones and tablets (320x50)
export function HomeBannerSmall() {
  const show = useMediaQuery('(max-width: 1023px)')
  return (
    <div className="mx-auto w-full max-w-xl px-4 pt-4 lg:hidden">
      <Label />
      <div className="mx-auto flex justify-center" style={{ minHeight: B320.height }}>
        {show && <AdFrame build={(id) => bannerDoc(B320, id)} width={B320.width} height={B320.height} />}
      </div>
    </div>
  )
}

// Home page, full width on laptops (728x90)
export function HomeBannerWide() {
  const show = useMediaQuery('(min-width: 1024px)')
  return (
    <div className="mx-auto hidden w-full max-w-4xl px-4 pt-8 lg:block">
      <Label />
      <div className="mx-auto flex justify-center" style={{ minHeight: B728.height }}>
        {show && <AdFrame build={(id) => bannerDoc(B728, id)} width={B728.width} height={B728.height} />}
      </div>
    </div>
  )
}

// Home page, between the About text and Features (Native Banner)
export function HomeNativeAd() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return (
    <section aria-label="Advertisement" className="mx-auto w-full max-w-xl px-4 pt-6 md:max-w-2xl lg:max-w-4xl">
      <Label />
      <div>{mounted && <AdFrame build={nativeDoc} height={100} auto lazy={false} />}</div>
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
      <AdFrame build={(id) => bannerDoc(B300, id)} width={B300.width} height={B300.height} />
    </div>
  )
}
