# Deployment: local -> Supabase -> Vercel

## Important limits
This is a real estate BUSINESS website. Vercel's Hobby plan is non-commercial only; choose an eligible paid plan for the business launch. This corrects the V2 handoff. No paid service was purchased and no account was connected on your behalf.
Official policy: https://vercel.com/docs/limits/fair-use-guidelines
Supabase key guide: https://supabase.com/docs/guides/getting-started/api-keys

## A. Validate demo mode locally first
Follow START_HERE.md. Run `npm run verify` and `npm run test:e2e` with no Supabase credentials. Don't ignore failed tests or hide errors with `ignoreBuildErrors`.

## B. Supabase setup
1. Create a Supabase project in a nearby available region (Mumbai if offered). Save the database password privately. Wait for it to become ready.
2. **New empty project:** open SQL Editor, paste the entire `supabase/FRESH_PROJECT_SETUP.sql`, and run once. It creates tables, policies, storage and transactional functions. It does not add sample listings or an admin user.
3. **Existing V2 project with migrations 001-004 already applied:** back it up, then run ONLY `supabase/migrations/005_release_hardening.sql`. Do not run the fresh-project script or repeat 001-004 over existing tables. If you have a V1/different schema, stop and compare it; this is not a universal migration.
4. In Authentication > Users, create the ONE admin user with their real email and a strong password. Auto-confirm the email if creating the user manually. Disable public signups in your Auth settings. There is no public signup flow in this app.
5. In SQL Editor, run this with the SAME real lowercase email (replace the placeholder, do not leave it as-is):

```sql
insert into public.admins(email) values (lower('REPLACE_WITH_YOUR_ADMIN_EMAIL'))
on conflict (email) do nothing;
```

6. In Supabase's project Connect / API keys settings, copy the project URL and **publishable** key. Obtain a **secret** key separately for the server. Keys may look like `sb_publishable_...` and `sb_secret_...`; legacy anon/service_role JWT keys are also accepted by this app.
7. Check Storage: bucket `property-images` should exist. It permits public reads and admin writes, JPG/PNG/WebP, up to 8MB per upload. These are PUBLIC marketing photos; never upload identity documents, contracts or private photos, including to a draft listing.
8. Run `supabase/tests/rls_check_v3.sql` in SQL Editor. It rolls back its checks. A success notice is required. The old V2 `rls_check.sql` is historical and expects anonymous inserts that V3 deliberately blocks.

9. On a V2 upgrade, correct any old mismatched price units (monthly rent on a sale listing, for example), then run `alter table public.properties validate constraint valid_listing_price_unit;`. New projects should run this too. If it fails, inspect the invalid rows and correct them before launch; do not drop the constraint.

### Demo data is optional, not production inventory
`supabase/seed.sql` inserts fictitious sample listings with placeholder photos. Use it only in a TEST project. Do not seed a client-facing production database with claims of actual availability. A production database may start empty: add real properties through admin.

