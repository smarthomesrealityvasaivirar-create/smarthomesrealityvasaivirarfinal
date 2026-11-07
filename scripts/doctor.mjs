import fs from 'node:fs'
import path from 'node:path'
try { process.loadEnvFile('.env.local') } catch { /* Environment may be injected by Vercel. */ }
let failures = 0
const check = (ok, text) => { console.log(`${ok ? 'OK' : 'FAIL'}: ${text}`); if (!ok) failures++ }
check(Number(process.versions.node.split('.')[0]) >= 22, 'Node.js 22+ (use Node 22 LTS in Vercel)')
check(fs.existsSync('src/app/layout.tsx'), 'Terminal is at the project root, beside package.json')
const env = process.env
const url = env.NEXT_PUBLIC_SUPABASE_URL || ''
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const live = !!(url || key)
const https = value => { try { return new URL(value).protocol === 'https:' } catch { return false } }
if (live) {
  check(https(url) && !url.includes('your-project'), 'Real Supabase HTTPS project URL')
  check(key.length > 20 && !key.includes('your-'), 'Supabase public key is present (value never printed)')
  check(!!env.SUPABASE_SERVICE_ROLE_KEY && env.SUPABASE_SERVICE_ROLE_KEY !== key, 'Separate server-only service-role/secret key for lead submission')
  check(!!env.ADMIN_EMAILS && env.ADMIN_EMAILS.split(',').every(e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim()) && !e.includes('example.com')), 'Real admin email allowlist')
  check(https(env.NEXT_PUBLIC_SITE_URL), 'Public HTTPS site URL for canonical links and WhatsApp sharing')
  console.log('LIVE configuration: also run SQL 001-005 and provision the same admin email in Supabase.')
} else {
  console.log('DEMO: sample listings, read-only admin, forms do NOT save. This is not a live launch.')
}
check(!Object.keys(env).some(k => k.startsWith('NEXT_PUBLIC_') && /SERVICE_ROLE|SECRET_KEY/i.test(k)), 'No private Supabase key has a NEXT_PUBLIC_ prefix')
for (const f of ['public/doors/interior.webp', 'public/brand/logo-clean.png', 'supabase/migrations/005_release_hardening.sql']) {
  check(fs.existsSync(path.resolve(f)), `Required file: ${f}`)
}
if (!fs.existsSync('package-lock.json')) console.log('NOTE: no lockfile yet. Run npm install, then commit package-lock.json after validation.')
console.log('Doctor checks configuration only; it does not prove a successful build or database connection.')
process.exitCode = failures ? 1 : 0
