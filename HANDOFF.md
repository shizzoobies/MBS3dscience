# MBS Medical Site, Session Handoff

Self-contained. Paste into the next session or hand to a developer. Last updated 2026-06-10.

## What this project is

The MBS Medical telehealth marketing site (mbsdoc.com): Astro 4 with a few React / R3F
islands and a cinematic, animated visual system. Alex is the user (Director of Growth):
lowercase, short messages, builds the site himself, iterates fast and expects a push after
almost every change. **Locked rule: no em dashes in any output, ever.** Use commas,
periods, parentheses.

## Repos, branch, deploy

- **Local working dir:** `D:\Skills\mbs-live`
- **Branch:** `claude/3d-science`
- **Remotes:** `origin` = `github.com/shizzoobies/mbsmedical` (the LIVE site mbsdoc.com,
  deploys from `main` via Cloudflare Pages). `practice` = `github.com/shizzoobies/MBS3dscience`
  (Cloudflare preview, optional).
- **Deploy (publishes live):**
  ```
  git push origin claude/3d-science:main
  ```
  Optionally also `git push practice claude/3d-science` for the preview. Cloudflare
  redeploys in 1 to 3 minutes.
- **Commit trailer:** end every commit with
  `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`
- **Cloudflare cache:** files in `public/` are served un-fingerprinted. If a swapped image
  does not show, rename the file (a `-v2` or descriptive suffix) and update the reference;
  renaming is the reliable bust. Hard-refresh (Ctrl+Shift+R) after deploys.
- **The git build can FAIL (and currently does).** As of 2026-06-09 the mbsmedical Pages git
  build returns Status: Failure (almost certainly `@astrojs/sitemap` resolving to 3.7.x on a
  fresh CI install, see Tech stack + Open items). A failed build does NOT replace the live
  deployment. When the push does not go live, deploy the built output directly: from
  `mbs-live`, `npm run build` then
  `npx wrangler pages deploy dist --project-name mbsmedical --branch main --commit-dirty=true`.
- **wrangler is authenticated locally** (stored OAuth, single Cloudflare account), so
  `npx wrangler` works for Pages deploys and D1 writes without extra setup.

## Tech stack and local dev

- Astro 4.16, React 18 islands, R3F v8. Do NOT upgrade R3F to v9.
- Pure CSS custom properties, no Tailwind. **Lora** (display/heads) + **DM Sans** (body/UI),
  defined in `src/styles/global.css`.
- `npm run dev` (localhost:4321) for HMR. `npm run build` to verify compilation.
  `npx astro preview --port 4410` serves the built `dist/` (what a server on 4410 usually
  is; rebuild before re-checking there).
- `@astrojs/sitemap` is `^3.2.1` in package.json (a caret range, NOT an exact pin). Newer
  3.7.x expects an Astro 5 hook and crashes the Astro 4 build; on a fresh CI install that is
  the likely cause of the currently-failing mbsmedical build. Fix: pin to exact `3.2.1` and
  resync the lockfile (`npm install`), then push and confirm the build goes green.

## THE DESIGN FORMULA

Alternate heavy cinematic sections with lighter break sections so the page breathes.

- **Heavy** = full-bleed cinematic image: dark gradient, white text overlay near a viewport
  edge, rust hairline borders + inset vignette.
- **Break** = quieter section: text value panels, a round-image trio with ambient
  animation, an R3F 3D object, or an accordion.

Page cadence: hero (heavy) -> values or trio (break) -> cinematic feature (heavy) ->
trio / 3D / orbs (break) -> merged dark "Steps + Ready When You Are" closer -> FAQ with
the Caduceus ornament. Ambient animations share a sage / rust / brass / amber palette.

## Header and the transparent nav (site-wide)

- `src/layouts/Layout.astro` renders `<Header />` then `<main>` and owns the global scroll
  listener that adds `.scrolled` to the header past ~20px.
- `Layout` prop `transparentHeader` (boolean) flows to `Header` as `transparentTop`, which
  adds `.site-header--over-hero`. The header is `position: fixed`; heroes are full-bleed and
  start at the top of `<main>`, so the image already sits behind the header and transparent
  simply reveals it.
- Over-hero (not scrolled): transparent background, white logo, light nav, plus a soft top
  scrim (`.site-header--over-hero:not(.scrolled)::before`) so the light nav stays legible
  over bright hero tops. Reverts to the solid cream header on `.scrolled`.
- Enabled everywhere: `ServicePage` auto-sets it when `heroVariant === 'fullwidth'` (all
  service pages are fullwidth). `services`, `about`, `contact`, and `index` set
  `transparentHeader={true}` directly.

## Home hero video (index.astro)

