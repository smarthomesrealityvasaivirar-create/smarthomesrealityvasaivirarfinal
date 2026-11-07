# Smart Home Reality V1: Phase 1 audit (read from the supplied source zip)

| ID | Sev | File | Problem | V2 fix |
|---|---|---|---|---|
| A1 | CRITICAL | components/entrance/DoorEntrance.tsx L130-145 | Doors rotate -102/+102deg = swing TOWARD viewer (cupboard feel); texture is one remote base44 image clipped in half; local door photos unused | Rewritten: real photo halves, inward swing, 3D room at z=-600px, camera push, shade, 14px edge, seam light (done + frame-tested) |
| A2 | CRITICAL | app/layout.tsx L157 | DoorEntrance + Navbar + Footer wrap /admin too | Done: (site) route group; admin has its own layout |
| A3 | CRITICAL | api/enquiries, api/sell-requests route.ts | Routes echo the body and save NOTHING. Every lead is lost | Done: zod validation, honeypot, rate limit, Supabase insert, Resend email |
| A4 | CRITICAL | PropertyEnquiryForm L36-60, sell/page L39-55, contact/page L40-56 | Leads stored in the VISITOR's localStorage, so admin never sees them | Done: all 3 forms post to the API |
| A5 | CRITICAL | admin/login L14-20 | No auth: "Sign in" just sets sessionStorage; prefilled admin123; Demo Login | Done: Supabase signInWithPassword + ADMIN_EMAILS allow-list + proxy.ts + requireAdmin on every action |
| A6 | CRITICAL | migrations/003 L20-25 | RLS admin = auth.role()='authenticated': ANY signed-up user gets full write | Done: admins table + is_admin(); anon insert-only for leads |
| A7 | CRITICAL | admin/properties/new | One cover URL only; saved to localStorage with invalid price_unit 'monthly'/'total' | Done: ImageUploader (15 photos, compress, progress, retry, cancel, reorder, cover, alt, delete) on new + edit |
| A8 | HIGH | public/og-image.jpg | Social share image is the RAF-watermarked door photo with a third-party phone number | Done: new branded og-image.jpg |
| A9 | HIGH | public/doors/wood-*, door-wood.jpg | Wood door is a vendor photo with RAF watermark + caption: licence risk | Done: photo doors removed; real-time 3D modelled door |
| A10 | HIGH | Navbar, Footer, OfficeLocationSection, WeekendBanner, contact, about, sell | Team phones/address repeated 6-8 times per page; Admin link in footer | Done: shown only in footer + contact page + one header Call CTA |
| A11 | HIGH | PropertyCard L48 + format.ts | Rent shows "/mo /mo"; lacs shows 43.50 | Done: formatPrice/formatPriceShort |
| A12 | HIGH | layout.tsx template + rent/buy/privacy titles | Title renders "... | Smart Home Reality | Smart Home Reality" | Done: template only adds the brand once |
| A13 | HIGH | PropertyGallery L14-17 | Cover rendered twice (cover + images[0]) | Done: deduped, cover first, lightbox + swipe |
| A14 | HIGH | queries/properties L174-184 | Similar homes always from mock data, even with Supabase | Done: getSimilarProperties (dedupe, excludes current) |
| A15 | HIGH | queries/properties L103-109 | Supabase error silently shows mock listings on the live site | Done: returns empty + logs |
| A16 | HIGH | admin pages | Read MOCK data even when Supabase is configured | Done: queries/admin.ts |
| A17 | HIGH | about L336-357, OfficeLocation L132 | Unverified claims: "4.9/5 from 85+ reviews", "RERA & Biometric Registered Office" | Done: removed |
| A18 | MED | tailwind.config.ts + globals.css | Tailwind v4 ignores config: admin classes undefined; 100+ !important overrides; fonts loaded twice | Done: clean @theme, contrast-checked tokens |
| A19 | MED | globals | Gold text on light = 2.3:1, stone = 4.3:1 (fail AA) | Done: gold-deep 6.0:1, stone 6.4:1 |
| A20 | MED | rent/page vs buy/page | 95% duplicate files; hero locality values don't match pill values; "Shops & plots" card links to rent only | Done: one ListingPage + URL-synced filters |
| A21 | MED | mockProperties | Same photo used on 3 listings; drafts reachable by slug | Done: public status filter |
| A22 | MED | admin/properties/[id]/edit | Folder exists but empty: 404 | Done |
