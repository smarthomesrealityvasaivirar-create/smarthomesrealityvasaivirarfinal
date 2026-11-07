# Release status: 3.0.0-rc.1

Date: 6 November 2026. Status: **repaired release candidate; production acceptance still pending**.

The user's exact Antigravity error log was not available, so no single cause of that failure has been confirmed. Opening the wrong folder, using an HTML preview instead of the Next.js server, missing Node/dependencies, incomplete environment configuration and unexecuted SQL are covered in the handoff. The code defects below were found by source review independently of that unknown error.

## Checks actually performed
| Check | Result | Scope |
|---|---|---|
| TypeScript source syntax | PASS, 97 files | TypeScript transpilation, NOT semantic type checking |
| Validation/format/price tests | PASS, 28 tests | Real application helpers with local Zod and TypeScript |
| Responsive width checks | PASS, 35 combinations | 7 public page bodies at 320, 360, 390, 768 and 1440px in Chromium |
| Interactive component checks | PASS, 14 checks | Actual React components, isolated fixture with framework adapters |
| Configuration doctor | PASS in demo mode | Paths, Node version and absence of public secret variable names |
| Database/server review | Completed | Source review of SQL/RLS/auth/actions/lead routes; SQL not executed |

### What those checks do NOT prove
The responsive pages were rendered through a temporary SSR harness. Next Link/Image/router/Supabase were replaced by adapters; remote sample photos used a local placeholder. The isolated interaction fixture uses a URL/history adapter, not Next's router. It covers favourites, malformed saved storage, photo fallback, native filter/gallery modals, keyboard navigation, reduced-motion and no-WebGL entrance recovery. It does NOT prove Next.js routing/hydration, Vercel image optimization, remote photo availability, real database filtering, or a production deployment.

Local tool versions: Node 22.23.1, TypeScript 5.6.3, Zod 4.6.5, React 19.2.8, Playwright 1.58.2. The package manifest targets newer application dependency versions, so run the same checks again after npm resolves the actual project dependencies. No npm lockfile was invented.

## Not run / launch blockers
- `npm install` / `npm ci` and dependency vulnerability audit.
- Full project `tsc --noEmit`, ESLint and `next build`.
- Production Next.js Playwright tests supplied in tests/e2e.
- PostgreSQL migration execution, RPC rollback/concurrency tests and live RLS tests.
- Supabase admin login, uploads, storage permissions and form persistence.
- Real Vercel deployment, real-phone WebGL performance, iOS safe areas and Lighthouse.
- Notification delivery and final business/legal content review.

Reason: this code sandbox has no internet access and no installed Next.js/database runtime. Separate web lookup tools could check documentation and selected registry versions, but cannot install the application here. No Vercel/Supabase account credentials or live project were used.

## Known limitations that remain
- In-memory rate limiting is best effort, not distributed anti-spam protection. Add managed protection before public promotion.
- Shared/abandoned photo files are retained to prevent breaking duplicates; Storage needs periodic cleanup.
- Public Storage is for marketing photos only, not confidential documents or private draft photos.
- Demo listings/images must not be presented as real available inventory on a live client website.
- Legal copy and retained statistics/testimonials require business approval. No legal-compliance guarantee.
- Vercel Hobby cannot host this commercial use under its current policy; use an eligible commercial plan.

**Release gate:** on an internet-connected machine, run `npm install`, `npm run verify`, then demo `npm run test:e2e`; execute the correct SQL on a test database; complete section F of DEPLOYMENT_GUIDE.md. Only then approve the business launch.

Machine-readable local evidence is in verification/. Historical V2 documents are under docs/history and do not represent current test results.
