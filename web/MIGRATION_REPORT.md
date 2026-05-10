# Next.js hybrid App Router migration report

## Summary

- Created a side-by-side Next.js 14 app under `web/`.
- Preserved the original CRA app at the repository root.
- Copied `public/` to `web/public/`.
- Copied `src/` to `web/src/`, with `src/pages/` renamed to `web/src/views/` to avoid Next Pages Router detection.
- Added `web/src/app/` App Router route files that map the old `AppRouter.jsx` routes mechanically.
- Added `web/src/lib/router-shim.js` so existing `react-router-dom` component APIs continue to work in v1.
- Did not modify `backend/`, `marxbot-server/`, or `supabase/functions/`.

## Created scaffold files

- `web/package.json`
- `web/next.config.js`
- `web/jsconfig.json`
- `web/postcss.config.js`
- `web/tailwind.config.js`
- `web/.gitignore`
- `web/.env.local` (local only, ignored)
- `web/src/app/layout.jsx`
- `web/src/app/providers.jsx`
- `web/src/app/page.jsx`
- `web/src/app/not-found.jsx`
- `web/src/lib/router-shim.js`
- `web/FOLLOW_UP_ROUTER_SHIM.md`
- `web/MIGRATION_REPORT.md`

## Generated App Router pages

All generated route files are under `web/src/app/**/page.jsx`, including:

- Root, login, home, not-found
- Theory routes
- Digital library, article, book reader routes
- Analysis routes
- Profile, directory, glossary, study routes
- Science and technology routes
- Politics routes
- Forum catch-all route
- Knowledge routes
- Pending access, coming soon, MarxBot
- Admin routes

## Source moves

- `src/pages/` was copied to `web/src/views/`.
- No root CRA files were moved or deleted.

## Mechanical source patches in `web/`

- Replaced copied `react-router-dom` imports with `@/src/lib/router-shim`.
- Patched Supabase env reads to prefer `NEXT_PUBLIC_*` with `REACT_APP_*` fallback.
- Moved plain global CSS imports into `web/src/app/layout.jsx` because App Router only allows global CSS from the root layout.
- Initialized i18n from `web/src/app/providers.jsx` before first client render to match CRA behavior.
- Wrapped `react-force-graph-2d` in `next/dynamic({ ssr: false })` inside `web/src/components/Reader/ConceptMapPanel.jsx`.

## Styling changes

No CSS contents, class names, layout structures, colors, fonts, spacing, breakpoints, animations, image proportions, or hover states were intentionally changed.

The only styling-related migration change is import location: existing plain CSS files and `katex/dist/katex.min.css` are imported from `web/src/app/layout.jsx` instead of component files, as required by Next App Router.

## Verification

Command passed:

```bash
cd web
npm run build
```

Visual parity checks:

- CRA baseline served at `http://127.0.0.1:3000`.
- Next app checked at `http://127.0.0.1:3001`.
- Desktop screenshot pass covered guest, authenticated, admin, forum, knowledge, visualization, study, and 404 routes.
- Mobile spot checks covered login, digital library, coming soon, MarxBot, home, study, directory, knowledge, admin tags, and 404.
- A mobile i18n mismatch on `/digital-library` was found and fixed.
- `/admin/world-sim` was rechecked against the production Next preview after a dev-cache disk-space error; production preview matched.

Remaining visual differences:

- None known after the i18n fix.
- Minor pixel deltas observed during screenshot comparison were from animation timing, fixed debug/analytics overlays, or local dev/prod cache state, not layout or styling drift.

## Local disk note

This machine was nearly full during migration. A normal duplicate `web/node_modules` install could not fit locally, so the local workspace uses an ignored `web/.next-toolchain/` plus a `web/node_modules` symlink for the Next toolchain while resolving app dependencies from the existing root `node_modules`.

On a normal machine or in Vercel, run a standard install inside `web/`.

## Local commands

```bash
# Existing CRA app
cd "/Users/andreaskurz/Marxist-Platform copy 2"
npm install
npm start

# New Next app
cd "/Users/andreaskurz/Marxist-Platform copy 2/web"
npm install
npm run dev -- -p 3001
npm run build
npm run start -- -p 3001
npm run lint
```

## Later Vercel settings

Do not change Vercel until visual parity is accepted.

When switching later:

- Framework Preset: Next.js
- Root Directory: `web`
- Build Command: blank
- Output Directory: blank
- Install Command: blank
- Node Version: 18.x or 20.x
- Environment variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_MAINTENANCE_MODE=false`
- Remove the old SPA rewrite from the Vercel project only when `web/` becomes the source of truth.
