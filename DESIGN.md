---
version: alpha
name: MBS Medical
description: >
  Warm, editorial medical practice website. Quiet authority over clinical coldness.
  Inspired by hims.com — asymmetric layouts, lowercase confidence, pill shapes, 
  generous negative space. Feels like a well-designed wellness brand, not a hospital.

colors:
  primary: "#1A1A18"
  secondary: "#4A4A45"
  tertiary: "#7A7A72"
  neutral: "#F5F2EE"
  surface: "#FFFFFF"
  surface-warm: "#FAF7F3"
  accent: "#2D5A4E"
  accent-light: "#E8F0EE"
  accent-muted: "#8BAF9F"
  border: "#E2DDD8"
  border-strong: "#C8C2BA"

typography:
  display:
    fontFamily: Fraunces
    fontSize: 56px
    fontWeight: 300
    lineHeight: 1.05
    letterSpacing: -0.02em
  h1:
    fontFamily: Fraunces
    fontSize: 42px
    fontWeight: 300
    lineHeight: 1.1
    letterSpacing: -0.02em
  h2:
    fontFamily: Fraunces
    fontSize: 30px
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: -0.01em
  h3:
    fontFamily: DM Sans
    fontSize: 18px
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: 0em
  body-lg:
    fontFamily: DM Sans
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.7
  body-md:
    fontFamily: DM Sans
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: DM Sans
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: DM Sans
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1
    letterSpacing: 0.08em

rounded:
  none: 0px
  sm: 4px
  md: 8px
  lg: 16px
  pill: 999px

spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  2xl: 64px
  3xl: 96px
  4xl: 128px
  section: 80px

components:
  button-primary:
    fontFamily: DM Sans
    fontSize: 15px
    fontWeight: 500
    backgroundColor: "#1A1A18"
    textColor: "#FFFFFF"
    borderRadius: pill
    paddingX: 28px
    paddingY: 14px
  button-secondary:
    fontFamily: DM Sans
    fontSize: 15px
    fontWeight: 500
    backgroundColor: "transparent"
    textColor: "#1A1A18"
    border: "1.5px solid #1A1A18"
    borderRadius: pill
    paddingX: 28px
    paddingY: 14px
  button-accent:
    backgroundColor: "#2D5A4E"
    textColor: "#FFFFFF"
    borderRadius: pill
  nav:
    backgroundColor: "#FFFFFF"
    textColor: "#1A1A18"
    fontFamily: DM Sans
    fontSize: 15px
    fontWeight: 400
  card:
    backgroundColor: "#FAF7F3"
    borderRadius: lg
    border: "1px solid #E2DDD8"
    padding: lg
  tag:
    backgroundColor: "#E8F0EE"
    textColor: "#2D5A4E"
    borderRadius: pill
    fontSize: 12px
    fontWeight: 500
    letterSpacing: 0.06em
---

## Overview

MBS Medical is a medical practice website built for **quiet trust** — not clinical
sterility, not consumer-wellness hype. The design sits at the intersection of a 
premium wellness brand and a serious medical credential. Think: the confidence of a 
physician who doesn't need to oversell.

The visual language is editorial and warm. Fraunces serif for display type creates
authority without coldness. DM Sans handles all body copy, labels, and UI elements 
with clear readability. The warm off-white base (`#F5F2EE`) replaces clinical white, 
signaling approachability. Deep forest green (`#2D5A4E`) is the accent — grounded, 
calm, and medically adjacent without being pharmacy blue.

**Target feel**: The page a patient opens and immediately trusts.

---

## Colors

The palette is built on warm neutrals with a single, decisive accent.

- `primary` (`#1A1A18`) — near-black with a warm undertone. Used for all primary 
  text, headings, and the primary CTA button. NOT pure black.
- `neutral` (`#F5F2EE`) — the page canvas. Warm off-white that reads as considered,
  not default. Use as the base background for the site.
- `surface-warm` (`#FAF7F3`) — slightly warmer than neutral. Use for card 
  backgrounds and alternating section backgrounds.
- `surface` (`#FFFFFF`) — pure white. Reserve for modals, input fields, and areas 
  that need maximum contrast relief against the warm canvas.
- `accent` (`#2D5A4E`) — deep forest green. The brand's one expressive color.
  Use sparingly: primary CTAs, active states, icon accents, tag backgrounds.
- `accent-light` (`#E8F0EE`) — the green pulled back to almost-white. Use for 
  tag/badge backgrounds and subtle section tinting.
- `border` (`#E2DDD8`) — soft warm gray. Default divider and card border.

**Never use**: pure `#FFFFFF` as the page background. Never use blue of any shade as 
a primary action color. Never use gradient overlays on hero images.

---

## Typography

Two fonts only. No exceptions.

**Fraunces** (Google Fonts, optical-size aware) handles all display and heading 
levels. Use weight 300 for display and H1 — the lightness creates elegance. Weight 
400 for H2 and H3. Fraunces has a "wonky" optical axis that makes it feel handcrafted
and warm. Let it do that. Do not increase the weight to compensate for perceived 
fragility — the lightness is intentional.

**DM Sans** handles everything else: body, labels, nav, buttons, captions. Use 
weight 400 for body, 500 for labels and buttons. Do not use DM Sans at display sizes.

**Lowercase typography**: Following the hims.com reference, headings may be set in 
sentence case or all-lowercase for a confident, approachable feel. Do NOT use all-caps
for headings. Labels and tags may use uppercase with `letter-spacing: 0.08em` at 
12px only.

