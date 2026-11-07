# Test checklist (status as delivered, 5 Nov 2026)

Sandbox had no internet, so npm install / next build / Supabase / Vercel could not run. Everything not run is marked NOT TESTED.

## Door
- [PASS*] Real 3D modelled door, no cropped photo (headless Chromium + SwiftShader, desktop 960x600 frames)
- [PASS*] Opens inward with perspective, shading, edge thickness, light from the room
- [NOT TESTED] Skip button, Esc, Enter/Space, tap anywhere in a real browser
- [PASS by code] Not mounted on /admin (component only in the public layout); reduced-motion skip
- [NOT TESTED] 60fps on a mid-range Android phone (SwiftShader software rendering is not representative)
*Screenshots only; mobile render crashed the headless GPU and was not captured.

## Public site
- [PASS by review] No duplicate contact blocks/CTAs (footer + contact page + one header Call button)
- [NOT TESTED] Filters update and sync to URL
- [NOT TESTED] Detail page gallery, WhatsApp message with Ref, visit form saves
- [NOT TESTED] /sell saves and nothing auto-publishes (by design: inserts a request only)
- [PASS by code] 404 + error pages exist
- [NOT TESTED] Lighthouse mobile scores

## Admin
- [PASS by code] Real login, no demo login; ADMIN_EMAILS + admins table
- [NOT TESTED] RLS: run supabase/tests/rls_check.sql
- [NOT TESTED] Upload 5+ photos, reorder, cover, delete on new + edit
- [NOT TESTED] Create/edit/duplicate/delete/status; slug + ref auto-generated
- [NOT TESTED] Enquiry status/notes/CSV; owner request -> draft
- [NOT TESTED] Works on a phone

## Deploy
- [NOT TESTED] npm run build clean
- [PASS] .env.example present; README steps written
- [NOT TESTED] Vercel URL works; images load from Supabase Storage

Static checks run: every file parses (esbuild); TypeScript strict pass against real zod + three types with stubbed next/react/supabase (only stub-related errors remained).

## Mobile (added 5 Nov 2026)
| Check | Result |
|---|---|
| No sideways scroll at 390px on home, rent, property, contact, sell, about | PASS (headless Chromium render, scrollWidth = 390) |
| Bottom tab bar visible on phones, hidden on property page (has its own Call/WhatsApp bar) | PASS (render) |
| Rent/Buy show 2 cards per row on phones | PASS (render) |
| Property photos swipe left/right on a real phone | NOT TESTED (needs a real device) |
| Filter sheet opens/closes and applies filters | NOT TESTED in browser (code reviewed only) |
| iPhone safe-area (notch / home bar) spacing | NOT TESTED (needs a real iPhone) |
| 3D door intro on a mid-range Android phone | NOT TESTED (software renderer too slow in sandbox) |
