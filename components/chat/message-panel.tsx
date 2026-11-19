'use client'

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { cn } from '@/lib/utils'
import type { PublicProfile } from '@/components/identity'
import { countryName, flagOf } from './country'
import { getSocket } from './socket'

type Msg = { id: number; from: 'stranger' | 'you' | 'notice'; text: string }
type Phase = 'idle' | 'searching' | 'connected' | 'ended'

const AUTO_NEXT = 30

type Props = { me: PublicProfile; country: string | null; onSearchingChange?: (searching: boolean) => void; initialSame?: boolean }

export function MessagePanel({ me, country, onSearchingChange, initialSame = false }: Props) {
  const socket = getSocket()
  const [phase, setPhase] = useState<Phase>('idle')
  const [sameCountry, setSameCountry] = useState(initialSame)
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [draft, setDraft] = useState('')
  const [typing, setTyping] = useState(false)
  const [confirmSkip, setConfirmSkip] = useState(false)
  const [countdown, setCountdown] = useState(AUTO_NEXT)
  const [peer, setPeer] = useState<PublicProfile | null>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const timers = useRef<number[]>([])
  const typingOff = useRef<number | undefined>(undefined)
  const meRef = useRef(me)
  const sameRef = useRef(sameCountry)
  const countryRef = useRef(country)

  useEffect(() => {
    meRef.current = me
    sameRef.current = sameCountry
    countryRef.current = country
  }, [me, sameCountry, country])

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms))
  }
  const clearTimers = () => {
    timers.current.forEach((id) => clearTimeout(id))
    timers.current = []
  }
  const add = useCallback((from: Msg['from'], text: string) => {
    setMsgs((p) => [...p, { id: Date.now() + Math.random(), from, text }])
  }, [])

  const endChat = useCallback(
    (reason: 'left' | 'disconnected') => {
      setTyping(false)
      add('notice', reason === 'left' ? 'Stranger left.' : 'Stranger disconnected.')
      setPhase('ended')
    },
    [add],
  )

  const start = useCallback(() => {
    if (!socket) {
      // No server connected: never fake a stranger.
      setTyping(false)
      setPeer(null)
      setMsgs([{ id: Date.now(), from: 'notice', text: 'Chat server is not connected right now. Please try again in a moment.' }])
      setPhase('idle')
      return
    }
    setMsgs([])
    setTyping(false)
    setConfirmSkip(false)
    setPeer(null)
    setPhase('searching')
    socket.emit('join', { mode: 'text', profile: { ...meRef.current, country: countryRef.current }, sameCountry: sameRef.current })
  }, [socket])

  // Real server events
  useEffect(() => {
    if (!socket) return
    const onMatched = (d: { peer: PublicProfile }) => {
      setPeer(d.peer)
      setPhase('connected')
    }
    const onMessage = (d: { text: string }) => {
      setTyping(false)
      add('stranger', d.text)
    }
    const onTyping = (on: boolean) => setTyping(on)
    const onLeft = (d: { reason: 'left' | 'disconnected' }) => endChat(d.reason)
    socket.on('matched', onMatched)
    socket.on('message', onMessage)
    socket.on('typing', onTyping)
    socket.on('peer-left', onLeft)
    return () => {
      socket.off('matched', onMatched)
      socket.off('message', onMessage)
      socket.off('typing', onTyping)
      socket.off('peer-left', onLeft)
    }
  }, [socket, add, endChat])

  // Phase driver
  useEffect(() => {
    onSearchingChange?.(phase === 'searching')
    if (phase === 'ended') {
      setCountdown(AUTO_NEXT)
      timers.current.push(window.setInterval(() => setCountdown((c) => c - 1), 1000))
    }
    return clearTimers
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  useEffect(() => {
    if (phase === 'ended' && countdown <= 0) start()
  }, [phase, countdown, start])

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [msgs, typing, phase])

  function onInput(v: string) {
    setDraft(v)
    if (!socket || phase !== 'connected') return
    socket.emit('typing', true)
    window.clearTimeout(typingOff.current)
    typingOff.current = window.setTimeout(() => socket.emit('typing', false), 1500)
  }

  function send(e: FormEvent) {
    e.preventDefault()
    const text = draft.trim()
    if (!text || phase !== 'connected') return
    add('you', text.slice(0, 500))
    setDraft('')
    socket?.emit('message', { text: text.slice(0, 500) })
    socket?.emit('typing', false)
  }

  function skipPress() {
    if (!confirmSkip) {
      setConfirmSkip(true)
      later(() => setConfirmSkip(false), 3000)
      return
    }
    socket?.emit('skip')
    start()
  }

  const main =
    phase === 'idle' || phase === 'ended'
      ? { label: 'Start', cls: 'bg-[#16a34a]', on: start }
      : phase === 'searching'
        ? { label: 'Stop', cls: 'bg-[#475569]', on: () => { socket?.emit('stop'); setPhase('idle') } }
        : confirmSkip
          ? { label: 'Really?', cls: 'bg-[#dc2626]', on: skipPress }
          : { label: 'Skip', cls: 'bg-[#f97316]', on: skipPress }

  const chip = 'w-fit self-start ml-0.5 rounded-full bg-[var(--recv,#1e293b)] px-3.5 py-1.5 text-sm text-[var(--recv-ink,#e2e8f0)]'
  const bubble = 'max-w-[82%] break-words rounded-2xl px-3.5 py-2 text-[17px] leading-snug'
  const label = peer?.name ?? 'Stranger'

  return (
    <>
      <section aria-label="Messages" className="relative flex min-h-0 flex-1 flex-col">
        {(phase === 'idle' || phase === 'ended') && (
          <label className="flex w-fit cursor-pointer items-center gap-2 whitespace-nowrap pb-2 pl-1 text-[11px] font-semibold">
            <span>Same Country</span>
            <button
              type="button"
              role="switch"
              aria-checked={sameCountry}
              onClick={() => setSameCountry((v) => !v)}
              className={cn(
                'relative h-4 w-7 shrink-0 rounded-full shadow-[0_0_0_2px_rgba(148,163,184,0.35),0_0_10px_rgba(148,163,184,0.55)] transition-colors',
                sameCountry ? 'bg-[#2563eb]' : 'bg-slate-500',
              )}
            >
              <span className={cn('absolute left-0.5 top-0.5 size-3 rounded-full bg-white shadow transition-transform', sameCountry && 'translate-x-3')} />
              <span className="sr-only">Match with same country only</span>
            </button>
          </label>
        )}

        {phase === 'idle' ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
            <p className="text-2xl font-bold">You must be 18+</p>
            <p className="text-sm opacity-80">No explicit content or harassment allowed. Click Start below!</p>
          </div>
        ) : (
          <div className="mt-auto flex min-h-0 flex-col gap-2.5 overflow-y-auto px-1 pb-1" aria-live="polite">
            <div className={chip}>
              {phase === 'searching' ? (
                'Looking for someone to talk to\u2026'
              ) : (
                <>
                  Connected with <span className="font-semibold text-[#f87171]">{label}</span> from{' '}
                  {countryName(peer?.country)} <span aria-hidden="true">{flagOf(peer?.country)}</span>
                </>
              )}
            </div>
            {msgs.map((m) =>
              m.from === 'notice' ? (
                <p key={m.id} className="px-1 text-left text-[15px] text-[var(--notice,#f59e0b)]">
                  {m.text} You can press Start for a new chat.
                </p>
              ) : m.from === 'stranger' ? (
                <div key={m.id} className={cn(bubble, 'self-start bg-[var(--recv,#1e293b)] text-[var(--recv-ink,#f1f5f9)]')}>
                  <span className="font-semibold text-[#f87171]">{label}</span>: {m.text}
                </div>
              ) : (
                <div key={m.id} className={cn(bubble, 'self-end bg-[var(--sent,#2563eb)] text-[var(--sent-ink,#ffffff)]')}>
                  <span className="font-semibold">You</span>: {m.text}
                </div>
              ),
            )}
            {typing && (
              <div className="flex items-center gap-1 self-start px-1 text-sm italic opacity-80">
                typing
                {[0, 1, 2].map((d) => (
                  <span key={d} className="size-1 animate-bounce rounded-full bg-current" style={{ animationDelay: `${d * 0.15}s` }} />
                ))}
              </div>
            )}
            <div ref={endRef} aria-hidden="true" />
          </div>
        )}
      </section>

      <form onSubmit={send} className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          onClick={main.on}
          className={cn('h-12 w-[58px] shrink-0 rounded-2xl text-sm font-bold text-white transition-opacity active:opacity-80', main.cls)}
        >
          {main.label}
        </button>
        <label htmlFor="message" className="sr-only">Message</label>
        <input
          id="message"
          type="text"
          autoComplete="off"
          value={draft}
          disabled={phase !== 'connected'}
          onChange={(e) => onInput(e.target.value)}
          maxLength={500}
          placeholder="Type a message..."
          className="h-12 min-w-0 flex-1 rounded-2xl border bg-card px-3.5 text-base outline-none backdrop-blur-xl placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring group-data-[themed]:border-[var(--bd)] group-data-[themed]:bg-[var(--tab)]"
        />
        <button
          type="submit"
          disabled={!draft.trim() || phase !== 'connected'}
          className="h-12 w-[58px] shrink-0 rounded-2xl bg-[#2563eb] px-0 text-sm font-bold text-white transition-colors disabled:bg-[#475569] disabled:text-white/60"
        >
          Send
        </button>
      </form>
    </>
  )
}
