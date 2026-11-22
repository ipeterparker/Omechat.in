'use client'

import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import type { PublicProfile } from '@/components/identity'
import { countryName, flagOf } from './country'
import { getSocket } from './socket'
import { warnColor, type ChatTheme } from './themes'

type Quote = { text: string; who: 'you' | 'stranger' } // who wrote the message being replied to (seen from this device)
type Msg = { id: number; from: 'stranger' | 'you' | 'notice'; text: string; mid?: string; reply?: Quote; edited?: boolean }
type Menu = { id: number; top: number; right: number }

const newMid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36)

// One chat bubble: swipe right = reply, hold (own messages) = menu. Touch / pen only.
function MsgBubble({ className, children, onReply, onHold }: {
  className: string
  children: ReactNode
  onReply: () => void
  onHold?: (rect: DOMRect) => void
}) {
  const [dx, setDx] = useState(0)
  const [drag, setDrag] = useState(false)
  const el = useRef<HTMLDivElement>(null)
  const g = useRef<{ x: number; y: number; moved: boolean; held: boolean; raw: number; timer?: number } | null>(null)
  const cap = className.includes('self-end') ? 24 : 56
  const end = () => {
    if (g.current?.timer) clearTimeout(g.current.timer)
    g.current = null
    setDrag(false)
    setDx(0)
  }
  return (
    <div
      ref={el}
      className={cn(className, 'relative touch-pan-y [@media(pointer:coarse)]:select-none')}
      style={{ transform: dx ? `translateX(${dx}px)` : undefined, transition: drag ? 'none' : 'transform .2s' }}
      onContextMenu={onHold ? (e) => e.preventDefault() : undefined}
      onPointerDown={(e) => {
        if (e.pointerType === 'mouse') return
        g.current = { x: e.clientX, y: e.clientY, moved: false, held: false, raw: 0 }
        if (onHold) {
          g.current.timer = window.setTimeout(() => {
            if (g.current && !g.current.moved && el.current) {
              g.current.held = true
              navigator.vibrate?.(20)
              onHold(el.current.getBoundingClientRect())
            }
          }, 450)
        }
      }}
      onPointerMove={(e) => {
        const s0 = g.current
        if (!s0) return
        const ddx = e.clientX - s0.x
        const ddy = e.clientY - s0.y
        if (!s0.moved && (Math.abs(ddx) > 8 || Math.abs(ddy) > 8)) {
          s0.moved = true
          if (s0.timer) clearTimeout(s0.timer)
        }
        if (ddx > 0 && Math.abs(ddx) > Math.abs(ddy)) {
          s0.raw = ddx
          setDrag(true)
          setDx(Math.min(cap, ddx * 0.5))
        }
      }}
      onPointerUp={() => {
        const s0 = g.current
        if (s0 && !s0.held && s0.raw >= 55) {
          navigator.vibrate?.(15)
          onReply()
        }
        end()
      }}
      onPointerCancel={end}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -left-10 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/25 text-base"
        style={{ opacity: Math.min(1, dx / (cap * 0.9)) }}
      >
        {'\u21a9'}
      </span>
      {children}
    </div>
  )
}

type Phase = 'idle' | 'searching' | 'connected' | 'ended'

const AUTO_NEXT = 30

type Props = {
  me: PublicProfile
  country: string | null
  onSearchingChange?: (searching: boolean) => void
  theme?: ChatTheme
  sameCountry: boolean
  onSameCountryChange: (v: boolean) => void
}

