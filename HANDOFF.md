# MBS Medical Site - Session Handoff

Paste this whole doc into the next session. It is self-contained.

## What this project is

Layering a cinematic, animated visual system onto the MBS Medical
telehealth site (Astro 4 + a few React/R3F islands). Alex is the user:
lowercase, short messages, builds the site himself. **Locked rule: no
em dashes in any output, ever.** Use commas, periods, parentheses.

## Repos, branch, deploy

- **Local working dir**: `D:\Skills\mbs-live`
- **Branch**: `claude/3d-science`
- **Remotes**: `origin` = `github.com/shizzoobies/mbsmedical` (the LIVE
  site mbsdoc.com, deploys from `main` via Cloudflare Pages),
  `practice` = `github.com/shizzoobies/MBS3dscience` (Cloudflare preview).
- **Deploy command Alex expects after every change** (he has been
  asking for a push almost every step):
  ```
  git push practice claude/3d-science
  git push origin claude/3d-science:main
  ```
  The second one fast-forwards live `main`. Cloudflare redeploys in 1-3 min.
- Cloudflare cache: if a swapped image does not show, rename the file
  (e.g. `-v2`) and update the reference. Renaming is the reliable bust.

## Tech stack

- Astro 4.16, React 18 islands, R3F v8 (`@react-three/fiber@^8.17`,
  `@react-three/drei@^9.114`), three ^0.166. Do NOT upgrade R3F to v9.
- Pure CSS with custom properties, no Tailwind. Fraunces (serif
  display) + DM Sans (body). Tokens in `src/styles/global.css`.
- Dev server: `npm run dev` from `D:\Skills\mbs-live`, runs at
  `localhost:4321` (or 4322 if 4321 is busy).
- gltf-pipeline installed globally for Draco compression of Meshy GLBs.

## THE DESIGN FORMULA (most important section)

Alex is building every page on the same rhythm: alternate heavy
cinematic sections with lighter "break" sections so the page breathes.

- **Heavy** = full-bleed cinematic image: dark gradient, white text
  overlay, rust hairline borders + inset vignette + drop shadow.
- **Break** = something quieter between each heavy section: text-only
  value panels, a round-image trio with ambient animation, an R3F 3D
  object, or an accordion.

Typical page cadence:
hero (heavy) -> values 3-up (break) -> cinematic feature (heavy) ->
round-image trio / 3D / orbs (break) -> optional second cinematic
feature -> merged dark "Steps + Ready When You Are" closer -> FAQ.

Every page closes the same way: the merged dark steps+CTA section,
then a FAQ section with the 3D Caduceus ornament.

Ambient animations share a sage / rust / brass / amber palette so the
break sections read as a family even with different layouts.

## ServicePage.astro prop reference

`src/components/ServicePage.astro` is the template every service page
uses. Relevant props:

- `heroVariant?: 'editorial' | 'fullwidth'` - `fullwidth` = full-bleed
  image hero with dark gradient + white pill CTAs. Default editorial.
- `stepsAsHero?: boolean` - merges "How it works" + closing CTA into
  one dark `sig-cta-dark.jpg`-backdrop section, skips the standalone
  CTA. Every finished page sets this true.
- `stepsBackground?: 'testosterone'` - renders the animated
  TestosteroneGraph behind the steps section (mens-health only).
- `valuesAfterFirstFeature?: boolean` - moves the values 3-up to
  between features[0] and features[1].
- `roundImageTrio?: { eyebrow?, heading?, body?, items: {label,image}[],
  backdrop?: 'orbs' | 'data-grid' }` - three round framed images with
  labels + optional centered text block, rendered after the features.
  `orbs` = drifting sage/rust/brass blobs; `data-grid` = twinkling
  left-to-right wave of sage/rust/amber dots (lab/data feel).
- `Feature.variant?: 'editorial' | 'fullwidth'` - per-feature; a
  `fullwidth` feature is a full-bleed image section like the hero.
  `Feature.flip` puts the text on the right.
- `testimonials={[]}` - empty array hides the Patient Stories section.

## Key components

- `src/components/ServicePage.astro` - the service-page template.
- `src/components/react/TrtVial.tsx` - R3F TRT vial, scroll-triggered
  fly-in + spin-down, paper-cylinder label overlay. mens-health.
- `src/components/TestosteroneGraph.astro` - dotted upward arc with
  gold pulsing data points, used behind mens-health steps.
- `src/components/react/FaqCaduceus.tsx` - R3F Caduceus (amber bronze
  finish) in every FAQ heading column, scroll-triggered fly-in.
- `src/components/Footer.astro` - black footer, inverted-white logo.
- `src/pages/index.astro` - home page, custom layout (not ServicePage):
  flag-video hero, cinematic weight-loss + mens-health sections,
  centered mental-health with drifting orbs, merged steps+CTA, FAQ.

## Per-page status

DONE (full formula applied):
- `index.astro` (home)
- `mens-health.astro` - fullwidth hero, TRT vial R3F feature, ED
  fullwidth feature, stepsAsHero + testosterone graph.
- `primary-care.astro` - fullwidth hero, whole-person fullwidth
  feature, round-image trio (orbs) merged with the sub-services
  accordion, stepsAsHero.
- `labs.astro` - fullwidth hero, advanced-panels fullwidth feature,
  ongoing-monitoring round-image trio with data-grid backdrop,
  stepsAsHero, testimonials removed.

PARTIAL (heroVariant=fullwidth + stepsAsHero applied, still using the
old hero JPG as placeholder, still need feature[0] -> fullwidth +
roundImageTrio + dedicated images):
- `weight-loss.astro`, `womens-health.astro`, `lifestyle-medicine.astro`,
  `hair-dermatology.astro`, `mental-health.astro`, `sexual-health.astro`,
  `longevity.astro`, `concierge-medicine.astro`.

## Image / refs workflow

- Drop reference images in `D:\Skills\refs\`, named for purpose
  (e.g. `Primary Care Hero.png`, `lab circle.png`).
- Copy into `D:\Skills\mbs-live\public\images\` with a kebab-case
  name, reference as `/images/...`.
- Fullwidth hero images: most reference renders are ~1916x821.
  `object-fit: cover` crops to fit, so other ratios work too.
- `.raw.glb` Meshy source files are intentionally NOT committed
  (large); only the Draco-compressed `.glb` is.

## Conventions and gotchas

- No em dashes anywhere.
- Astro PreToolUse/PostToolUse hooks emit false-positive "failed"
  messages. Trust the actual tool result and the git output.
- In `features.map`, use `<Fragment>...</Fragment>` not `<>...</>`.
- Astro scoped CSS: to style a child component's class from a parent,
  wrap the selector in `:global(...)`.
- All hero/feature-hero sections carry hairline borders + inset
  vignette + drop shadow for depth. Content sections (`bg-cream`,
  `bg-shell`, `bg-sand`) get a lighter hairline treatment from
  `global.css`.

## Likely next steps

- Build out the 8 PARTIAL pages with the full formula: pick a feature
  for `variant: 'fullwidth'`, add a `roundImageTrio` break section,
  swap in dedicated hero images as Alex provides them.
- Alex tweaks as he goes; expect lots of small visual adjustments
  (sizing, positioning, animation speed/color) and a push after each.
