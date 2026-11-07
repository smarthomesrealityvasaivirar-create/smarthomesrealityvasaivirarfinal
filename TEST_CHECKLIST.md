# Current test checklist

See RELEASE_STATUS.md for exact scope and verification/ for raw results.

- [PASS: unit] 28 validation/date/phone/image/price/URL-helper tests.
- [PASS: syntax only] 97 TypeScript/TSX source files transpile without syntax diagnostics.
- [PASS: isolated rendering] 7 public page bodies fit 5 viewport widths (35 combinations).
- [PASS: isolated React fixture] 14 interaction checks, including filter/gallery modals, favourites persistence, broken-photo fallback and entrance recovery.
- [NOT TESTED] Actual dependency installation and full TypeScript/ESLint checks.
- [NOT TESTED] Next.js production build and actual framework end-to-end tests.
- [NOT TESTED] Supabase SQL execution, admin authentication and RLS.
- [NOT TESTED] Atomic saves, rollback, duplicate photos and request-approval concurrency in PostgreSQL.
- [NOT TESTED] Live enquiry and owner form persistence, notifications.
- [NOT TESTED] Vercel deployment and Supabase remote images through Next Image.
- [NOT TESTED] Real Android/iPhone, WebGL frame rate, accessibility audit and Lighthouse.

Do not change NOT TESTED to PASS based only on reading the code. The detailed live checklist is in DEPLOYMENT_GUIDE.md, section F.