## C. Configure local LIVE mode
Copy `.env.example` to `.env.local` in the project root. Fill these five values:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | The final HTTPS Vercel/domain URL. Until it exists, validate the demo first and finish live setup after creating the Vercel project. |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project HTTPS URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publishable key (the variable's older name is retained for V2 compatibility) |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret key, SERVER ONLY (older variable name retained) |
| `ADMIN_EMAILS` | Same lowercase email as Authentication user AND `public.admins` |

The secret key bypasses RLS. It is only imported by the server-side lead writer. NEVER rename it with `NEXT_PUBLIC_`, commit it, place it in a browser component, or paste it into Antigravity chat.

Leave notification variables blank for the first launch. Restart `npm run dev` after env changes. `npm run doctor` checks configuration but cannot prove connectivity or correct keys.

## D. Push the source to GitHub
Use Antigravity's source control or Git. Commit source and the generated `package-lock.json`. The provided `.gitignore` excludes `.env.local`, node_modules and build output. Confirm the secret file isn't already tracked from an old project; `.gitignore` cannot untrack existing commits.

No special `vercel.json` is needed. Do not set `output: export`: server actions, login, APIs and Supabase require the Next.js server runtime.

## E. Vercel project
1. Vercel > Add New > Project > import your GitHub repository.
2. Framework preset: **Next.js**. Root Directory: the folder containing package.json (with this flat ZIP, normally the repo root).
3. Node version: **22.x**. Build command: `npm run build`. Keep the default output directory and installation settings.
4. One approach: first deploy the demo without Supabase values to obtain the assigned URL. This is still a business project, so use the appropriate commercial plan even for its staging deployment.
5. In Project Settings > Environment Variables, add the five live values from section C for Production. Configure Preview separately; preferably use a separate test Supabase project for previews.
6. Set `NEXT_PUBLIC_SITE_URL` to the assigned HTTPS URL, without a trailing slash. Redeploy after EVERY environment change. Public variables are embedded at build time.
7. In Supabase Auth URL Configuration, set Site URL to the final Vercel URL. Add only the redirect URLs you actually need. This app uses password login, not OAuth or password-reset callbacks; reset the single admin password through Supabase's administrative flow if needed.
8. Re-run `npm run verify` with the live config locally, and inspect Vercel build logs. If the build fails on database reads, confirm SQL setup completed and public SELECT policies are present. Do not turn off RLS.
9. Open the deployed URL and `/admin`. Sign in with the Supabase user email/password, not the database password.

## F. Required live acceptance checklist
Use a TEST Supabase project first. Only mark a box after performing it.
- [ ] Public pages load on phone and desktop; no console errors.
- [ ] Non-admin cannot read leads, mutate properties or call admin RPCs (SQL negative checks pass).
- [ ] Admin login works and logout prevents access again.
- [ ] Create a draft; upload several photos; reorder; choose cover; save; reload and verify order.
- [ ] Publish a property with positive price, description and photos; public page and sitemap update.
- [ ] Rename its slug; old route stops showing the stale version after revalidation.
- [ ] Duplicate a property. Delete/edit the original in TEST; the duplicate's photos still work.
- [ ] Rent/buy filters and mixed lacs/crores budgets produce correct matches.
- [ ] Submit an enquiry on the public site; check the row in admin and Supabase.
- [ ] Submit an owner request; create a draft; private owner details are NOT copied into the public description.
- [ ] Set rented/sold; verify ribbon, public content and admin status.
- [ ] Test gallery and forms on a real Android phone and iPhone; confirm safe areas and keyboard behavior.
- [ ] Verify the 3D intro on a mid-range phone. Skip must always remain usable.
- [ ] Verify real property photos, contact details, statistics/testimonials and legal copy with the business.
- [ ] Check quotas and spam protection before public promotion.

## G. Notifications (optional, separate from saving leads)
CallMeBot is a third-party service, not an official business WhatsApp delivery guarantee. Use its CURRENT setup instructions to obtain credentials; the old V2 hard-coded setup phone was not reverified. Only a generic new-lead notice + admin link is sent; customer PII stays in the database. HTTP delivery failures are logged, but receipt on the phone still needs a real test. Email through Resend is optional and requires a permitted/verified sender.

Start with the admin dashboard working. Enable alerts afterward. An alert failure does not delete or undo a saved lead.

## H. Operations and known limits
- Public lead routes have validation, honeypot, same-origin checks, 16KB payload limits and best-effort per-instance throttling. **Not distributed anti-bot protection.** Add managed rate limiting or a server-validated CAPTCHA before paid traffic; check current provider availability and costs.
- Uploaded files are deliberately retained after property edits/deletions because duplicated listings may share them. Review unused Storage files periodically; do not delete a file while any listing references its URL. Abandoned uploads may remain too.
- External demo photos may be unreachable; the UI shows 'Photo unavailable', not a fabricated substitute. Replace with real uploads.
- Privacy/terms text still needs business/legal review. RERA number remains hidden as requested; no claim of compliance certification is made.
- Do not call the deployment 'finished' until the live checklist passes. The included verification evidence is from local isolated tests, not a deployed Next.js instance.
