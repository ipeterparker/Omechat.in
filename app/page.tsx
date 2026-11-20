import type { Metadata } from 'next'
import { SiteHeader } from '@/components/site-header'
import { Hero } from '@/components/hero'
import { About } from '@/components/about'
import { AdBanner } from '@/components/ad-banner'
import { Features } from '@/components/features'
import { Safety, SiteFooter } from '@/components/safety'
import { SeoSection } from '@/components/seo-section'
import { OmegleAlternative } from '@/components/omegle-alternative'
import { HOME_DESCRIPTION, HOME_TITLE, KEYWORDS, SITE_NAME, SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { absolute: HOME_TITLE },
  description: HOME_DESCRIPTION,
  keywords: KEYWORDS,
  alternates: { canonical: '/' },
  openGraph: { type: 'website', url: '/', siteName: SITE_NAME, title: HOME_TITLE, description: HOME_DESCRIPTION, locale: 'en_IN' },
  twitter: { card: 'summary_large_image', title: HOME_TITLE, description: HOME_DESCRIPTION },
  robots: { index: true, follow: true },
}

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main>
        <div className="mx-auto w-full lg:grid lg:max-w-6xl lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-12 lg:px-8 lg:pt-8">
          <div>
            <Hero />
            <About />
          </div>
          <AdBanner />
        </div>
        <Features />
        <Safety />
        <SeoSection />
        <OmegleAlternative />
      </main>
      <SiteFooter />
    </>
  )
}
