# MBS Medical Site, Session Handoff

Self-contained. Paste into the next session or hand to a developer. Last updated 2026-06-08.

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

## Tech stack and local dev

- Astro 4.16, React 18 islands, R3F v8. Do NOT upgrade R3F to v9.
- Pure CSS custom properties, no Tailwind. **Lora** (display/heads) + **DM Sans** (body/UI),
  defined in `src/styles/global.css`.
- `npm run dev` (localhost:4321) for HMR. `npm run build` to verify compilation.
  `npx astro preview --port 4410` serves the built `dist/` (what a server on 4410 usually
  is; rebuild before re-checking there).
- `@astrojs/sitemap` is pinned to 3.2.1. Newer 3.7.x expects an Astro 5 hook and crashes
  the Astro 4 build.

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

## mbs-tools (separate app)

`mbs-tools/` is the gated internal tools subdomain at tools.mbsdoc.com: Vite + React +
Tailwind SPA with Cloudflare Pages Functions, a D1 database (`mbspharmacy`), and Cloudflare
Access (email OTP) gating the admin. Holds a pharmacy pricing tool (read-only table + CSV
upload) and link management. Independent build and deploy from the main Astro site. SPA
fallback is `mbs-tools/public/_redirects` (`/* /index.html 200`), not a wrangler `[assets]`
block.
