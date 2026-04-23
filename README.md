# MBS Medical — Website (Redesign)

Full visual redesign of mbsdoc.com built from scratch in Astro, following the `design-system.md` guide in this directory.

Inspired by hims.com: warm neutral palette, lowercase typography, pill buttons, editorial asymmetry.

## Stack

- **Astro 4** — static site generator
- **DM Sans** + **Fraunces** (Google Fonts)
- Pure CSS with design-token custom properties (no Tailwind, no framework)

## Commands

```bash
npm install       # Install dependencies
npm run dev       # Local dev server at localhost:4321
npm run build     # Production build to dist/
npm run preview   # Preview the built site locally
```

## Structure

```
src/
  layouts/Layout.astro       # Page shell, Google Fonts, scroll observer
  components/
    Header.astro              # Transparent nav, solid on scroll, mobile drawer
    Footer.astro              # Ink-surface 4-col footer
    ServicePage.astro         # Shared template for all 11 service pages
  styles/global.css           # All design tokens + base styles + patterns
  pages/
    index.astro               # Home
    about.astro               # About + team
    services.astro            # Services directory grid
    contact.astro             # Contact form + info
    tools.astro               # Patient tools + quick info
    weight-loss.astro
    primary-care.astro
    mens-health.astro
    mental-health.astro
    womens-health.astro
    longevity.astro
    sexual-health.astro
    hair-dermatology.astro
    labs.astro
    lifestyle-medicine.astro
    concierge-medicine.astro
public/
  favicon.svg
  review-9f3kx.html           # Hidden pre-launch review tool
  images/                     # Team photos + placeholders
```

## Design Rules (Locked)

1. **Lowercase headlines** via CSS `text-transform: lowercase` (content stays sentence-cased in HTML for screen readers).
2. **No em dashes** anywhere. Use commas, periods, or parentheses.
3. **No pure-white backgrounds.** Default to `--surface-cream`.
4. **Pill buttons only** (`--radius-pill` / 999px).
5. **No doctors in white coats** as stock imagery.

See `design-system.md` for the complete design guide.
