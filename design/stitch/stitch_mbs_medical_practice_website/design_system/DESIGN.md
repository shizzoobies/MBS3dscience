---
colors:
  surface: '#fdf8f7'
  surface-dim: '#ddd9d8'
  surface-bright: '#fdf8f7'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f7f3f2'
  surface-container: '#f1edec'
  surface-container-high: '#ebe7e6'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#474741'
  inverse-surface: '#313030'
  inverse-on-surface: '#f4f0ef'
  outline: '#777771'
  outline-variant: '#c8c7bf'
  surface-tint: '#5f5e5c'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1c1c1a'
  on-primary-container: '#858481'
  inverse-primary: '#c9c6c3'
  secondary: '#5f5f59'
  on-secondary: '#ffffff'
  secondary-container: '#e4e2db'
  on-secondary-container: '#65655f'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1b1c16'
  on-tertiary-container: '#84847c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e2de'
  primary-fixed-dim: '#c9c6c3'
  on-primary-fixed: '#1c1c1a'
  on-primary-fixed-variant: '#474744'
  secondary-fixed: '#e4e2db'
  secondary-fixed-dim: '#c8c6c0'
  on-secondary-fixed: '#1b1c18'
  on-secondary-fixed-variant: '#474742'
  tertiary-fixed: '#e4e3d9'
  tertiary-fixed-dim: '#c8c7be'
  on-tertiary-fixed: '#1b1c16'
  on-tertiary-fixed-variant: '#474740'
  background: '#fdf8f7'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
typography:
  display-hero:
    fontFamily: Fraunces
    fontSize: 84px
    fontWeight: '300'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  h1-editorial:
    fontFamily: Fraunces
    fontSize: 64px
    fontWeight: '300'
    lineHeight: '1.1'
    letterSpacing: -0.01em
  h2-section:
    fontFamily: Fraunces
    fontSize: 48px
    fontWeight: '400'
    lineHeight: '1.2'
  h3-subhead:
    fontFamily: DM Sans
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.4'
  body-main:
    fontFamily: DM Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  label-tag:
    fontFamily: DM Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.0'
    letterSpacing: 0.1em
  button-text:
    fontFamily: DM Sans
    fontSize: 16px
    fontWeight: '500'
    lineHeight: '1.0'
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  section-padding-min: 80px
  section-padding-max: 128px
  grid-columns: '12'
  gutter: 32px
  max-width: 1440px
---

## Brand & Style
This design system establishes a premium, editorial aesthetic for the medical sector, intentionally distancing itself from sterile, corporate cliches. It evokes the feeling of a high-end medical journal or a bespoke architectural monograph. 

The brand personality is authoritative yet approachable, utilizing heavy whitespace and a sophisticated serif/sans-serif pairing to communicate precision. The style is strictly flat, eschewing all shadows and depth effects in favor of structural integrity and clear typographic hierarchy. Layouts are intentionally asymmetric to create a sense of modern movement and intellectual rigor.

## Colors
The palette is rooted in organic, earthy tones that suggest longevity and stability. The foundation is the Neutral "canvas" color (#F5F2EE), which provides a softer, more sophisticated alternative to pure white for large-scale backgrounds. 

Sections must alternate between the Neutral canvas and Surface-warm (#FAF7F3) to maintain visual rhythm during the scroll. The Forest Green accent (#2D5A4E) is used sparingly for critical calls to action or to highlight specific medical advancements, while the primary black (#1A1A18) is reserved for the most important typographic elements to ensure maximum legibility and "ink-on-paper" contrast.

## Typography
Typography is the primary vehicle for the brand’s editorial voice. The system utilizes a strict casing hierarchy: 
- **lowercase:** All hero displays, buttons, and the logotype. This softens the authority of the medical field with a modern, accessible touch.
- **Sentence case:** All section headings (H2, H3) and body copy. No title case is permitted.
- **UPPERCASE:** Only used for small labels, tags, and eyebrow headers to provide a structural "anchor" to the layout.

Fraunces is used for its expressive, sharp serifs in larger sizes, while DM Sans provides a clean, utilitarian balance for functional text and data.

## Layout & Spacing
The layout relies on a 12-column fixed grid that encourages asymmetry. Content blocks should rarely be centered; instead, they should offset against each other, spanning 5, 7, or 8 columns to create a dynamic, magazine-style flow. 

Generous vertical padding (80-128px) between sections is mandatory to allow the content to breathe. Avoid dense clusters of information. Hero sections must be left-aligned or right-aligned—never centered—to maintain the editorial stance.

## Elevation & Depth
This design system is strictly flat. Visual hierarchy is achieved through scale, color blocking, and typography rather than shadows or blurs. 

- **No Shadows:** Cards, buttons, and modals are defined by their borders or background color shifts.
- **Tonal Layering:** Use Surface (#FFFFFF) for elements that need to feel "closer" to the user, such as input fields or modal overlays, against the Neutral (#F5F2EE) background.
- **Contrast Borders:** Elements can use thin, 1px borders in Secondary (#4A4A45) or Tertiary (#7A7A72) colors when clarity is needed against a similar background tone.

## Shapes
The shape language is a study in contrast: the rigid, 90-degree angles of the 12-column grid and section containers are offset by ultra-rounded, pill-shaped functional elements. 

All buttons, tags, and interactive chips must utilize a full pill radius. This creates a soft "tactile" quality for interactive zones, making them immediately distinguishable from the sharp, editorial layout of the static content.

## Components
### Buttons
Buttons are always pill-shaped and utilize lowercase text. The primary button uses the Forest Green (#2D5A4E) background with white text. Secondary buttons use a primary black (#1A1A18) outline with no fill.

### Tags & Labels
Small tags used for categorization must be in uppercase DM Sans with increased letter spacing. They should be pill-shaped with a light accent (#E8F0EE) background and Forest Green (#2D5A4E) text.

### Cards
Cards are flat containers with no shadows. They should use either a Surface (#FFFFFF) background or a simple 1px Tertiary (#7A7A72) border. Content within cards must follow the asymmetric philosophy—text may be tucked into a corner with ample internal padding (32px+).

### Inputs
Text inputs are Surface (#FFFFFF) rectangles with a 1px Primary (#1A1A18) bottom border or full pill-shape if used in a search context. Labels for inputs are always small, uppercase, and placed above the field.

### Imagery
Avoid doctor stock photos. Use architectural medical spaces, abstract macro photography of biological textures, or minimalist medical equipment photography. All imagery should feel high-art and curated.