# AGENTS.md

## House rules
- No em dashes anywhere, including code comments and commit messages. Use hyphens or rewrite.
- Keep code working and minimal. No speculative abstraction.

## Stack
- Cloudflare Pages + Pages Functions. State in D1 (binding: DB). No KV.
- Frontend: Vite + React + Tailwind core utilities only (no arbitrary bracket values,
  no opacity-slash color modifiers; use inline style for one-off sizing like maxHeight).
- No localStorage or sessionStorage in any tool. Server state in D1, UI state in React.

## Security model
- Admin (/admin*, /api/admin/*) is gated by Cloudflare Access. Never build a custom admin login.
- End users reach tools only through link tokens checked in functions/_middleware.js.
- Raw access tokens are never stored. Store sha256 hex only. Return raw token to admin once.
- This platform currently handles pricing data, not PHI. Do not add PHI to any tool here
  without a separate compliance review.

## Routing
- SPA fallback is configured in wrangler.toml via [assets] not_found_handling =
  "single-page-application". Client routes like /pricing and /admin have no file on disk;
  unmatched asset requests fall back to index.html so the React router renders them.
- Pages Functions run before the static-asset SPA fallback, so /api/* and the
  _middleware token gate on /pricing are always evaluated first and are never shadowed.

## Adding a tool
1. Add the React route and component under src/tools/.
2. Add the path(s) to TOOL_ROUTES in functions/_middleware.js.
3. Add a row to the tools table (slug, name, enabled).
4. If it has server data, add functions/api/tools/<slug>.js and an admin editor.
5. Add the tool path to TOOL_PATHS in src/admin/Admin.jsx so issued links point at it,
   and to the TOOLS list in src/pages/Landing.jsx.

## Seeding pricing
- scripts/seed-pricing.mjs holds the original Rush Pharmacy array (the single source of
  truth for the seed). Run `node scripts/seed-pricing.mjs` to print validated JSON, then
  paste it into the admin pricing editor and save. The live tool reads from D1, not this
  file, so the array is never bundled into the client.
