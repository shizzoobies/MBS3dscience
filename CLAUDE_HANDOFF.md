# MBS Medical — Claude Code Design System Handoff

You are working on **mbsdoc.com**, a medical practice website built in **Astro 4**
with pure CSS custom properties (no Tailwind, no component framework).

A `DESIGN.md` file lives in the project root. It is your single source of truth
for all visual decisions. Read it before touching any CSS or component.

---

## Your First Task

Before writing any code:

1. Read `DESIGN.md` in full
2. Read `src/styles/` (or wherever the global CSS lives) to understand the current
   token structure
3. Read `src/layouts/Layout.astro` to understand the page shell
4. Read `src/pages/index.astro` to understand the current homepage structure

Do not generate any code until you have read all four. Confirm you have read them
by summarizing:
- The current font stack
- The current color tokens
- The current button style
- Any layout pattern that conflicts with DESIGN.md

---

## Standing Rules (Never Break These)

### Fonts
- Display and all heading levels (h1–h3): **Fraunces** (Google Fonts), weight 300–400
- All body, labels, nav, buttons, captions: **DM Sans** (Google Fonts), weight 400–500
- Never use: Inter, Roboto, system-ui, Georgia, or any other font family

### Colors
- Page background: `#F5F2EE` (warm off-white) — never pure `#FFFFFF`
- Primary text: `#1A1A18` (warm near-black) — never pure `#000000`
- Accent: `#2D5A4E` (forest green) — the only expressive color allowed
- Action color: Never blue in any shade
- Gradients: Never on hero sections or backgrounds

### Buttons
- All buttons are pill-shaped: `border-radius: 999px`
- Never `border-radius: 8px` or `border-radius: 12px` on buttons
- Primary: `#1A1A18` background, white text
- Accent CTA (appointments, contact): `#2D5A4E` background, white text
- Secondary: transparent, `1.5px solid #1A1A18` border

### Layout
- Max width: 1200px centered
- Hero layout: asymmetric — text left (6–7 cols), image right. Never centered hero
- Section padding: minimum 80px top/bottom
- Alternate section backgrounds between `#F5F2EE` and `#FAF7F3`

### What to Never Generate
- Full-width centered hero (headline + subtext + CTA all centered)
- Three-column icon grids
- Testimonial carousels or any slider
- `box-shadow` card shadows — use `border: 1px solid #E2DDD8` instead
- `text-transform: uppercase` on headings
- Emoji in any UI element
- Staged stock photography (happy patients, handshaking doctors)

---

## CSS Token Convention

All values must be set as CSS custom properties on `:root`. Use this naming pattern:

```css
:root {
  /* Colors */
  --color-primary: #1A1A18;
  --color-secondary: #4A4A45;
  --color-tertiary: #7A7A72;
  --color-neutral: #F5F2EE;
  --color-surface: #FFFFFF;
  --color-surface-warm: #FAF7F3;
  --color-accent: #2D5A4E;
  --color-accent-light: #E8F0EE;
  --color-accent-muted: #8BAF9F;
  --color-border: #E2DDD8;
  --color-border-strong: #C8C2BA;

  /* Typography */
  --font-display: 'Fraunces', serif;
  --font-body: 'DM Sans', sans-serif;

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 40px;
  --space-2xl: 64px;
  --space-3xl: 96px;
  --space-4xl: 128px;
  --space-section: 80px;

  /* Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
  --radius-pill: 999px;
}
```

If these tokens already exist in the codebase under different names, migrate them
to this convention rather than adding a second set.

---

## Motion Rules

- Page load: staggered fade-up on hero content
  `opacity: 0→1`, `transform: translateY(12px)→translateY(0)`, 500ms ease-out,
  siblings staggered 80ms apart
- Scroll reveals: IntersectionObserver, threshold 0.15, same fade-up
- Card hover: `transform: translateY(-3px)`, `transition: 200ms ease` — no shadow added
- Nav link hover: underline grows left-to-right via `::after` scaleX transform
- Button hover: background lightens/darkens 8% — no scale on buttons
- Never: bounce, spring, 3D perspective, auto-playing anything

---

## Component Reference

### Navigation
- Sticky, white, `border-bottom: 1px solid var(--color-border)` appears on scroll
- Logo left | links center (5 max) | pill CTA button right
- Mobile: full-screen overlay, NOT a slide-out drawer

### Cards
- Background: `var(--color-surface-warm)`
- Border: `1px solid var(--color-border)`
- Border-radius: `var(--radius-lg)` (16px)
- Padding: 32px
- No shadow at rest. `translateY(-3px)` on hover only

### Tags / Badges
- Background: `var(--color-accent-light)` | Text: `var(--color-accent)`
- Border-radius: `var(--radius-pill)`
- 12px DM Sans 500, 0.06em letter-spacing, uppercase

### Form Inputs
- Background: `#FFFFFF` | Border: `1.5px solid var(--color-border-strong)`
- Border-radius: `var(--radius-md)` (8px) | Padding: 12px 16px
- Focus: border → `var(--color-accent)`, no box-shadow glow
- Labels: 13px DM Sans 500, `var(--color-secondary)`, positioned above input

---

## How to Work on This Project

When I give you a task:
1. Check `DESIGN.md` for relevant tokens and rules before writing any code
2. Use CSS custom properties — never hardcode hex values in component styles
3. State which DESIGN.md rule or token you are applying before each section of code
4. If something I ask for would violate a DESIGN.md rule, flag it and propose an
   alternative that stays on-system
5. Never introduce a new font, color, or layout pattern not in DESIGN.md without
   explicit approval

When I say "build [component]" — default to the editorial asymmetric layout style
described in DESIGN.md unless I specify otherwise.

---

## Project Stack Reminder

- **Framework**: Astro 4 (static site generator)
- **Styling**: Pure CSS with custom properties — no Tailwind, no CSS-in-JS
- **Fonts**: Google Fonts (Fraunces + DM Sans)
- **Deployment**: Cloudflare Pages
- **Repo**: github.com/shizzoobies/mbsmedical

---

Ready. Read the four files listed above and report back before touching any code.
