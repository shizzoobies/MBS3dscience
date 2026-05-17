# MBS Medical Site - Session Handoff

Paste this whole doc into the next session. It is self-contained.

## What this project is

Layering a cinematic, animated visual system onto the MBS Medical
telehealth site (Astro 4 + a few React/R3F islands). Alex is the user:
lowercase, short messages, builds the site himself, iterates fast with
a push after almost every change. **Locked rule: no em dashes in any
output, ever.** Use commas, periods, parentheses.

## Repos, branch, deploy

- **Local working dir**: `D:\Skills\mbs-live`
- **Branch**: `claude/3d-science`
- **Remotes**: `origin` = `github.com/shizzoobies/mbsmedical` (the LIVE
  site mbsdoc.com, deploys from `main` via Cloudflare Pages),
  `practice` = `github.com/shizzoobies/MBS3dscience` (Cloudflare preview).
- **Deploy after every change** (Alex expects this every step):
  ```
  git push practice claude/3d-science
  git push origin claude/3d-science:main
  ```
  The second fast-forwards live `main`. Cloudflare redeploys in 1-3 min.
- Cloudflare cache: if a swapped image does not show, rename the file
  (`-v2` suffix) and update the reference. Renaming is the reliable bust.
- Earlier in the project Cloudflare's cache-purge API was erroring and
  a deploy briefly failed to show. If a push lands on `main` (verify
  with `git fetch` + compare `origin/main`) but the site does not
  update, it is Cloudflare-side: check the Pages Deployments list.

## Tech stack

- Astro 4.16, React 18 islands, R3F v8. Do NOT upgrade R3F to v9.
- Pure CSS custom properties, no Tailwind. Fraunces (serif) + DM Sans.
- Dev server `npm run dev` from the working dir (localhost:4321/4322).
- `npm run build` to verify compilation. gltf-pipeline (global) for
  Draco-compressing Meshy GLBs.

## THE DESIGN FORMULA

Alternate heavy cinematic sections with lighter break sections so the
page breathes.

- **Heavy** = full-bleed cinematic image: dark gradient, white text
  overlay near a viewport edge, rust hairline borders + inset vignette.
- **Break** = quieter section between heavies: text value panels, a
  round-image trio with ambient animation, an R3F 3D object, accordion.

Page cadence: hero (heavy) -> values or trio (break) -> cinematic
feature (heavy) -> trio / 3D / orbs (break) -> merged dark
"Steps + Ready When You Are" closer -> FAQ with the Caduceus ornament.

Ambient animations share a sage / rust / brass / amber palette.

## ServicePage.astro prop reference

`src/components/ServicePage.astro` is the template every service page
uses (home and about have their own custom layouts).

- `heroVariant?: 'editorial' | 'fullwidth'` - fullwidth = full-bleed
  image hero, dark gradient, white pill CTAs.
- `heroFocus?: string` - object-position for the fullwidth hero image
  (e.g. `'center 22%'` to keep a subject's head in frame).
- `heroFlip?: boolean` - fullwidth hero text column on the right.
- `stepsAsHero?: boolean` - merges "How it works" + closing CTA into a
  dark sig-cta-dark-backdrop section. Every finished page sets true.
- `stepsBackground?: 'testosterone'` - animated TestosteroneGraph
  behind the steps section (mens-health only).
- `valuesAfterFirstFeature?: boolean` - values 3-up between
  features[0] and features[1].
- `roundImageTrio?: { eyebrow?, heading?, body?, items: {label,image}[],
  backdrop?: 'orbs' | 'data-grid' }` - three round framed images with
  labels + optional centered text block, rendered after the features.
  `orbs` = drifting sage/rust/brass blobs. `data-grid` = left-to-right
  twinkling field of sage/rust/amber dots.
- `Feature.variant?: 'editorial' | 'fullwidth'`, `Feature.flip` - a
  fullwidth feature is a full-bleed image section; flip puts text right.
- `values={[]}` and `testimonials={[]}` hide those sections entirely.
  Every page currently passes `testimonials={[]}` (Google API reviews
  to be wired in later).

## Key components

- `ServicePage.astro` - service-page template.
- `react/TrtVial.tsx` - R3F TRT vial, scroll fly-in + spin. mens-health.
- `TestosteroneGraph.astro` - dotted upward arc, gold pulsing dots.
- `react/FaqCaduceus.tsx` - R3F amber Caduceus in every FAQ heading,
  scroll-triggered fly-in.
- `Footer.astro` - black footer, inverted-white logo.
- `index.astro` - home, custom layout: flag-video hero, cinematic
  weight-loss + mens-health, centered mental-health with drifting orbs
  and 4 condition portraits, merged steps+CTA, FAQ.
- `about.astro` - custom layout: full-bleed team hero (`.about-hero-fw`).

## Per-page status

DONE (full formula, dedicated images):
- `index.astro`, `mens-health`, `primary-care`, `labs`,
  `lifestyle-medicine`, `weight-loss`, `longevity`, `about`.

PARTIAL (fullwidth hero + stepsAsHero applied, still using the old
hero JPG placeholder, still need a dedicated 1916x821 hero image, a
feature[0] -> fullwidth conversion, and a roundImageTrio break section):
- `womens-health`, `hair-dermatology`, `mental-health`,
  `sexual-health`, `concierge-medicine`.

## Image / refs workflow

- Reference images live in `D:\Skills\refs\`, named for purpose.
- Copy into `public/images/` with a kebab-case name; if replacing an
  existing file, use a new name (`-v2`) to dodge Cloudflare cache.
- Fullwidth hero/feature images: reference renders are ~1916x821 or
  ~1672x941; object-fit: cover handles both.
- `.raw.glb` Meshy sources are NOT committed (large); only the
  Draco-compressed `.glb` is.

## Conventions and gotchas

- No em dashes anywhere.
- Astro hooks emit false-positive "failed" messages; trust the actual
  tool result and git output.
- In `features.map`, use `<Fragment>` not the `<>` short syntax.
- Astro scoped CSS: to style a child component's class from a parent,
  wrap the selector in `:global(...)`.
- Round images (trios, mental-health portraits) MUST be absolutely
  positioned inside their aspect-ratio:1 wrapper, or a portrait source
  image stretches the circle into an oval via flex min-height.
- Trio middle image is intentionally larger than the outer two
  (`.sp-trio__item--2`). Left and right share one size rule.
- Circle frames are the dark primary color (`var(--color-primary)`).
- Fullwidth hero/feature containers break out of the centered 1280px
  container with `padding-inline: clamp(1.5rem, 5vw, 6rem)` so text
  sits near the edge where the gradient is darkest.

## Likely next steps

- Build the 5 PARTIAL pages to the full formula as Alex supplies
  reference images: dedicated hero, a fullwidth feature, a
  roundImageTrio break section.
- Wire Google API reviews into the (currently empty) testimonials slot.
- Expect continued small visual tweaks with a push after each.
