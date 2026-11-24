'use client'

import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import {
  Check, ChevronRight, ChevronsRight, Flag, Mic, MicOff, RefreshCw, Settings, Sparkles, UserPlus, Video, VideoOff, X,
} from 'lucide-react'
import { Avatar } from '@/components/avatar'
import { addFriend, type Identity, type PublicProfile } from '@/components/identity'
import { cn } from '@/lib/utils'
import { flagOf } from './country'
import { blockText, getSocket } from './socket'
import { BlockNotice } from './block-notice'

type Phase = 'idle' | 'searching' | 'connected'
type Msg = { id: number; from: 'you' | 'peer'; text: string }
type Req = { id: string; from: PublicProfile }

const ICE: RTCIceServer[] = [{ urls: 'stun:stun.l.google.com:19302' }]
if (process.env.NEXT_PUBLIC_TURN_URL) {
  ICE.push({
    urls: process.env.NEXT_PUBLIC_TURN_URL,
    username: process.env.NEXT_PUBLIC_TURN_USER,
    credential: process.env.NEXT_PUBLIC_TURN_PASS,
  })
}
const REASONS = ['Nudity or sexual content', 'Harassment or abuse', 'Looks under 18', 'Something else']

function Sheet({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: ReactNode }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/60" />
      <div className="relative max-h-[80dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-[#0f1424] p-4 pb-8 text-white">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-bold">{title}</h2>
          <button type="button" onClick={onClose} className="flex size-9 items-center justify-center rounded-full border border-white/20">
            <X className="size-4" aria-hidden="true" />
            <span className="sr-only">Close</span>
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function Toggle({ on }: { on: boolean }) {
  return (
    <span className={cn('relative h-5 w-9 rounded-full transition-colors', on ? 'bg-[#2563eb]' : 'bg-slate-500')}>
      <span className={cn('absolute left-0.5 top-0.5 size-4 rounded-full bg-white transition-transform', on && 'translate-x-4')} />
    </span>
  )
}

const glass = 'border border-white/15 bg-black/40 backdrop-blur-md'

export function VideoRoom({ identity, me, country }: { identity: Identity; me: PublicProfile; country: string | null }) {
  const socket = getSocket()
  const [phase, setPhase] = useState<Phase>('idle')
  const [peer, setPeer] = useState<PublicProfile | null>(null)
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [typing, setTyping] = useState(false)
  const [draft, setDraft] = useState('')
  const [mic, setMic] = useState(true)
  const [cam, setCam] = useState(true)
  const [facing, setFacing] = useState<'user' | 'environment'>('user')
  const [beauty, setBeauty] = useState(false)
  const [mirror, setMirror] = useState(true)
  const [sound, setSound] = useState(true)
  const [same, setSame] = useState(false)
  const [sheet, setSheet] = useState<null | 'settings' | 'report' | 'requests'>(null)
  const [toast, setToast] = useState('')
  const [reqs, setReqs] = useState<Req[]>([])
  const [banner, setBanner] = useState<Req | null>(null)
  const [blockUntil, setBlockUntil] = useState<number | null>(null)
  const [camError, setCamError] = useState('')
  // Reconnect: small chip with a 29s timer when the stranger drops, "reconnected" when they return
  const [status, setStatus] = useState<null | { kind: 'away' } | { kind: 'back' } | { kind: 'offline' }>(null)
  const resumeRef = useRef<{ id: string; token: string } | null>(null)
  const initiatorRef = useRef(false)
  const awayTick = useRef<number | undefined>(undefined)
  const phaseRef = useRef<Phase>('idle')
  const startRef = useRef<() => void>(() => {})
  const chatEndRef = useRef<HTMLDivElement>(null)

  const localRef = useRef<HTMLVideoElement>(null)
  const remoteRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const pcRef = useRef<RTCPeerConnection | null>(null)
  const pendingIce = useRef<RTCIceCandidateInit[]>([])
  const aliveRef = useRef(true)
  const timers = useRef<number[]>([])
  const typingOff = useRef<number | undefined>(undefined)
  const sameRef = useRef(same)
  const meRef = useRef(me)
  const countryRef = useRef(country)
  const micRef = useRef(mic)
  const camRef = useRef(cam)

  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ block: 'end' })
  }, [msgs, typing])

  useEffect(() => {
    sameRef.current = same
    meRef.current = me
    countryRef.current = country
    micRef.current = mic
    camRef.current = cam
  }, [same, me, country, mic, cam])

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms))
  }
  const flash = useCallback((t: string, ms = 1600) => {
    setToast(t)
    window.setTimeout(() => setToast(''), ms)
  }, [])

  // ---- my camera and mic (the buttons below only change MY tracks) ----
  const startCamera = useCallback(async (face: 'user' | 'environment') => {
    try {
      streamRef.current?.getTracks().forEach((t) => t.stop())
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: face }, audio: true })
      if (!aliveRef.current) {
        // the page was closed while the permission was being asked: do not leave the camera on
        s.getTracks().forEach((t) => t.stop())
        return
      }
      s.getAudioTracks().forEach((t) => (t.enabled = micRef.current))
      s.getVideoTracks().forEach((t) => (t.enabled = camRef.current))
      streamRef.current = s
      if (localRef.current) localRef.current.srcObject = s
      pcRef.current?.getSenders().forEach((sender) => {
        const t = s.getTracks().find((x) => x.kind === sender.track?.kind)
        if (t) void sender.replaceTrack(t)
      })
      setCamError('')
    } catch {
      setCamError('Allow camera and microphone to start video chat.')
    }
  }, [])

  const closePc = useCallback(() => {
    pcRef.current?.close()
    pcRef.current = null
    pendingIce.current = []
    if (remoteRef.current) remoteRef.current.srcObject = null
  }, [])

  useEffect(() => {
    aliveRef.current = true
    void startCamera('user')
    return () => {
      aliveRef.current = false
      streamRef.current?.getTracks().forEach((t) => t.stop())
      closePc()
      timers.current.forEach((id) => clearTimeout(id))
    }
  }, [startCamera, closePc])

  const makePc = useCallback(() => {
    closePc()
    const pc = new RTCPeerConnection({ iceServers: ICE })
    streamRef.current?.getTracks().forEach((t) => pc.addTrack(t, streamRef.current!))
    pc.ontrack = (e) => {
      if (remoteRef.current) remoteRef.current.srcObject = e.streams[0]
    }
    pc.onicecandidate = (e) => {
      if (e.candidate) socket?.emit('signal', { type: 'ice', data: e.candidate })
    }
    pcRef.current = pc
    return pc
  }, [closePc, socket])

  // ---- server events ----
  useEffect(() => {
    if (!socket) return
    const flush = async (pc: RTCPeerConnection) => {
      for (const c of pendingIce.current) await pc.addIceCandidate(c)
      pendingIce.current = []
    }
    const clearAway = () => {
      if (awayTick.current) window.clearInterval(awayTick.current)
      awayTick.current = undefined
    }
    // After a drop, the side that made the first offer asks for a fresh network path (ICE restart).
    const renegotiate = async () => {
      const pc = pcRef.current
      if (!pc || !initiatorRef.current) return
      try {
        const offer = await pc.createOffer({ iceRestart: true })
        await pc.setLocalDescription(offer)
        socket.emit('signal', { type: 'offer', data: offer })
      } catch {}
    }
    const onMatched = async (d: { peer: PublicProfile; initiator: boolean; room?: { id: string; token: string } }) => {
      resumeRef.current = d.room ?? null
      initiatorRef.current = d.initiator
      clearAway()
      setStatus(null)
      setPeer(d.peer)
      setMsgs([])
      setPhase('connected')
      const pc = makePc()
      if (d.initiator) {
        try {
          const offer = await pc.createOffer()
          await pc.setLocalDescription(offer)
          socket.emit('signal', { type: 'offer', data: offer })
        } catch {}
      }
    }
    const onSignal = async (m: { type: string; data: RTCSessionDescriptionInit & RTCIceCandidateInit }) => {
      const pc = pcRef.current
      if (!pc || !m) return
      // a bad or late message from the other side must not break the call
      try {
        if (m.type === 'offer') {
          await pc.setRemoteDescription(m.data)
          await flush(pc)
          const answer = await pc.createAnswer()
          await pc.setLocalDescription(answer)
          socket.emit('signal', { type: 'answer', data: answer })
        } else if (m.type === 'answer') {
          await pc.setRemoteDescription(m.data)
          await flush(pc)
        } else if (m.type === 'ice') {
          if (pc.remoteDescription) await pc.addIceCandidate(m.data)
          else pendingIce.current.push(m.data)
        }
      } catch {}
    }
    const onMessage = (d: { text: string }) => {
      setTyping(false)
      setMsgs((p) => [...p, { id: Date.now() + Math.random(), from: 'peer', text: d.text }])
    }
    const onTyping = (on: boolean) => setTyping(on)
    const onLeft = (d?: { reason?: string }) => {
      resumeRef.current = null
      clearAway()
      setStatus(null)
      closePc()
      setPeer(null)
      setMsgs([])
      setTyping(false)
      setPhase('idle')
      // Our own chat could not be resumed: connect to someone new straight away.
      if (d?.reason === 'timeout') startRef.current()
    }
    const onAway = () => {
      clearAway()
      setTyping(false)
      setStatus({ kind: 'away' })
    }
    const onBack = () => {
      clearAway()
      setStatus({ kind: 'back' })
      window.setTimeout(() => setStatus((s) => (s && s.kind === 'back' ? null : s)), 4000)
      void renegotiate()
    }
    const onDisconnect = () => {
      if (phaseRef.current === 'connected') setStatus({ kind: 'offline' })
    }
    const onConnect = () => {
      if (phaseRef.current === 'connected' && resumeRef.current) socket.emit('resume', resumeRef.current)
      else if (phaseRef.current === 'searching') {
        socket.emit('join', { mode: 'video', profile: { ...meRef.current, country: countryRef.current }, sameCountry: sameRef.current })
      }
    }
    const onResumed = (d: { peer: PublicProfile; initiator: boolean }) => {
      initiatorRef.current = d.initiator
      setPeer(d.peer)
      setStatus(null)
      void renegotiate()
    }
    const onResumeFailed = () => onLeft({ reason: 'timeout' })
    const onRequest = (d: { fromId: string; from: PublicProfile }) => {
      const r = { id: d.fromId, from: d.from }
      setReqs((p) => [...p.filter((x) => x.id !== r.id), r])
      setBanner(r)
      window.setTimeout(() => setBanner(null), 6000)
    }
    const onResponse = (d: { accept: boolean; from: PublicProfile }) => {
      if (d.accept) {
        addFriend({ name: d.from.name, photo: d.from.photo })
        flash(`${d.from.name} is now your friend`)
      }
    }
    // Blocked for 3 minutes (banned word)
    const onBlocked = (d: { ms: number }) => {
      setBlockUntil(Date.now() + d.ms)
      resumeRef.current = null
      clearAway()
      setStatus(null)
      closePc()
      setPeer(null)
      setMsgs([])
      setTyping(false)
      setPhase('idle')
      flash(`You are blocked for ${blockText(d.ms)}. Telegram and paid promotions are not allowed here.`, 6000)
    }
    socket.on('blocked', onBlocked)
    socket.on('matched', onMatched)
    socket.on('signal', onSignal)
    socket.on('message', onMessage)
    socket.on('typing', onTyping)
    socket.on('peer-left', onLeft)
    socket.on('peer-away', onAway)
    socket.on('peer-back', onBack)
    socket.on('disconnect', onDisconnect)
    socket.on('connect', onConnect)
    socket.on('resumed', onResumed)
    socket.on('resume-failed', onResumeFailed)
    socket.on('friend-request', onRequest)
    socket.on('friend-response', onResponse)
    return () => {
      socket.off('blocked', onBlocked)
      socket.off('matched', onMatched)
      socket.off('signal', onSignal)
      socket.off('message', onMessage)
      socket.off('typing', onTyping)
      socket.off('peer-left', onLeft)
      socket.off('peer-away', onAway)
      socket.off('peer-back', onBack)
      socket.off('disconnect', onDisconnect)
      socket.off('connect', onConnect)
      socket.off('resumed', onResumed)
      socket.off('resume-failed', onResumeFailed)
      clearAway()
      socket.off('friend-request', onRequest)
      socket.off('friend-response', onResponse)
    }
  }, [socket, makePc, closePc, flash])

  // ---- actions ----
  const start = useCallback(() => {
    setMsgs([])
    setTyping(false)
    setPeer(null)
    if (!socket) {
      // No server connected: never fake a stranger.
      setPhase('idle')
      flash('Chat server is not connected right now. Please try again in a moment.', 4000)
      return
    }
    resumeRef.current = null
    if (awayTick.current) window.clearInterval(awayTick.current)
    awayTick.current = undefined
    setStatus(null)
    setPhase('searching')
    socket.emit('join', { mode: 'video', profile: { ...meRef.current, country: countryRef.current }, sameCountry: sameRef.current })
  }, [socket, flash])

  useEffect(() => {
    startRef.current = start
  }, [start])

  function next() {
    socket?.emit('skip')
    closePc()
    start()
  }
  function stop() {
    socket?.emit('stop')
    resumeRef.current = null
    if (awayTick.current) window.clearInterval(awayTick.current)
    awayTick.current = undefined
    setStatus(null)
    timers.current.forEach((id) => clearTimeout(id))
    setPhase('idle')
  }
  function toggleMic() {
    const v = !mic
    setMic(v)
    streamRef.current?.getAudioTracks().forEach((t) => (t.enabled = v))
    flash(v ? 'Your mic is on' : 'Your mic is off')
  }
  function toggleCam() {
    const v = !cam
    setCam(v)
    streamRef.current?.getVideoTracks().forEach((t) => (t.enabled = v))
    flash(v ? 'Your camera is on' : 'Your camera is off')
  }
  function flip() {
    const f = facing === 'user' ? 'environment' : 'user'
    setFacing(f)
    void startCamera(f)
    flash('Camera flipped')
  }
  function sendMsg(e: FormEvent) {
    e.preventDefault()
    const text = draft.trim()
    if (!text || phase !== 'connected') return
    setMsgs((p) => [...p, { id: Date.now(), from: 'you', text: text.slice(0, 500) }])
    setDraft('')
    socket?.emit('message', { text: text.slice(0, 500) })
    socket?.emit('typing', false)
  }
  function onInput(v: string) {
    setDraft(v)
    if (!socket || phase !== 'connected') return
    socket.emit('typing', true)
    window.clearTimeout(typingOff.current)
    typingOff.current = window.setTimeout(() => socket.emit('typing', false), 1500)
  }
  // Friend requests only between two Google users (anonymous users cannot send or get them).
  const canFriend = identity.type === 'google' && !!peer?.google
  function friend() {
    if (!canFriend || !peer) return
    socket?.emit('friend-request')
    flash(`Friend request sent to ${peer.name}`)
  }
  function answer(r: Req, accept: boolean) {
    socket?.emit('friend-response', { to: r.id, accept })
    if (accept) {
      addFriend({ name: r.from.name, photo: r.from.photo })
      flash(`${r.from.name} is now your friend`)
    }
    setReqs((p) => p.filter((x) => x.id !== r.id))
    setBanner(null)
  }
  function report(reason: string) {
    socket?.emit('report', { reason })
    setSheet(null)
    flash('Report sent')
    next()
  }

  const railBtn = (on: boolean, off = false) =>
    cn('flex size-[42px] items-center justify-center rounded-full', glass, off && 'border-0 bg-[#dc2626]', on && 'border-0 bg-[#4f7cff]')

  const top = 'calc(env(safe-area-inset-top, 0px) + 12px)'

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-black text-white lg:grid lg:grid-cols-[1fr_1fr_minmax(320px,26%)] lg:grid-rows-[minmax(0,1fr)_auto] lg:gap-3 lg:p-3">
      <BlockNotice until={blockUntil} onDone={() => setBlockUntil(null)} />
      {/* stranger (top half) */}
      <div className="relative flex-1 overflow-hidden bg-[#0b1020] lg:min-h-0 lg:rounded-2xl">
        <video ref={remoteRef} autoPlay playsInline muted={!sound} className={cn('absolute inset-0 size-full object-cover', phase !== 'connected' && 'hidden')} />
        {phase === 'idle' && <p className="absolute inset-x-0 top-[38%] text-center text-xl font-bold opacity-90">Tap Start to meet someone</p>}
        {phase === 'searching' && (
          <div className="absolute inset-x-0 top-[42%] flex flex-col items-center gap-3">
            <span className="size-24 animate-ping rounded-full border-2 border-[#4f7cff]" />
            <span className="rounded-full bg-slate-800/90 px-3.5 py-1.5 text-sm">Looking for someone to talk to{'\u2026'}</span>
          </div>
        )}

        {phase === 'connected' && peer && (
          <>
            <div className={cn('absolute left-3 flex max-w-[62%] items-center gap-2.5 rounded-full py-1 pl-1 pr-4', glass)} style={{ top }}>
              <Avatar name={peer.name} photo={peer.photo} size={42} />
              <div className="min-w-0">
                <p className="truncate text-[15px] font-bold leading-tight">
                  {peer.name} {peer.country ? <span className="font-normal">{flagOf(peer.country)}</span> : null}
                </p>
                <p className="text-xs opacity-85">{peer.age ? `${peer.age} \u00B7 ${peer.gender ?? ''}` : 'Anonymous'}</p>
              </div>
            </div>
            {status && (
              <div
                role="status"
                className={cn('absolute right-[66px] flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold', glass)}
                style={{ top }}
              >
                {status.kind === 'away' && <span>Stranger disconnected</span>}
                {status.kind === 'back' && <span className="text-[#4ade80]">Stranger reconnected</span>}
                {status.kind === 'offline' && <span>You are offline. Reconnecting...</span>}
              </div>
            )}
            {canFriend && (
              <button
                type="button"
                onClick={friend}
                className={cn('absolute left-3 flex size-11 items-center justify-center rounded-full', glass)}
                style={{ top: 'calc(env(safe-area-inset-top, 0px) + 72px)' }}
              >
                <UserPlus className="size-[22px]" aria-hidden="true" />
                <span className="sr-only">Send friend request</span>
              </button>
            )}
          </>
        )}

        <div className="absolute right-3 flex flex-col gap-2.5" style={{ top }}>
          <button type="button" onClick={() => setSheet('report')} className={cn('flex size-[42px] items-center justify-center rounded-full', glass, 'lg:border-0 lg:bg-[#dc2626]')}>
            <Flag className="size-5" aria-hidden="true" />
            <span className="sr-only">Report</span>
          </button>
          <button type="button" onClick={() => setSheet('settings')} className={cn('relative flex size-[42px] items-center justify-center rounded-full', glass)}>
            <Settings className="size-5" aria-hidden="true" />
            {reqs.length > 0 && <span className="absolute right-1.5 top-1.5 size-2.5 rounded-full border-2 border-[#0b1020] bg-red-500" />}
            <span className="sr-only">Settings</span>
          </button>
        </div>

        {banner && (
          <div className="absolute inset-x-3 z-20 flex items-center gap-2.5 rounded-2xl border border-white/20 bg-[#0f1424]/95 p-2.5" style={{ top: 'calc(env(safe-area-inset-top, 0px) + 128px)' }}>
            <Avatar name={banner.from.name} photo={banner.from.photo} size={40} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{banner.from.name}</p>
              <p className="text-xs opacity-75">sent you a friend request</p>
            </div>
            <button type="button" onClick={() => answer(banner, true)} className="rounded-full bg-[#16a34a] px-3 py-1.5 text-xs font-bold">Accept</button>
            <button type="button" onClick={() => answer(banner, false)} className={cn('rounded-full px-3 py-1.5 text-xs font-bold', glass)}>Decline</button>
          </div>
        )}
      </div>

      {/* middle button */}
      <div className="pointer-events-none absolute inset-x-0 top-1/2 z-20 flex -translate-y-1/2 justify-center lg:pointer-events-auto lg:static lg:col-span-2 lg:row-start-2 lg:translate-y-0 lg:py-0.5">
        {phase === 'connected' ? (
          <button type="button" onClick={next} className="pointer-events-auto flex size-[68px] items-center justify-center rounded-full bg-[#f97316] shadow-[0_4px_18px_rgba(249,115,22,0.5)] lg:h-12 lg:w-auto lg:gap-2 lg:px-8">
            <ChevronsRight className="size-8 lg:size-6" aria-hidden="true" />
            <span className="sr-only lg:not-sr-only lg:text-lg lg:font-extrabold">Next</span>
          </button>
        ) : phase === 'searching' ? (
          <button type="button" onClick={stop} className="pointer-events-auto h-[52px] rounded-full bg-slate-600 px-9 text-lg font-extrabold">Stop</button>
        ) : (
          <button type="button" onClick={start} className="pointer-events-auto h-[52px] rounded-full bg-[#16a34a] px-9 text-lg font-extrabold">Start</button>
        )}
      </div>

      {/* me (bottom half) */}
      <div className="relative flex-1 overflow-hidden bg-[#252c52] lg:min-h-0 lg:rounded-2xl">
        <video
          ref={localRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 size-full object-cover"
          style={{
            transform: mirror && facing === 'user' ? 'scaleX(-1)' : undefined,
            filter: beauty ? 'contrast(1.05) saturate(1.15) brightness(1.06)' : undefined,
          }}
        />
        {(!cam || camError) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#111827] px-8 text-center">
            <VideoOff className="size-10" aria-hidden="true" />
            <p className="text-sm opacity-80">{camError || 'Your camera is off'}</p>
          </div>
        )}

        <div className={cn('absolute left-3 top-12 flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-sm font-semibold lg:hidden', glass)}>
          <Avatar name={me.name} photo={me.photo} size={28} />
          {me.name}
          {!mic && <span className="flex size-5 items-center justify-center rounded-full bg-red-600"><MicOff className="size-3" aria-hidden="true" /></span>}
          {!cam && <span className="flex size-5 items-center justify-center rounded-full bg-red-600"><VideoOff className="size-3" aria-hidden="true" /></span>}
        </div>

        <div className="absolute right-3 top-12 flex flex-col gap-2.5 lg:top-3">
          <button type="button" onClick={toggleMic} className={railBtn(false, !mic)}>
            {mic ? <Mic className="size-5" aria-hidden="true" /> : <MicOff className="size-5" aria-hidden="true" />}
            <span className="sr-only">Toggle my microphone</span>
          </button>
          <button type="button" onClick={toggleCam} className={railBtn(false, !cam)}>
            {cam ? <Video className="size-5" aria-hidden="true" /> : <VideoOff className="size-5" aria-hidden="true" />}
            <span className="sr-only">Toggle my camera</span>
          </button>
          <button type="button" onClick={flip} className={railBtn(facing === 'environment')}>
            <RefreshCw className="size-5" aria-hidden="true" />
            <span className="sr-only">Flip camera</span>
          </button>
          <button type="button" onClick={() => { setBeauty((v) => !v); flash(beauty ? 'Beauty filter off' : 'Beauty filter on') }} className={railBtn(beauty)}>
            <Sparkles className="size-5" aria-hidden="true" />
            <span className="sr-only">Beauty filter</span>
          </button>
        </div>

        <div className="absolute inset-x-3 bottom-[calc(env(safe-area-inset-bottom,0px)+72px)] right-[68px] flex flex-col items-start gap-1.5 lg:hidden" aria-live="polite">
          {msgs.slice(-3).map((m) => (
            <p key={m.id} className={cn('max-w-full break-words rounded-2xl px-3.5 py-1.5 text-base leading-snug', m.from === 'you' ? 'bg-[#2563eb]' : 'bg-slate-800/90')}>
              <span className={cn('font-semibold', m.from === 'peer' && 'text-[#f87171]')}>{m.from === 'you' ? 'You' : (peer?.name ?? 'Stranger')}</span>: {m.text}
            </p>
          ))}
          {typing && (
            <span className="flex items-center gap-1 text-sm italic opacity-90">
              typing
              {[0, 1, 2].map((d) => (
                <span key={d} className="size-1 animate-bounce rounded-full bg-current" style={{ animationDelay: `${d * 0.15}s` }} />
              ))}
            </span>
          )}
        </div>

        <form onSubmit={sendMsg} className="absolute inset-x-3 bottom-[calc(env(safe-area-inset-bottom,0px)+12px)] flex gap-2 lg:hidden">
          <input
            value={draft}
            onChange={(e) => onInput(e.target.value)}
            disabled={phase !== 'connected'}
            maxLength={500}
            autoComplete="off"
            placeholder="Type a message..."
            className={cn('h-[46px] min-w-0 flex-1 rounded-full px-[18px] text-base outline-none placeholder:text-slate-300', glass)}
          />
          <button type="submit" disabled={!draft.trim() || phase !== 'connected'} className="h-[46px] rounded-full bg-[#2563eb] px-5 font-bold disabled:bg-slate-600 disabled:text-white/60">
            Send
          </button>
        </form>
      </div>

      {/* desktop only: chat panel on the right */}
      <aside className="hidden min-h-0 flex-col rounded-2xl bg-[#0f1424] p-3 lg:col-start-3 lg:row-span-2 lg:row-start-1 lg:flex">
        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto" aria-live="polite">
          <div className="flex-1" />
          {msgs.map((m) => (
            <p
              key={m.id}
              className={cn('max-w-[85%] break-words rounded-2xl px-3.5 py-1.5 text-base leading-snug', m.from === 'you' ? 'self-end bg-[#2563eb]' : 'self-start bg-slate-800/90')}
            >
              <span className={cn('font-semibold', m.from === 'peer' && 'text-[#f87171]')}>{m.from === 'you' ? 'You' : (peer?.name ?? 'Stranger')}</span>: {m.text}
            </p>
          ))}
          {typing && (
            <span className="flex items-center gap-1 text-sm italic opacity-90">
              typing
              {[0, 1, 2].map((d) => (
                <span key={d} className="size-1 animate-bounce rounded-full bg-current" style={{ animationDelay: `${d * 0.15}s` }} />
              ))}
            </span>
          )}
          <div ref={chatEndRef} />
        </div>
        <form onSubmit={sendMsg} className="mt-3 flex shrink-0 gap-2">
          <input
            value={draft}
            onChange={(e) => onInput(e.target.value)}
            disabled={phase !== 'connected'}
            maxLength={500}
            autoComplete="off"
            placeholder="Type a message..."
            className={cn('h-[46px] min-w-0 flex-1 rounded-full px-[18px] text-base outline-none placeholder:text-slate-300', glass)}
          />
          <button type="submit" disabled={!draft.trim() || phase !== 'connected'} className="h-[46px] rounded-full bg-[#2563eb] px-5 font-bold disabled:bg-slate-600 disabled:text-white/60">
            Send
          </button>
        </form>
      </aside>

      {toast && (
        <div className="pointer-events-none absolute left-1/2 top-[62%] z-30 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/75 px-4 py-2 text-sm font-semibold">{toast}</div>
      )}

      <Sheet open={sheet === 'settings'} title="Settings" onClose={() => setSheet(null)}>
        <button type="button" onClick={() => setSheet('requests')} className="flex w-full items-center justify-between border-t border-white/10 py-3.5">
          <span className="flex items-center gap-2.5"><UserPlus className="size-5" aria-hidden="true" />Requests
            {reqs.length > 0 && <span className="rounded-full bg-red-500 px-2 text-xs font-bold">{reqs.length}</span>}
          </span>
          <ChevronRight className="size-5 opacity-70" aria-hidden="true" />
        </button>
        {[
          ['Same Country', same, () => setSame((v) => !v)],
          ['Mirror my video', mirror, () => setMirror((v) => !v)],
          ['Beauty filter', beauty, () => setBeauty((v) => !v)],
          ['Sound', sound, () => setSound((v) => !v)],
        ].map(([label, on, fn]) => (
          <button key={label as string} type="button" onClick={fn as () => void} className="flex w-full items-center justify-between border-t border-white/10 py-3.5">
            {label as string}
            <Toggle on={on as boolean} />
          </button>
        ))}
        <div className="flex items-center justify-between border-t border-white/10 py-3.5">
          Video quality <b className="text-[#4f7cff]">Auto</b>
        </div>
      </Sheet>

      <Sheet open={sheet === 'requests'} title="Requests" onClose={() => setSheet('settings')}>
        {reqs.length === 0 && <p className="py-3 text-sm opacity-70">No requests</p>}
        {reqs.map((r) => (
          <div key={r.id} className="flex items-center gap-3 border-t border-white/10 py-3">
            <Avatar name={r.from.name} photo={r.from.photo} size={42} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold">{r.from.name}</p>
              <p className="text-xs opacity-70">wants to be your friend</p>
            </div>
            <button type="button" onClick={() => answer(r, true)} className="flex items-center gap-1 rounded-full bg-[#16a34a] px-3 py-1.5 text-xs font-bold"><Check className="size-3" aria-hidden="true" />Accept</button>
            <button type="button" onClick={() => answer(r, false)} className={cn('rounded-full px-3 py-1.5 text-xs font-bold', glass)}>Decline</button>
          </div>
        ))}
      </Sheet>

      <Sheet open={sheet === 'report'} title="Report this user" onClose={() => setSheet(null)}>
        {REASONS.map((r) => (
          <button key={r} type="button" onClick={() => report(r)} className="mt-2 block w-full rounded-2xl border border-white/15 px-4 py-3.5 text-left">
            {r}
          </button>
        ))}
      </Sheet>
    </div>
  )
}
