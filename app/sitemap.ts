import type { MetadataRoute } from 'next'
import { PAGES, SITE_URL } from '@/lib/seo'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return [
    { url: SITE_URL, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    ...PAGES.map((p) => ({ url: `${SITE_URL}/${p.slug}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.8 })),
    ...['about', 'safety', 'faq', 'guidelines', 'privacy', 'terms'].map((s) => ({ url: `${SITE_URL}/${s}`, lastModified: now, changeFrequency: 'yearly' as const, priority: 0.3 })),
  ]
}
