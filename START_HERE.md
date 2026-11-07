# Start here, Hrithik

## 1. Extract into a NEW folder
On Windows, use a short local path such as `C:\Projects\smart-home-reality`. Do not merge this ZIP over your old V2 files. Avoid a mapped/network drive for development when possible.

Inside the extracted folder you should immediately see:

```text
package.json
next.config.ts
START_HERE.md
src/
public/
supabase/
```

There is no extra `v2/` wrapper. **Open this exact folder in Antigravity.** Don't open the ZIP, `src/`, or the folder above it. Next.js cannot run by double-clicking a page or opening an HTML preview.

## 2. Check your terminal
Open Antigravity's terminal in the same folder:

```sh
node --version
npm --version
```

Use Node 22 LTS. If either command is missing or your office PC blocks installation, ask IT for Node 22 LTS. Do not bypass company installation restrictions.

## 3. Get the DEMO running first
Do not copy an old `.env.local` into this folder yet.

```sh
npm install
npm run doctor
npm run dev
```

Wait for the terminal's Ready message, then open **http://localhost:3000** in Chrome. The browser must use that URL, not `file://` or a static preview extension.

- Homepage: http://localhost:3000
- Rent: http://localhost:3000/rent
- Admin demo: http://localhost:3000/admin
- Demo forms explicitly do not save. That is expected until Supabase is configured.

If PowerShell blocks `npm.ps1`, run the same command with `npm.cmd` (for example `npm.cmd install`), or use Command Prompt. Do not disable your organization's security policies.

## 4. Stop and verify before deployment
Press Ctrl+C to stop the development server.

```sh
npm run verify
npx playwright install chromium
npm run test:e2e
```

Do not proceed past a failed command. Save its FIRST meaningful error, not just the last `exit code 1` line. The last package was not production-built; this step is mandatory.

`npm install` creates `package-lock.json`. Keep and commit it after validation; use `npm ci` for subsequent clean installs. No lockfile was fabricated in this ZIP.

## 5. Then connect Supabase and Vercel
Follow DEPLOYMENT_GUIDE.md in order. Do not try to fix setup problems by asking Antigravity to regenerate the whole site. Use ANTIGRAVITY_INSTRUCTIONS.md.

## If it fails, collect these details
- Command you ran (install, dev, verify, or deploy).
- First error and about 20 lines around it.
- Node version.
- Whether the site was in demo or live mode.
- Browser Console error if the page is blank.

Never paste `.env.local`, passwords, API secret keys, or full authentication cookies into a chat or screenshot.