export function MessagePanel({ me, country, onSearchingChange, theme, sameCountry, onSameCountryChange }: Props) {
  const socket = getSocket()
  const [phase, setPhase] = useState<Phase>('idle')
  const [agreed, setAgreed] = useState(false)
  const warn = theme ? warnColor(theme) : '#ff5a5a'
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [draft, setDraft] = useState('')
  const [typing, setTyping] = useState(false)
  const [confirmSkip, setConfirmSkip] = useState(false)
  const [countdown, setCountdown] = useState(AUTO_NEXT)
  const [peer, setPeer] = useState<PublicProfile | null>(null)
  // Reconnect: a small status chip (stranger away with a 29s timer / back / you are offline)
  const [status, setStatus] = useState<null | { kind: 'away'; left: number } | { kind: 'back' } | { kind: 'offline' }>(null)
  const resumeRef = useRef<{ id: string; token: string } | null>(null)
  const awayTick = useRef<number | undefined>(undefined)
  const phaseRef = useRef<Phase>('idle')
  const [confirmExit, setConfirmExit] = useState(false)
  const [replyTo, setReplyTo] = useState<Quote | null>(null)
  const [editing, setEditing] = useState<{ id: number; mid: string } | null>(null)
  const [menu, setMenu] = useState<Menu | null>(null)
  const leavingRef = useRef(false)
  const endRef = useRef<HTMLDivElement>(null)

  // Back button: while a chat is connected (phones) it asks "Leave this chat?"; on laptops, or while searching,
  // it goes straight to the 18+ start screen. From the start screen, back leaves the page as usual.
  const leaveToIdleRef = useRef<() => void>(() => {})
  useEffect(() => {
    window.history.pushState(null, '', window.location.href)
    const onPop = () => {
      if (leavingRef.current) return
      const p = phaseRef.current
      if (p === 'connected' || p === 'searching') {
        window.history.pushState(null, '', window.location.href)
        if (p === 'connected' && window.matchMedia('(pointer: coarse)').matches) setConfirmExit(true)
        else leaveToIdleRef.current()
      } else {
        leavingRef.current = true
        window.history.back()
      }
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])
  const inputRef = useRef<HTMLTextAreaElement>(null)
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

  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  const clearAway = useCallback(() => {
    if (awayTick.current) window.clearInterval(awayTick.current)
    awayTick.current = undefined
  }, [])
  const resetLink = useCallback(() => {
    resumeRef.current = null
    clearAway()
    setStatus(null)
  }, [clearAway])

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms))
  }
  const clearTimers = () => {
    timers.current.forEach((id) => clearTimeout(id))
    timers.current = []
  }
  const add = useCallback((from: Msg['from'], text: string, extra?: Partial<Msg>) => {
    setMsgs((p) => [...p, { id: Date.now() + Math.random(), from, text, ...extra }])
  }, [])

  const endChat = useCallback(
    (reason: 'left' | 'disconnected') => {
      resetLink()
      setTyping(false)
      add('notice', reason === 'left' ? 'Stranger left.' : 'Stranger disconnected.')
      setPhase('ended')
    },
    [add, resetLink],
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
    resetLink()
    setMsgs([])
    setTyping(false)
    setConfirmSkip(false)
    setPeer(null)
    setPhase('searching')
    socket.emit('join', { mode: 'text', profile: { ...meRef.current, country: countryRef.current }, sameCountry: sameRef.current })
  }, [socket, resetLink])

  // Real server events
  useEffect(() => {
    if (!socket) return
    const onMatched = (d: { peer: PublicProfile; room?: { id: string; token: string } }) => {
      resumeRef.current = d.room ?? null
      clearAway()
      setStatus(null)
      setPeer(d.peer)
      setPhase('connected')
    }
    const onMessage = (d: { text: string; mid?: string; reply?: { text: string; mine: boolean } }) => {
      setTyping(false)
      add('stranger', d.text, {
        mid: d.mid,
        reply: d.reply ? { text: d.reply.text, who: d.reply.mine ? 'stranger' : 'you' } : undefined,
      })
    }
    const onEdit = (d: { mid: string; text: string }) =>
      setMsgs((p) => p.map((m) => (m.from === 'stranger' && m.mid === d.mid ? { ...m, text: d.text, edited: true } : m)))
    const onTyping = (on: boolean) => setTyping(on)
    const onLeft = (d: { reason: 'left' | 'disconnected' | 'timeout' }) => {
      if (d.reason === 'timeout') {
        // The stranger did not come back within 29 seconds: connect to someone new straight away.
        start()
        add('notice', 'Your previous stranger disconnected. Searching for a new one...')
      } else {
        endChat(d.reason)
      }
    }
    // Stranger lost their connection: show a small chip with a 29 second timer.
    const onAway = (d: { seconds?: number }) => {
      clearAway()
      let left = d.seconds ?? 29
      setTyping(false)
      setStatus({ kind: 'away', left })
      awayTick.current = window.setInterval(() => {
        left = Math.max(0, left - 1)
        setStatus({ kind: 'away', left })
      }, 1000)
    }
    const onBack = () => {
      clearAway()
      setStatus({ kind: 'back' })
      window.setTimeout(() => setStatus((s) => (s && s.kind === 'back' ? null : s)), 4000)
    }
    // Our own connection dropped and came back.
    const onDisconnect = () => {
      if (phaseRef.current === 'connected') setStatus({ kind: 'offline' })
    }
    const onConnect = () => {
      if (phaseRef.current === 'connected' && resumeRef.current) socket.emit('resume', resumeRef.current)
      else if (phaseRef.current === 'searching') {
        socket.emit('join', { mode: 'text', profile: { ...meRef.current, country: countryRef.current }, sameCountry: sameRef.current })
      }
    }
    const onResumed = (d: { peer: PublicProfile }) => {
      setPeer(d.peer)
      setStatus(null)
    }
    const onResumeFailed = () => {
      start()
      add('notice', 'You were away for too long, so that chat ended. Searching for a new stranger...')
    }
    // Page minimized / hidden: tell the server (starts the 29s timer for the stranger). Back on screen: resume.
    const onVisibility = () => {
      if (phaseRef.current !== 'connected' || !resumeRef.current) return
      if (document.hidden) socket.emit('hidden')
      else if (socket.connected) socket.emit('resume', resumeRef.current)
    }
    document.addEventListener('visibilitychange', onVisibility)
    socket.on('matched', onMatched)
    socket.on('message', onMessage)
    socket.on('edit', onEdit)
    socket.on('typing', onTyping)
    socket.on('peer-left', onLeft)
    socket.on('peer-away', onAway)
    socket.on('peer-back', onBack)
    socket.on('disconnect', onDisconnect)
    socket.on('connect', onConnect)
    socket.on('resumed', onResumed)
    socket.on('resume-failed', onResumeFailed)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      socket.off('matched', onMatched)
      socket.off('message', onMessage)
      socket.off('edit', onEdit)
      socket.off('typing', onTyping)
      socket.off('peer-left', onLeft)
      socket.off('peer-away', onAway)
      socket.off('peer-back', onBack)
      socket.off('disconnect', onDisconnect)
      socket.off('connect', onConnect)
      socket.off('resumed', onResumed)
      socket.off('resume-failed', onResumeFailed)
      clearAway()
    }
  }, [socket, add, endChat, start, clearAway])

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
    // scroll only the message list (scrollIntoView also scrolls the whole page and pushes the input behind the keyboard)
    const list = endRef.current?.parentElement
    if (list) list.scrollTop = list.scrollHeight
  }, [msgs, typing, phase, status])

  function onInput(v: string) {
    setDraft(v)
    if (!socket || phase !== 'connected') return
    socket.emit('typing', true)
    window.clearTimeout(typingOff.current)
    typingOff.current = window.setTimeout(() => socket.emit('typing', false), 1500)
  }

  function send(e: FormEvent) {
    e.preventDefault()
    sendText(draft)
    inputRef.current?.focus() // keep the keyboard open after sending
  }

  function sendText(raw: string) {
    const text = raw.trim()
    if (!text || phase !== 'connected') return
    if (editing) {
      const edited = text.slice(0, 500)
      setMsgs((p) => p.map((m) => (m.id === editing.id ? { ...m, text: edited, edited: true } : m)))
      socket?.emit('edit', { mid: editing.mid, text: edited })
      setEditing(null)
      setDraft('')
      socket?.emit('typing', false)
      return
    }
    const mid = newMid()
    add('you', text.slice(0, 500), { mid, reply: replyTo ?? undefined })
    setDraft('')
    socket?.emit('message', {
      text: text.slice(0, 500),
      mid,
      reply: replyTo ? { text: replyTo.text, mine: replyTo.who === 'you' } : undefined,
    })
    setReplyTo(null)
    socket?.emit('typing', false)
  }

  function startReply(m: Msg) {
    if (phase !== 'connected') return
    setEditing(null)
    setReplyTo({ text: m.text.slice(0, 120), who: m.from === 'you' ? 'you' : 'stranger' })
    inputRef.current?.focus()
  }

  function startEdit(m: Msg) {
    if (!m.mid) return
    setReplyTo(null)
    setEditing({ id: m.id, mid: m.mid })
    setDraft(m.text)
    setMenu(null)
    window.setTimeout(() => inputRef.current?.focus(), 0)
  }

  function cancelEdit() {
    setEditing(null)
    setDraft('')
  }

  function holdMsg(m: Msg, rect: DOMRect) {
    if (phase !== 'connected' || !m.mid) return
    const top = rect.top < 130 ? rect.bottom + 6 : rect.top - 6 - 96
    setMenu({ id: m.id, top, right: Math.max(8, window.innerWidth - rect.right) })
  }

  // leaving the chat clears any half-done reply / edit
  useEffect(() => {
    if (phase !== 'connected') {
      setReplyTo(null)
      setEditing(null)
      setMenu(null)
    }
  }, [phase])

  function leaveToIdle() {
    socket?.emit('stop')
    resetLink()
    setMsgs([])
    setTyping(false)
    setConfirmSkip(false)
    setPeer(null)
    setPhase('idle')
  }
  leaveToIdleRef.current = leaveToIdle

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
        ? { label: 'Stop', cls: 'bg-[#475569]', on: () => { socket?.emit('stop'); resetLink(); setPhase('idle') } }
        : confirmSkip
          ? { label: 'Really?', cls: 'bg-[#dc2626]', on: skipPress }
          : { label: 'Skip', cls: 'bg-[#f97316]', on: skipPress }

  const chip = 'w-fit self-start ml-0.5 rounded-full bg-[var(--recv,#1e293b)] px-3.5 py-1.5 text-sm text-[var(--recv-ink,#e2e8f0)]'
  const bubble = 'max-w-[82%] break-words rounded-2xl px-3.5 py-2 text-[14.45px] leading-snug lg:max-w-[70%] lg:px-4 lg:py-2.5 lg:text-[15.3px]'
  const label = peer?.name ?? 'Stranger'
  const quote = (m: Msg) =>
    m.reply ? (
      <div className="mb-1 rounded-lg border-l-[3px] border-white/50 bg-white/15 px-2 py-1 text-[12.5px] leading-snug">
        <span className="block font-semibold opacity-90">{m.reply.who === 'you' ? 'You' : label}</span>
        <span className="line-clamp-2 opacity-90">{m.reply.text}</span>
      </div>
    ) : null

  return (
    <>
      <section aria-label="Messages" className={cn('relative flex min-h-0 flex-1 flex-col lg:rounded-3xl lg:border lg:border-[var(--bd,rgba(255,255,255,0.2))] lg:bg-[var(--tab,rgba(30,35,48,0.9))] lg:p-6', !agreed && 'overflow-y-auto')}>
        {agreed && (phase === 'idle' || phase === 'ended') && (
          <label className="flex w-fit lg:hidden cursor-pointer items-center gap-2 whitespace-nowrap pb-2 pl-1 text-[11px] font-semibold">
            <span>Same Country</span>
            <button
              type="button"
              role="switch"
              aria-checked={sameCountry}
              onClick={() => onSameCountryChange(!sameCountry)}
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

        {phase === 'idle' && !agreed ? (
          <div className="flex-1" aria-hidden="true" />
        ) : phase === 'idle' ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
            <p className="text-2xl font-bold" style={{ color: warn }}>You must be 18+</p>
            <p className="text-sm opacity-80">No explicit content or harassment allowed. Click Start below!</p>
          </div>
        ) : (
          <div className="mt-auto flex min-h-0 flex-col gap-2.5 overflow-y-auto overflow-x-hidden px-1 pb-1" aria-live="polite">
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
                <MsgBubble key={m.id} className={cn(bubble, 'self-start bg-[var(--recv,#1e293b)] text-[var(--recv-ink,#f1f5f9)]')} onReply={() => startReply(m)}>
                  {quote(m)}
                  <span className="font-semibold text-[#f87171]">{label}</span>: {m.text}
                  {m.edited && <span className="ml-1.5 text-[10.5px] opacity-70">edited</span>}
                </MsgBubble>
              ) : (
                <MsgBubble
                  key={m.id}
                  className={cn(bubble, 'self-end bg-[var(--sent,#2563eb)] text-[var(--sent-ink,#ffffff)]')}
                  onReply={() => startReply(m)}
                  onHold={(rect) => holdMsg(m, rect)}
                >
                  {quote(m)}
                  <span className="font-semibold">You</span>: {m.text}
                  {m.edited && <span className="ml-1.5 text-[10.5px] opacity-70">edited</span>}
                </MsgBubble>
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
            {status && (
              <div
                role="status"
                className="flex w-fit items-center gap-2 self-start rounded-full bg-[var(--recv,#1e293b)] px-3 py-1 text-xs text-[var(--recv-ink,#e2e8f0)]"
              >
                {status.kind === 'away' && (
                  <>
                    <span>Stranger disconnected</span>
                    <span className="font-semibold tabular-nums text-[#fbbf24]">{status.left}s</span>
                  </>
                )}
                {status.kind === 'back' && <span className="font-semibold text-[#4ade80]">Stranger reconnected</span>}
                {status.kind === 'offline' && <span>You are offline. Reconnecting...</span>}
              </div>
            )}
            <div ref={endRef} aria-hidden="true" />
          </div>
        )}

        {!agreed && (
          <div className="shrink-0 px-1 pb-2 pt-3">
            <p className="text-lg font-bold leading-snug lg:text-2xl" style={{ color: warn }}>You must be at least 18 years old</p>
            <ul className="mt-0.5 space-y-0.5 text-base leading-snug opacity-90 lg:text-xl">
              <li>No nudity, hate speech, or harassment</li>
              <li>Do not ask for gender. This is not a dating site</li>
              <li>Respect others and be kind</li>
              <li>Violators will be banned</li>
            </ul>
            <button
              type="button"
              onClick={() => setAgreed(true)}
              className="mt-3 h-[37px] rounded-lg bg-gradient-to-b from-[#3b9bff] to-[#1d6fe8] px-5 text-[13.6px] font-semibold text-white shadow active:opacity-80 lg:mt-4 lg:h-[41px] lg:px-[27px] lg:text-[15.3px]"
            >
              I Agree
            </button>
            <label className="mt-3 flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={sameCountry}
                onChange={(e) => onSameCountryChange(e.target.checked)}
                className="mt-0.5 size-5 shrink-0 accent-[#2563eb]"
              />
              <span>
                <span className="block font-semibold lg:text-lg">Prefer people from my country</span>
                <span className="block text-sm opacity-70 lg:text-base">Uncheck to match worldwide.</span>
              </span>
            </label>
          </div>
        )}
      </section>

      {(replyTo || editing) && (
        <div className="flex shrink-0 items-center gap-2.5 rounded-2xl border bg-card px-3 py-2 text-[13px] backdrop-blur-xl group-data-[themed]:border-[var(--bd)] group-data-[themed]:bg-[var(--tab)]">
          <span className={cn('w-[3px] self-stretch rounded-full', editing ? 'bg-[#fbbf24]' : 'bg-[#60a5fa]')} />
          <div className="min-w-0 flex-1">
            <b className={cn('block text-[12.5px]', editing ? 'text-[#fcd34d]' : 'text-[#93c5fd]')}>
              {editing ? 'Editing message' : `Replying to ${replyTo?.who === 'you' ? 'yourself' : label}`}
            </b>
            <span className="block truncate opacity-80">{editing ? draft : replyTo?.text}</span>
          </div>
          <button
            type="button"
            aria-label="Cancel"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => (editing ? cancelEdit() : setReplyTo(null))}
            className="px-1 text-lg opacity-80"
          >
            {'\u2715'}
          </button>
        </div>
      )}

      <form onSubmit={send} className="flex shrink-0 items-center gap-1.5 lg:gap-2.5">
        <button
          type="button"
          onClick={main.on}
          disabled={!agreed}
          className={cn('h-12 w-[58px] shrink-0 rounded-2xl text-sm font-bold lg:h-14 lg:w-[84px] lg:text-base text-white transition-opacity active:opacity-80 disabled:opacity-50', main.cls)}
        >
          {main.label}
        </button>
        <label htmlFor="message" className="sr-only">Message</label>
        <textarea
          ref={inputRef}
          id="message"
          rows={1}
          autoComplete="off"
          name="omechat-chat-message"
          enterKeyHint="send"
          aria-autocomplete="none"
          data-lpignore="true"
          data-1p-ignore="true"
          data-form-type="other"
          value={draft}
          disabled={phase !== 'connected'}
          onChange={(e) => {
            const v = e.target.value
            // Enter key (soft keyboard or Shift+Enter) arrives as a new line: send instead
            if (v.includes('\n')) sendText(v.replace(/\n/g, ' '))
            else onInput(v)
          }}
          maxLength={500}
          placeholder="Type a message..."
          className="h-12 min-w-0 flex-1 resize-none overflow-hidden rounded-2xl border bg-card px-3.5 py-3 text-[13.6px] leading-6 lg:h-14 lg:px-5 lg:py-3.5 lg:text-[15.3px] lg:leading-7 outline-none backdrop-blur-xl placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring group-data-[themed]:border-[var(--bd)] group-data-[themed]:bg-[var(--tab)]"
        />
        <button
          type="submit"
          onMouseDown={(e) => e.preventDefault()} // tapping Send must not take focus away from the message box
          disabled={!draft.trim() || phase !== 'connected'}
          className={cn('h-12 w-[58px] shrink-0 rounded-2xl px-0 text-sm font-bold lg:h-14 lg:w-[84px] lg:text-base text-white transition-colors disabled:bg-[#475569] disabled:text-white/60', editing ? 'bg-[#16a34a]' : 'bg-[#2563eb]')}
        >
          {editing ? '\u2713' : 'Send'}
        </button>
      </form>

      {menu && (
        <div className="fixed inset-0 z-40" onClick={() => setMenu(null)}>
          <div
            className="absolute w-[150px] overflow-hidden rounded-2xl border border-white/10 bg-[#202020] text-[15px] text-white shadow-2xl"
            style={{ top: menu.top, right: menu.right }}
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" className="flex w-full items-center justify-between px-4 py-3" onClick={() => { const m = msgs.find((x) => x.id === menu.id); if (m) startEdit(m) }}>
              Edit <span aria-hidden="true">{'\u270f\ufe0f'}</span>
            </button>
            <button
              type="button"
              className="flex w-full items-center justify-between border-t border-white/10 px-4 py-3"
              onClick={() => {
                const m = msgs.find((x) => x.id === menu.id)
                if (m) navigator.clipboard?.writeText(m.text)
                setMenu(null)
              }}
            >
              Copy <span aria-hidden="true">{'\ud83d\udccb'}</span>
            </button>
          </div>
        </div>
      )}

      {confirmExit && (
        <div role="dialog" aria-modal="true" aria-label="Leave this chat?" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">
          <div className="w-full max-w-[320px] rounded-3xl border border-white/10 bg-[#202020] p-6 text-center text-white shadow-2xl">
            <div className="text-[34px]" aria-hidden="true">👋</div>
            <p className="mt-2 text-xl font-bold">Leave this chat?</p>
            <p className="mt-1.5 text-sm opacity-70">Your current chat will end.</p>
            <div className="mt-5 flex gap-2.5">
              <button
                type="button"
                autoFocus
                onClick={() => setConfirmExit(false)}
                className="h-12 flex-1 rounded-full border border-white/15 bg-[#161616] text-[17px] font-semibold"
              >
                No, stay
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmExit(false)
                  leaveToIdle()
                }}
                className="h-12 flex-1 rounded-full bg-[#d13f3f] text-[17px] font-semibold"
              >
                Yes, leave
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
