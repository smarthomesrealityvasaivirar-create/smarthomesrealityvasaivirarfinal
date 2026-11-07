# Smart Home Reality V2

Next.js 16 (App Router) + TypeScript + Tailwind v4 + Supabase + Vercel. Free tier only.
Runs with **no env vars** in demo mode (sample listings, admin read-only, nothing saved).

## 1. Run locally
```bash
npm install          # first time (lockfile is NOT included: commit the one this creates)
npm run dev          # http://localhost:3000   admin: http://localhost:3000/admin
npm run build        # must finish with 0 errors before you deploy
```
Node 20.9+ required.

## 2. Supabase (database, login, photo storage)
1. supabase.com > New project (region: Mumbai). Wait until it is ready.
2. SQL Editor > run, in order: `supabase/migrations/001_create_properties.sql`, `002_create_leads.sql`,
   `003_rls.sql` (**first edit the last line to the broker's email**), `004_storage.sql`, then `supabase/seed.sql` (8 demo listings).
3. Authentication > Users > Add user > the same broker email + a strong password (tick "Auto confirm").
4. Authentication > Sign In / Providers > Email: turn OFF "Allow new users to sign up" (only the broker logs in).
5. Project Settings > API: copy Project URL and anon public key.
6. Optional security test: run `supabase/tests/rls_check.sql`. Anonymous must read 0 enquiries and update 0 properties.

## 3. Deploy on Vercel (no domain needed yet)
1. Push this folder to a GitHub repo.
2. vercel.com > Add New > Project > import the repo (framework auto-detected: Next.js).
3. Environment Variables (copy from `.env.example`):
   `NEXT_PUBLIC_SITE_URL` = your vercel URL (e.g. https://smart-home-reality.vercel.app),
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `ADMIN_EMAILS` = broker email,
   `CALLMEBOT_PHONE` + `CALLMEBOT_APIKEY` for WhatsApp lead alerts (see below).
4. Deploy. Later, a custom domain: Vercel > Project > Domains > add it, then update `NEXT_PUBLIC_SITE_URL` and redeploy.

## 4. WhatsApp alert on every new enquiry (free)
From the broker's WhatsApp, send `I allow callmebot to send me messages` to **+34 644 71 99 25**.
You get an API key back. Put the number (with 91, no +) in `CALLMEBOT_PHONE` and the key in `CALLMEBOT_APIKEY`, redeploy.
CallMeBot is a free third-party service for personal alerts; if it ever stops, leads are still saved in /admin.

## 5. Add a property
/admin > Add property > drop up to 15 photos (auto-compressed) > drag to order, star the cover > fill details > Publish.
Reference number (SHR-YYYY-###) and URL slug are created automatically. Rented/Sold: change status in the list.

## Where things live
- Contact details, team, localities, stats: `src/config/site.ts` (one place, every page updates)
- 3D entrance door: `src/components/entrance/doorScene.ts` (real geometry, no photos). Shown on every visit, skipped on /admin and for reduced-motion users.
- Demo images: Unsplash + AI-generated placeholders. Replace with real photos through the admin.

See `AUDIT_V1.md`, `CHANGELOG.md`, `TEST_CHECKLIST.md`.
