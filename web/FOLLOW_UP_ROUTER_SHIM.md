# Follow-up: Replace the router shim

After the hybrid App Router migration is accepted for visual parity, replace `web/src/lib/router-shim.js` with native Next.js routing imports route by route.

Scope:

- Convert `<Link to>` to `next/link` with `href`.
- Convert `useNavigate()` call sites to `useRouter()`.
- Convert `useLocation()` call sites to `usePathname()` and `useSearchParams()`.
- Convert the two `navigate(path, { state })` flows to URL-query or explicit storage flows.
- Convert mutating `setSearchParams` call sites to direct `router.push` or `router.replace`.
- Replace guard `<Navigate>` usages with a small redirect helper or native Next redirects.
- Delete `web/src/lib/router-shim.js` only after no imports remain.
- Re-run `cd web && npm run build`, then repeat visual parity checks.
