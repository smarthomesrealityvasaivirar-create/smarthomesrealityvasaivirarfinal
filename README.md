# Smart Home Reality 3.0.0-rc.1

A repaired **release candidate**, not a certified production release. This ZIP contains the real Next.js project, not an HTML mockup. Start with **START_HERE.md**.

## Files you need
- `START_HERE.md`: extract, open the right folder, run locally.
- `DEPLOYMENT_GUIDE.md`: Supabase, admin login, Vercel, environment variables, live acceptance tests.
- `ANTIGRAVITY_INSTRUCTIONS.md`: paste into Antigravity to work on this project without rewriting it.
- `RELEASE_STATUS.md`: actual checks, limitations and launch blockers.
- `CHANGELOG.md`: changes made in this repair.
- `.env.example`: public vs secret keys explained.
- `supabase/FRESH_PROJECT_SETUP.sql`: one-time setup for a new EMPTY database.
- `supabase/migrations/005_release_hardening.sql`: upgrade an existing V2 database only after 001-004.
- `supabase/tests/rls_check_v3.sql`: anonymous-access security tests with rollback.

## Quick start
Use Node **22 LTS**. Open the extracted folder containing `package.json`, then:

```sh
npm install
npm run doctor
npm run dev
```

Open http://localhost:3000. No Supabase keys = demo only. For a production check:

```sh
npm run verify
npx playwright install chromium
npm run test:e2e
```

`verify` runs unit tests, TypeScript checking and the production build. Browser tests start the production server automatically. Run browser tests in demo mode, before adding live credentials.

**Not run here:** dependency installation, complete TypeScript checking, `next build`, Next.js end-to-end tests, SQL execution, live Supabase/Vercel tests. The code sandbox has no internet access and no Next.js installation. See RELEASE_STATUS.md for the narrower checks that DID run.

**Hosting:** Vercel Hobby is not for commercial sites. A business deployment needs an eligible commercial plan. Supabase usage and billing limits must also be reviewed. No external deployment was performed.

Historical V1/V2 documents are under `docs/history/`; their testing claims do not supersede the current release report.
