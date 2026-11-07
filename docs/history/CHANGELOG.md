# Changelog V1 -> V2 (5 Nov 2026)

## Client decisions applied
Contacts confirmed; RERA number hidden; stats + testimonials kept; intro on every visit; single admin user;
WhatsApp lead alerts; owners cannot upload photos; demo images for now; no domain yet (Vercel URL).

## Door
- Removed the cropped-photo CSS doors. New real-time 3D door (three.js): fluted walnut leaves with real thickness,
  split brass medallion rings, hammered disc, long brass pulls, architrave, plaster wall, sconces with soft shadows.
- Opens INWARD on correct hinges with heavy-door easing, warm light grows from the room, camera walks through the doorway into a lit interior (original AI image, no licence issue), then fades.
- Skip button + Esc, Enter/Space via focused button, focus trap, prefers-reduced-motion skip, WebGL-unavailable skip,
  three.js lazy-loaded (not in the homepage bundle), overlay fully unmounted + GPU resources disposed.

## Duplicates removed
Top contact bar (phones x2, address, email), admin footer link, navbar WhatsApp button, hero WhatsApp/stats line,
homepage office section (repeat of footer), team phones in weekend banner/about/sell, company story copies,
about-page stats (repeat of homepage), rent/buy duplicate page files, "Smart Home Reality" twice in titles,
cover photo shown twice in gallery, same listing in two homepage sections, similar homes including itself.

## Bugs fixed
Leads never saved; leads stored in visitor localStorage; fake admin login + demo login; RLS letting any signed-up user write;
"/mo /mo" and "43.50 Lacs"; hydration-unsafe window.origin; client-only PropertyCard; schema/type mismatch on images;
invalid price_unit 'monthly'/'total'; empty edit route (404); Tailwind v4 ignoring tailwind.config (unstyled admin);
duplicate font loading; AA contrast failures; drafts reachable by URL; Supabase errors silently showing mock data;
watermarked third-party photo as the social share image; unverified "4.9/5" and "RERA registered office" claims.

## Added
Multi-photo uploader, admin dashboard/search/filter/sort/pagination/duplicate/delete-confirm, enquiry status flow + notes + CSV export,
owner requests page with approve -> draft, settings page, URL-synced filters (BHK, budget, locality multi-select, furnishing,
family/bachelor, direct owner), gallery lightbox + swipe, share, save/favourite + Saved page, print brochure, mobile sticky Call/WhatsApp,
JSON-LD (RealEstateAgent, LocalBusiness, Apartment/Offer, BreadcrumbList), sitemap, robots, canonical + OG per page, 404 + error pages,
terms page, honeypot + rate limit on forms, CSV-injection-safe export.

## Mobile redesign (phones first, 390px reference)
- App-style bottom tab bar on phones: Home / Rent / Buy / Saved (with count) / WhatsApp. Floating WhatsApp button is now desktop-only, so nothing covers card buttons.
- Homepage: listings, categories, why-us and testimonials are swipeable rails instead of long stacks; tighter section spacing. Phone page height roughly halved (about 12,200px to 6,100px in our render).
- Rent / Buy: shopping-style 2-column grid on phones (like a clothing app), compact cards with price, title, area and one WhatsApp button. Sticky filter bar with quick chips (1 RK, 1 BHK, 2 BHK...) and a full-screen filter sheet with "Show N homes".
- Property page: photos first, full width, swipe with dots; title, price and Save/Share right under; fixed bottom bar with price, Call, WhatsApp and "Book free visit". Similar homes are a swipe rail. Fixed a sideways-scroll bug (page was 429px wide on a 390px phone).
- Contact page: big Call now / WhatsApp buttons at the top, team as tappable rows with call + WhatsApp icons, address card with Get directions and the map underneath.
- All tap targets are 44px or more; breadcrumbs hidden on phones (still in the page data for Google).
