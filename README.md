# HangOver Admin

Separate admin site for the HangOver store. It shares the **same MongoDB database** as the customer site,
so products, trending lineup, orders, coupons and messages stay in sync automatically.

## Run locally
1. `npm install`
2. Copy `.env.example` to `.env.local` and fill it in.
   - Create the admin password hash: `node scripts/hash-password.mjs "your-password"`
   - In `.env.local` use the escaped (`\$`) version it prints. On Vercel paste the plain one.
3. `npm run dev -- -p 3001` then open http://localhost:3001

## Deploy (Vercel)
1. Push this folder to its own GitHub repo (or import it as a separate Vercel project).
2. Add the env vars from `.env.example` (use a NEW `NEXTAUTH_SECRET`, same `MONGODB_URI`).
3. Set `NEXTAUTH_URL` to the admin URL, and `NEXT_PUBLIC_STOREFRONT_URL` / `STOREFRONT_URL` to the customer site URL.
4. Optional: attach a domain such as `admin.your-domain.com`.

## Notes
- Sign-in uses only `ADMIN_EMAIL` + `ADMIN_PASSWORD_HASH`. No Google, no customer accounts, no hardcoded password.
- Every page and `/api/admin/*` route is protected by `src/proxy.js`.
- If you change a model (`src/models`), make the same change in the customer project.
