/** @type {import('next').NextConfig} */
// Static export: the whole site becomes plain files (out/ folder) served free by Cloudflare Pages.
// Security headers now live in public/_headers (Cloudflare reads that file).
const nextConfig = {
  output: 'export',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