- `<video autoplay muted playsinline preload="metadata" poster=...>` with NO `loop`.
- Inline script: plays only at the top (scrollY <= 4), freezes on scroll, and once the clip
  has `ended` it holds on the final frame and never restarts.
- `public/videos/hero.mp4` is currently the single digital particle-flag clip: cubes
  assemble into a crisp distressed American flag, play once, then hold on that flag as a
  static backdrop. Source: `D:\MBS Medical\Assets\Videos\16026-268871763_medium.mp4`,
  re-encoded to 1080p crf 28.

## Image reveal and LCP

- `src/styles/global.css` fades content images in: `main img:not([data-no-reveal])` starts
  at opacity 0 until JS adds `.is-loaded` on the load event.
- Hero background images MUST carry `data-no-reveal` so they paint immediately (they are the
  LCP element). Without it a hero appears to load slowly.

## ServicePage.astro prop reference

`src/components/ServicePage.astro` is the template every service page uses (home and about
have their own custom layouts).

- `heroVariant?: 'editorial' | 'fullwidth'` (fullwidth = full-bleed image hero, dark
  gradient, white pill CTAs). All current service pages are fullwidth.
- `heroFocus?: string` object-position for the fullwidth hero image (e.g. `'center 22%'` to
  keep a head in frame).
- `heroFlip?: boolean` fullwidth hero text column on the right.
- `stepsAsHero?: boolean` merges "How it works" + closing CTA into a dark
  sig-cta-dark-backdrop section. Every finished page sets true.
- `valuesAfterFirstFeature?`, `subServicesAfterFirstFeature?: boolean` placement toggles.
- `roundImageTrio?: { eyebrow?, heading?, body?, items: {label,image}[], backdrop?: 'orbs' | 'data-grid' }`
  three round framed images, optional centered text, ambient backdrop.
- `subServices?: { heading?, intro?, items: string[], disclaimer? }` collapsible chip grid
  of conditions covered.
- `spotlights?: [...]` standalone editorial callouts (used for NAD+, stem cell, etc.).
- `Feature.variant?: 'editorial' | 'fullwidth'`, `Feature.flip`, `Feature.imgFocus` a
  fullwidth feature is a full-bleed image band; flip puts text right.
- **CTA / steps copy overrides** (each defaults to the site-wide string, so other pages are
  unaffected): `stepsEyebrow`, `stepsTitle`, `ctaEyebrow`, `ctaTitle`, `ctaSub`,
  `ctaPrimaryLabel`. Added for the Veterans page; reusable anywhere.
- `bookingHref?` drives every page-level CTA (hero, in-feature, closing).
- `values={[]}` / `testimonials={[]}` hide those sections. Every page passes
  `testimonials={[]}` (Google reviews to be wired in later).

## Recent work (this initiative)

**2026-06-09 to 06-10 (most recent session):**
- **Indexing / soft-404 fix (main site):** unknown URLs were returning the homepage at HTTP
  200 (soft-404), causing Search Console "Duplicate without user-selected canonical" (leftover
  WordPress URLs `/pink-eye/`, `/tools/`) and stalling real pages in "Discovered, currently not
  indexed". Fixed with a self-referencing `<link rel="canonical">` in `Layout.astro`, a real
  `src/pages/404.astro`, and `public/_redirects` with `/*  /404.html  404`. Live-verified (junk
  URLs now 404, canonicals present). Shipped via the direct wrangler deploy (the git build failed).
- **NEXUS consultation link** on `/veterans-care/` updated to the new PracticeBetter token
  (`?s=6a276da72d2b042cecd612f6`). Live-verified.
- **Pharmacy pricing tool:** major buildout (3 new pharmacies + several features). Full current
  state is in the mbs-tools section below.

**Earlier in the initiative:**
- **Veterans Care page** (`/veterans-care/`): new page for Nexus Letters, grouped under
  "specialty & premium" in the nav (`Header.astro` serviceCategories) and the services index
  (`services.astro`). Honest-by-design copy: no guarantee of outcome, clear "not affiliated
  with the VA" disclaimer. Booking points to the PracticeBetter consultation link. CTA and
  steps copy use the override props above.
  - Hero `hero-veterans-nexus.jpg` (veteran reviewing claim paperwork, the "NEXUS Header"
    source), flipped so the headline sits on the dark right.
  - "The Standard" feature is a full-bleed band backed by `feat-veterans-pt.jpg` (a Marine
    veteran in physical therapy), `imgFocus: center 30%` so the head is not cropped wide.
- **Transparent headers site-wide** plus the legibility scrim (see Header section).
- **Performance:** hero images marked `data-no-reveal` to fix slow LCP paint.
- **Home hero** simplified to the single particle-flag clip described above.
- Earlier this session: Lora replaced Fraunces (odd lowercase f); GLP-1 Premium pricing;
  Veterans page added as the 12th specialty (services headline and meta now say "Twelve" /
  "12").

