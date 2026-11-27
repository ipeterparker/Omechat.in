/* eslint-disable @next/next/no-img-element */
export function Avatar({ name, photo, size = 40 }: { name: string; photo?: string; size?: number }) {
  const box = { width: size, height: size }
  if (photo) return <img src={photo} alt="" referrerPolicy="no-referrer" style={box} className="shrink-0 rounded-full object-cover" />
  return (
    <span
      style={{ ...box, fontSize: size * 0.42 }}
      className="flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-blue-600 font-bold text-white"
    >
      {(name || '?').slice(0, 1).toUpperCase()}
    </span>
  )
}