**Scale**: Use the token scale exactly. Do not introduce intermediate sizes.

---

## Layout

Editorial asymmetry is the governing principle. Not everything is centered.

- **Max width**: 1200px, centered, with 24px horizontal padding on mobile.
- **Grid**: 12-column CSS Grid for desktop. Single column for mobile.
- **Hero layout**: Off-center. Text block sits left (6–7 cols), image right, 
  with the image bleeding slightly toward the edge. No full-width centered hero text.
- **Section rhythm**: Alternate between `neutral` and `surface-warm` backgrounds 
  to create flow without borders.
- **Asymmetric text columns**: Long-form sections use a 7-col text block with a 
  pull quote or stat in the remaining 5 cols. Not centered body text.
- **Generous space**: Minimum `80px` top/bottom padding per section. Use `96px`–
  `128px` for hero and primary CTA sections.

**Do not use**:
- Full-width hero sections with centered headline + centered subtext + centered CTA
- Three-column icon-grid "feature" sections
- Testimonial carousels
- Footer with three-column link lists and a social icon row
- Accordion-heavy FAQ layouts

**Instead use**:
- Pull quotes in the margin alongside body copy
- Stats as large typographic elements (48px Fraunces numerals)
- Inline image-text pairs that break the grid slightly
- Single-column editorial flow for long-form sections

---

## Elevation & Depth

Flat. No floating cards with large box shadows.

Hierarchy is achieved through:
- **Background tonal shifts** between `neutral` and `surface-warm`
- **Border** (`1px solid #E2DDD8`) on cards and inputs — thin, warm
- **Scale**: interactive elements lift 2–4% on hover via `transform: scale(1.02)`,
  no shadow added
- **Contrast**: The accent green against the warm neutral creates depth without 
  shadows

If a shadow is ever needed (modal overlays only): `0 8px 40px rgba(26,26,24,0.10)`.
No colored shadows. No multi-layer shadows.

---

## Motion

Restrained and purposeful. One entrance moment, not scattered micro-interactions.

- **Page load**: Staggered fade-up on hero content. `opacity: 0 → 1`, 
  `transform: translateY(12px) → translateY(0)`. Duration 500ms, ease-out. 
  Stagger siblings by 80ms.
- **Scroll reveals**: `IntersectionObserver` triggers the same fade-up on section 
  content entering viewport. Threshold 0.15.
- **Hover — buttons**: Background lightens 8% on primary. Border darkens on 
  secondary. No scale on buttons.
- **Hover — cards**: `transform: translateY(-3px)` with `transition: 200ms ease`.
- **Hover — nav links**: Underline grows left-to-right via `::after` pseudo-element 
  with `scaleX` transform. No color change.

No bounce, no spring, no 3D perspective transforms. No auto-playing anything.

---

## Components

### Navigation
Sticky, white, thin `1px solid #E2DDD8` bottom border on scroll.  
Logo left. Links center (5 max). CTA button right (pill, primary style).  
Mobile: hamburger opens a full-screen overlay with links stacked, large Fraunces 
numerals as decorative elements. No slide-out drawer.

### Buttons
All buttons use `border-radius: 999px` (pill). No square or slightly-rounded buttons.  
- **Primary**: Dark `#1A1A18` fill, white text. Hover: `#2D2D2A`.
- **Secondary**: Transparent fill, dark border and text. Hover: `#F5F2EE` fill.
- **Accent**: Forest green `#2D5A4E` fill, white text. Use for primary patient-action 
  CTAs ("request appointment", "contact us").
- Padding: `14px 28px`. Font: DM Sans 500, 15px. No uppercase, no letter-spacing.

### Cards
Background: `surface-warm` (`#FAF7F3`).  
Border: `1px solid #E2DDD8`.  
Border-radius: `16px`.  
Padding: `32px`.  
No drop shadow at rest. Subtle `translateY(-3px)` on hover.

### Tags / Badges
Pill shape. Background: `accent-light` (`#E8F0EE`). Text: `accent` (`#2D5A4E`).  
12px DM Sans 500, 0.06em letter-spacing, uppercase.  
Use for service categories, specialties, status indicators.

### Forms / Inputs
Background: `#FFFFFF`. Border: `1.5px solid #C8C2BA`.  
Border-radius: `8px`. Padding: `12px 16px`. 
Focus: border color → `#2D5A4E`, no glow/box-shadow.  
Labels: 13px DM Sans 500, `#4A4A45`, above the input.

---

## Anti-Patterns (Explicit Blocks)

Claude Code must never generate these patterns for this project:

- `font-family: Inter` or `font-family: system-ui` — use DM Sans
- `font-family: Georgia` or any serif other than Fraunces — use Fraunces
- Blue (`#0066CC`, `#2563EB`, or any variant) as any action or accent color
- `background: linear-gradient(...)` on hero sections
- `border-radius: 8px` or `border-radius: 12px` on buttons — buttons are pill only
- `box-shadow: 0 4px 6px rgba(0,0,0,0.1)` card shadows — use border + tonal bg
- Icon grids (three or four columns of icon + heading + paragraph)
- Testimonial carousels or sliders of any kind
- `text-transform: uppercase` on any heading level
- Centered hero layout with CTA centered below centered subheading
- Any use of emoji in UI elements
- `<marquee>` or auto-scrolling text effects
- Stock photography with staged "happy patient" or "handshaking doctor" imagery
