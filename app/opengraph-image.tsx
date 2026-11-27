import { ImageResponse } from 'next/og'

export const alt = 'Omechat: free random chat with strangers'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const dynamic = 'force-static'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a0e1a 0%, #1c2652 100%)', color: '#ffffff',
        }}
      >
        <div style={{ fontSize: 132, fontWeight: 800, letterSpacing: -4 }}>Omechat</div>
        <div style={{ fontSize: 48, marginTop: 16, color: '#9fb0ff' }}>Free random text and video chat</div>
        <div style={{ fontSize: 34, marginTop: 40, color: '#94a3b8' }}>No signup for text chat. 18+ only.</div>
      </div>
    ),
    size,
  )
}
