# V3 release candidate repair, 6 November 2026

## Setup and deployment
- Flat ZIP root, .gitignore, Node 22 requirement, configuration doctor, runnable unit and Playwright tests, GitHub validation workflow.
- Removed build-time Google font downloads; network-independent typography matches the reviewed previews.
- Separate fresh-project and V2-upgrade SQL paths; explicit public/secret key instructions.
- Corrected Vercel commercial-plan guidance and overstated V2 testing claims.

## Data and security
- Transactional property + image save, duplication, and owner-request approval RPCs.
- Owner name, phone and free-text request are not copied into listing descriptions.
- Publication safeguard for missing price, description or cover photo.
- Public direct lead INSERT removed; validated server route uses server-only secret.
- Request content-type/origin/body size checks; per-instance limiter no longer resets all buckets together.
- Both admin allowlists checked; incomplete setup gets a clear login error, not a redirect loop.
- Generic notification only, no customer PII sent to notification providers.
- Fixed mixed-unit price filters/sort and reference formatting after listing 999.
- Photo files retained to avoid breaking duplicates; storage cleanup remains an operational task.
- Database read failures now show an error, not misleading 'zero listings'. Old slug revalidated after rename.

## Mobile and polish
- Actual sticky filter container, native modal filters/gallery, Escape handling and browser focus behavior.
- Gallery and listing images show an explicit fallback on failure; pasted URLs limited to supported hosts.
- Small-screen header, saved-home grid, safer clipboard behavior and blocked-storage fallback.
- Lightweight section/card arrival motion; reduced-motion respected. No extra animation runtime.
- Door import/open deadlines, timer cleanup, no-JS fallback and late-import guard.
- Local hero image avoids relying on the previous third-party hero URL.
- Demo banner clarifies that preview enquiries are not saved.

See RELEASE_STATUS.md for verification scope. Historical V2 docs are not current instructions.
