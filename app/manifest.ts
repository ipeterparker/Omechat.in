import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Bearchat',
    short_name: 'Bearchat',
    description: 'Free random text and video chat with strangers.',
    start_url: '/',
    display: 'standalone',
    background_color: '#070b16',
    theme_color: '#070b16',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  }
}
