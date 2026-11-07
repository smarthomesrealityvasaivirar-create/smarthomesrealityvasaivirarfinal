# Paste this into Antigravity after opening the extracted project folder

Work on THIS existing Smart Home Reality Next.js 16 / React / TypeScript / Tailwind v4 / Supabase project. Do not scaffold another app, convert it to Vite, make a static export, or replace the architecture or design. Read README.md, RELEASE_STATUS.md and DEPLOYMENT_GUIDE.md first.

1. Confirm the terminal's working directory contains package.json and src/app/layout.tsx. Use Node 22 LTS.
2. Run npm install. Capture the first meaningful error if it fails. Do not guess version replacements; verify registry versions and peer dependencies first. Do not use --force or --legacy-peer-deps to hide a conflict. Keep the generated package-lock.json.
3. Start in demo mode with BOTH Supabase public env values absent. Do not print or overwrite my existing secret files. Tell me if an old .env.local is interfering and let me move it privately.
4. Run npm run doctor, npm run test, npm run typecheck, npm run build. Fix actual errors in complete source files and rerun each failed check. Never use ignoreBuildErrors, disable RLS, or replace login with a fake admin password.
5. Run npx playwright install chromium and npm run test:e2e against the production build in demo mode. These tests have NOT yet run in the source handoff environment.
6. Visually inspect at 320, 390, 768 and 1440px. Test filter sheet, gallery, saved homes, forms, menu, 3D intro, reduced motion and no-WebGL fallback. The existing isolated screenshots and tests are NOT equivalent to a production Next.js test.
7. For Supabase, first determine whether the project is fresh or V2. Use the correct SQL from the deployment guide. Never reset/drop an existing database. Secret keys must be entered privately into .env.local/Vercel, never pasted into chat or committed.
8. Use a test Supabase project to execute RLS checks and the complete live acceptance checklist. Admin must match in Authentication, public.admins and ADMIN_EMAILS. Public forms require the server-only secret after migration 005.
9. Review every SQL RPC in 005 on a test database, including rollback on an image insert failure and simultaneous owner-request approvals. Report exact test evidence, not assumptions.
10. Prepare Vercel deployment using Next.js preset, Node 22, npm run build, repo root at package.json. Do not deploy, purchase a plan, or modify my live account without approval. Vercel Hobby is not eligible for this commercial site.
11. Return: command results, corrected files, actual remaining blockers, and whether the live checklist passed. Do not say 'error-free' or 'production-ready' unless the evidence supports it. If blocked, show the first useful error with secrets redacted.

Keep the existing mobile-first design, 3D door on every fresh visit (with skip/reduced-motion fallback), one admin, no owner photo uploads, hidden RERA number, retained stats/testimonials and demo photos until replaced. Improve smoothness without adding heavyweight animation libraries or blocking navigation behind an intro.
