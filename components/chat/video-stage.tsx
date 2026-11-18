'use client'

import { useEffect, useRef, useState } from 'react'
import { Camera, CameraOff } from 'lucide-react'

export function VideoStage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [cameraOn, setCameraOn] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    return () => streamRef.current?.getTracks().forEach((track) => track.stop())
  }, [])

  async function toggleCamera() {
    if (cameraOn) {
      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = null
      setCameraOn(false)
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      setCameraOn(true)
      setError(null)
    } catch {
      setError('Camera access was blocked. Allow it in your browser settings.')
    }
  }

  return (
    <section aria-label="Video" className="grid shrink-0 grid-cols-2 gap-3 md:flex-1 md:grid-cols-1 md:grid-rows-2">
      <div className="relative flex aspect-[3/4] flex-col items-center justify-center overflow-hidden rounded-3xl border bg-card/60 md:aspect-auto">
        <span className="relative flex size-14 items-center justify-center" aria-hidden="true">
          <span className="absolute inset-0 animate-ping rounded-full bg-primary/25" />
          <span className="absolute inset-3 rounded-full bg-primary/20" />
          <span className="relative size-3 rounded-full bg-primary" />
        </span>
        <p className="mt-4 px-2 text-center text-xs text-muted-foreground">Looking for a stranger…</p>
        <span className="absolute left-3 top-3 rounded-full bg-background/70 px-2.5 py-1 text-[11px] font-medium backdrop-blur">
          Stranger
        </span>
      </div>

      <div className="relative flex aspect-[3/4] flex-col items-center justify-center overflow-hidden rounded-3xl border bg-card/60 md:aspect-auto">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={cameraOn ? 'absolute inset-0 size-full -scale-x-100 object-cover' : 'hidden'}
        />
        {!cameraOn && (
          <p className="px-3 text-center text-xs text-muted-foreground">{error ?? 'Your camera is off'}</p>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-background/70 px-2.5 py-1 text-[11px] font-medium backdrop-blur">
          You
        </span>
        <button
          type="button"
          onClick={toggleCamera}
          className="absolute bottom-3 flex h-9 items-center gap-1.5 rounded-full bg-background/80 px-3 text-xs font-semibold backdrop-blur transition-colors hover:bg-background"
        >
          {cameraOn ? <CameraOff className="size-4" aria-hidden="true" /> : <Camera className="size-4" aria-hidden="true" />}
          {cameraOn ? 'Turn off' : 'Turn on'}
        </button>
      </div>
    </section>
  )
}
