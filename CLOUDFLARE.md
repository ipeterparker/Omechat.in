# Cloudflare Pages deploy

Build settings (Cloudflare Pages -> Create -> Connect to Git):
- Root directory: bearchat-codes   (the folder with package.json)
- Build command: pnpm install && pnpm build    (or: npm install && npm run build)
- Build output directory: out
- Environment variables (Settings -> Variables and Secrets, Production):
  NODE_VERSION = 20
  NEXT_PUBLIC_SOCKET_URL = <your Render server URL>
  NEXT_PUBLIC_TURN_URL / NEXT_PUBLIC_TURN_USER / NEXT_PUBLIC_TURN_PASS = (same as on Vercel, if set)

Then: Custom domains -> add omechat.in and www.omechat.in (Cloudflare fixes the DNS records itself).