## Per-page status

All service pages are on the fullwidth-hero + stepsAsHero formula (primary-care, labs,
lifestyle-medicine, weight-loss, everyday-vitality, longevity, mens-health, womens-health,
sexual-health, hair-dermatology, mental-health, concierge-medicine, veterans-care), plus
`index`, `services`, `about`, `contact`. Testimonials slots are still empty pending Google
reviews.

## Key components

- `ServicePage.astro` service-page template.
- `react/TrtVial.tsx` R3F TRT vial (mens-health). `TestosteroneGraph.astro` dotted arc.
- `react/FaqCaduceus.tsx` R3F amber Caduceus in every FAQ heading.
- `Header.astro` nav, serviceCategories, transparent + scrim CSS. `Footer.astro` black
  footer, inverted-white logo.
- `index.astro` home (custom layout, flag-video hero). `about.astro` custom team hero.

## Media workflow

- Recent source media lives in `D:\MBS Medical\Assets\Videos` and `...\Assets\Images`
  (e.g. NEXUS Header.png, VT PT.png). Older references are in `D:\Skills\refs\`.
- Copy into `public/images/` (or `public/videos/`) with a kebab-case name; if replacing an
  existing file, use a new name to dodge Cloudflare cache.
- Fullwidth hero/feature images are roughly 1916x821 or 1672x941; `object-fit: cover`
  handles both. Convert PNG sources to optimized JPG (ffmpeg `-q:v 3`).
- Add `data-no-reveal` to any new hero `<img>`.
- `.raw.glb` Meshy sources are NOT committed; only the Draco-compressed `.glb` is.

## Gotchas

- No em dashes anywhere.
- Astro hooks emit false-positive "failed" messages; trust the actual tool result and git
  output.
- In `features.map`, use `<Fragment>` not the `<>` short syntax.
- Astro scoped CSS: to style a child component's class from a parent, wrap the selector in
  `:global(...)`.
- Round images must be absolutely positioned inside their `aspect-ratio:1` wrapper or a
  portrait source stretches the circle into an oval.
- Windows Git Bash cwd resets to `D:\Skills` after each Bash call. Start commands with
  `cd D:/Skills/mbs-live` and use absolute paths; ffmpeg and node resolve relative output
  paths against the actual cwd.
- ffmpeg montages: normalize every input to the same resolution, fps, sar, and pixel format
  before `xfade`; `offset` = sum of prior clip durations minus prior fade durations.

## Open items and next steps

- **Main-site CI build is failing** (mbsmedical Pages git build, Status: Failure). The live
  site is fine (held on the last good / direct-uploaded deploy), but auto-deploy on push is
  broken until fixed. Fix: pin `@astrojs/sitemap` to exact `3.2.1`, resync `package-lock.json`,
  push, and confirm the build goes green. Until then, deploy main-site changes with the direct
  wrangler command in the Deploy section.
- **Veterans Care pricing:** page says "flat fee, quoted after a free review" with no dollar
  amount. Drop in a number if you want it shown.
- **Veterans Care legal review:** confirm provider credentialing for Nexus Letters and have
  the legal framing reviewed before heavy promotion.
- **Em dashes in ServicePage comments:** about 18 pre-existing em dashes remain in code
  comments (section divider headers) in `ServicePage.astro`. Optional repo-wide sweep; none
  are user-facing.
- **Specialty count:** confirm "Twelve" / "12" is the canonical number.
- **Testimonials:** wire Google API reviews into the empty testimonials slots.
- **Image formats:** heroes are JPG; WebP/AVIF and a per-page `<link rel="preload" as="image">`
  would further improve LCP if load time becomes a focus.

## mbs-tools: pharmacy pricing tool (tools.mbsdoc.com)

`mbs-tools/` is a SEPARATE app inside this repo: Vite + React + Tailwind SPA + Cloudflare Pages
Functions, backed by a D1 database (`mbspharmacy`). `/admin` is gated by Cloudflare Access
(email OTP); end users reach `/pricing` via link tokens checked in `functions/_middleware.js`.
House rules in `mbs-tools/AGENTS.md` (no em dashes, Tailwind core utilities only, no
localStorage, no PHI). SPA fallback is `mbs-tools/public/_redirects` (`/* /index.html 200`).

**Pricing data lives in D1, NOT in git.** The tool reads `GET /api/tools/pricing`;
`scripts/seed-pricing.mjs` is only the initial seed, not the live source. Current D1 state:
**656 rows across 4 pharmacies** (Rush 103, SandsRx 155, Olympia 298, Promise 100). SandsRx
prices carry a **10% discount** (price * 0.90; each SandsRx row's notes say "10% discount
applied"). 8-field row shape: product, strength, size, form, category, pharmacy, price, notes.

**Extraction + merge pipeline lives at `D:\Skills\.pharmacy-extract\` (NOT in the repo).**
Source price sheets are in `D:\MBS Medical\Pharmacy Pricing\<Pharmacy>\`. Tooling: `pdftotext`
(Git mingw) + `pandoc` for text-layer PDFs/docx/html; `py -3` + `pymupdf` to render scanned
PDFs to images (then read visually); `pdfplumber` (`promise/extract_rows.py`) to rebuild table
rows by y-position when `pdftotext -layout` scrambles columns (use this for messy price tables,
it gives exact price-to-product mapping). Per-pharmacy builders (`sands_build.mjs`,
`olympia_build.mjs`, `promise/promise_build.mjs`) emit normalized rows; merges write
`final-pricing.csv` (the current full dataset, also backed up alongside).

**To change live data:** either (a) admin > Pricing > Update from CSV (Alex only, Access-gated),
or (b) direct D1 write, which is how recent loads were done. `node .pharmacy-extract/d1_load.mjs`
regenerates `load-pricing.sql` from `final-pricing.csv`; then from `mbs-tools`:
`npx wrangler d1 execute mbspharmacy --remote --file=D:/Skills/.pharmacy-extract/load-pricing.sql`.
GOTCHA: D1 caps a SQL statement at 100 KB and the json is ~145 KB, so d1_load writes a reset +
chunked `json || '...'` concatenation (NOT one INSERT, which fails SQLITE_TOOBIG). Back up first
(`SELECT json ... > backup.json`). Verify after with
`SELECT COUNT(*), COUNT(DISTINCT pharmacy) FROM tool_data, json_each(json) WHERE slug='pricing'`.

**Deploy (code) is separate from the main site.** tools.mbsdoc.com is its OWN Cloudflare Pages
project ("mbs-tools", Direct Upload, NOT git-connected), so a git push does NOT deploy it. From
`mbs-tools`: `npx wrangler pages deploy --branch main --commit-dirty=true` (reads wrangler.toml
for the dist dir + the D1 binding, and bundles `functions/` automatically). ALWAYS verify the
functions/gate survived:
`curl -s -o /dev/null -w '%{http_code}' https://tools.mbsdoc.com/api/tools/pricing` must return
**403** (200 means only static assets shipped and the functions are missing, do NOT leave that
live). Then commit + push so git matches what is deployed.

**Features in `src/tools/PharmacyPricing.jsx` (all current/live):**
- Catalog + Compare views; search, Form/Pharmacy dropdowns, category pills.
- **Click-to-portal:** clicking a catalog row (or a Compare price cell) opens that pharmacy's
  ordering portal in a new tab. `PHARMACY_PORTALS` map (matched loosely by name): Rush
  (lifefile), SandsRx (portal.sandsrx.com), Olympia (olympiapharmacy.drscriptportal.com),
  Promise (promise.pharmetika.com/provider_access/login).
- **Computed columns** (front-end, from strength/size/price; dash where not parseable):
  "Total Drug" (concentration x volume, or per-unit dose x count) and "Unit Cost" (normalized:
  per active-unit for injectables, per ea for solids, per g for creams). Unit Cost header is
  **sortable** (numeric, dash rows last; pair with a Form filter since units differ across
  forms). Compare view shows each pharmacy's unit cost as a subline under its price.
- **Filter pills:** All, Hormone Support, Peptide Wellness, Tirzepatide, Semaglutide, Men's
  Health, Topical Products, Wellness Support, Nutritional & Wellness, Women's Health. The
  Weight Management pill was replaced by the Tirzepatide + Semaglutide product-keyword shortcuts
  (match `/tirzepatide/i` and `/semaglutide/i` on product); WM is still a category on the rows.

**Conventions:** pharmacy names "Rush/SandsRx/Olympia/Promise Pharmacy". Categories mapped to a
fixed set; "Women's Health" was added for SandsRx women's items. Olympia rows note "Doctor list
price" (wholesale per-unit). Cells needing source verification carry "VERIFY" in notes.

**Open (tool):** SandsRx "Nandrolone 100 mg/mL gel $95" flagged VERIFY (unusual form). A few
IU-dosed injectables show "$0.0000/iu" (per-IU cost rounds to zero at 4 decimals, cosmetic).
The in-tool footer still reads "Source: Rush Pharmacy catalog" (stale, now 4 pharmacies).
Memory file `pharmacy_pricing_tool.md` mirrors this state and auto-loads each session.
