# Design System Guide

**Inspiration source:** hims.com (men's health & wellness DTC brand)
**Aesthetic direction:** Approachable minimalism meets editorial warmth. Clean, confident, conversational. Subverts the sterile-medical look with soft pastel neutrals, lowercase typography, and a tone that reads like a knowledgeable friend rather than a clinic.
**Use this guide to:** build marketing pages, product pages, checkout flows, and content pages that feel modern, human, and trustworthy.

---

## 1. Design Principles

These come first. Every decision below should ladder back to one of these.

1. **Destigmatize through warmth.** The content is often sensitive (health, body, wellness). Design should feel safe, not clinical. Warm neutrals over cool grays. Real photography over medical stock.
2. **Lowercase is the voice.** Lowercase headlines and body set a casual, human tone. Reserve uppercase for legal or micro-labels only.
3. **Breathe.** Generous negative space beats density. Full-bleed hero sections, one idea per screen, vertical scroll rhythm.
4. **One CTA, one job.** Most views have exactly one primary action. Secondary links are subordinate and visually quieter.
5. **Editorial, not corporate.** Treat marketing pages like a magazine spread, not a product catalog. Big images, strong typography, short copy blocks.
6. **Trust through specificity.** Show real people, real text messages from providers, real ingredient names, real prices. Avoid vague stock-model polish.

---

## 2. Design Tokens

Drop these into a `tokens.css`, `theme.ts`, or Tailwind config. All values are canonical — prefer tokens over hard-coded values everywhere in the codebase.

### 2.1 Color

The palette is built on **warm neutrals** (peach, cream, sand) as dominant surfaces, **near-black** for text and primary CTAs, and **muted accents** (coral, sage, sky) for category differentiation. Avoid pure white (too clinical) and avoid saturated brand blues (reads generic healthtech).

```css
:root {
  /* Surfaces — the backbone. Most sections use one of these. */
  --color-surface-cream:      #F4EFE6;  /* default page section background */
  --color-surface-peach:      #F5D6C6;  /* hero / feature section */
  --color-surface-sand:       #E8DFD1;  /* secondary neutral */
  --color-surface-shell:      #FAF6F0;  /* lightest, for cards on cream */
  --color-surface-ink:        #1A1A1A;  /* dark sections, inverse treatment */

  /* Ink — text and primary actions */
  --color-ink-primary:        #1A1A1A;  /* body copy, headlines */
  --color-ink-secondary:      #4A4A4A;  /* subdued labels, captions */
  --color-ink-muted:          #8A8A8A;  /* disclaimers, meta */
  --color-ink-inverse:        #FAF6F0;  /* text on dark surfaces */

  /* Accents — use sparingly, one per section */
  --color-accent-coral:       #E87461;  /* hair / primary flagship */
  --color-accent-sage:        #A8B89B;  /* skin / wellness */
  --color-accent-sky:         #A8C4D4;  /* mental health / calm */
  --color-accent-terracotta:  #C97B5E;  /* sexual health / warmth */
  --color-accent-butter:      #EFCF8F;  /* oral / vitamins */

  /* Functional */
  --color-border-subtle:      #E0D9CC;  /* hairline dividers */
  --color-border-strong:      #1A1A1A;  /* button outlines, focus */
  --color-success:            #5A7A5F;
  --color-warning:            #C97B5E;
  --color-error:              #B84A3E;
}
```

**Usage rules:**
- Each page section picks ONE surface color. Don't mix surfaces within a section.
- Accents are assigned per product category and kept consistent site-wide (e.g. hair is always coral).
- Never use accent colors as large area backgrounds. They live in tags, chips, icons, illustration fills, and small UI states.
- Dark sections (`--color-surface-ink`) are for emphasis moments only: closing CTAs, testimonial rows, brand-story blocks. No more than one per landing page.

### 2.2 Typography

Primary typeface is **Sofia Pro** (used by the inspiration source). If Sofia Pro isn't licensed, the closest free fallbacks are **DM Sans** or **Manrope**. Pair with a warm serif (**Tiempos Text** or **Fraunces**) for occasional editorial accents — pull quotes, category labels, stat callouts. Never use serifs for body copy or buttons.

```css
:root {
  /* Families */
  --font-sans: "Sofia Pro", "DM Sans", -apple-system, BlinkMacSystemFont, sans-serif;
  --font-serif: "Tiempos Text", "Fraunces", Georgia, serif;

  /* Scale — fluid, clamp-based for responsive hero treatment */
  --text-xs:    0.75rem;   /* 12px — legal, meta */
  --text-sm:    0.875rem;  /* 14px — captions */
  --text-base:  1rem;      /* 16px — body */
  --text-lg:    1.125rem;  /* 18px — lead paragraph */
  --text-xl:    1.375rem;  /* 22px — subheads */
  --text-2xl:   1.75rem;   /* 28px — section headings */
  --text-3xl:   clamp(2rem, 4vw, 2.75rem);     /* 32-44px — page H1 */
  --text-4xl:   clamp(2.75rem, 6vw, 4rem);     /* 44-64px — hero H1 */
  --text-5xl:   clamp(3.5rem, 8vw, 5.5rem);    /* 56-88px — display */

  /* Weight */
  --weight-regular:  400;
  --weight-medium:   500;
  --weight-semibold: 600;
  --weight-bold:     700;

  /* Line height */
  --leading-tight:   1.05;  /* display headlines */
  --leading-snug:    1.2;   /* section headings */
  --leading-normal:  1.5;   /* body */
  --leading-relaxed: 1.65;  /* long-form reading */

  /* Letter spacing */
  --tracking-tight:  -0.02em;  /* large display type */
  --tracking-normal: 0;
  --tracking-wide:   0.08em;   /* small caps, micro-labels */
}
```

**Type rules:**
- **All headlines render lowercase.** This is the single most distinctive signature of the aesthetic. Use `text-transform: lowercase` at the CSS level so content editors don't have to fight it.
- **No em dashes in copy.** Use commas, periods, parentheses, or rewrite. (This is a hard rule across the system.)
- Display sizes (`--text-4xl`, `--text-5xl`) always use `--tracking-tight` and `--leading-tight`.
- Body uses `--text-base` / `--leading-normal` / `--weight-regular`. Keep line length between 55-75 characters.
- Micro-labels (category tags, nav, "shop all" links) use `--text-xs`, `--weight-medium`, `--tracking-wide`, and are the *only* place where UPPERCASE is acceptable.

### 2.3 Spacing

Based on a **4px grid**. Stick to the scale; don't introduce off-grid values.

```css
:root {
  --space-1:  0.25rem;  /* 4px  — icon-to-label */
  --space-2:  0.5rem;   /* 8px  — tight internal padding */
  --space-3:  0.75rem;  /* 12px */
  --space-4:  1rem;     /* 16px — default card padding */
  --space-5:  1.5rem;   /* 24px — card padding, list gaps */
  --space-6:  2rem;     /* 32px — section-internal spacing */
  --space-7:  3rem;     /* 48px — subsection breaks */
  --space-8:  4rem;     /* 64px — section breaks (mobile) */
  --space-9:  6rem;     /* 96px — section breaks (desktop) */
  --space-10: 8rem;     /* 128px — hero vertical padding */
  --space-11: 12rem;    /* 192px — dramatic separation */
}
```

**Rhythm rules:**
- Section vertical padding: `--space-8` on mobile, `--space-9` on desktop minimum. Lean generous.
- Content max-width: 1280px. Text column max-width: 640px (editorial reads, not full-width paragraphs).
- Card internal padding: `--space-5`. Card-to-card gap: `--space-5` mobile, `--space-6` desktop.

### 2.4 Radius & Borders

```css
:root {
  --radius-sm:   4px;    /* inputs, small chips */
  --radius-md:   8px;    /* cards */
  --radius-lg:   16px;   /* feature cards, modals */
  --radius-xl:   24px;   /* hero images, large media */
  --radius-pill: 999px;  /* buttons, tags */

  --border-hairline: 1px solid var(--color-border-subtle);
  --border-strong:   1.5px solid var(--color-border-strong);
}
```

**Radius rules:**
- Buttons are **always `--radius-pill`**. This is a signature element. No square or lightly-rounded buttons anywhere in the system.
- Images and media assets use `--radius-lg` or `--radius-xl`.
- Inputs and form controls use `--radius-sm`.

### 2.5 Shadow & Elevation

Shadows are restrained. The aesthetic leans flat with color-block separation, not drop-shadow depth.

```css
:root {
  --shadow-sm: 0 1px 2px rgba(26, 26, 26, 0.04);
  --shadow-md: 0 4px 12px rgba(26, 26, 26, 0.06);
  --shadow-lg: 0 12px 32px rgba(26, 26, 26, 0.08);
  /* Use shadow-lg only for modals, popovers, floating CTAs. */
}
```

### 2.6 Motion

```css
:root {
  --ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-entrance: cubic-bezier(0, 0, 0.2, 1);
  --ease-exit:     cubic-bezier(0.4, 0, 1, 1);

  --duration-fast:    150ms;  /* hover states */
  --duration-base:    250ms;  /* standard transitions */
  --duration-slow:    400ms;  /* reveals, drawers */
  --duration-dramatic: 800ms; /* hero image loads */
}
```

**Motion rules:**
- Hover states: 150ms, opacity or subtle scale (1.02 max) or background color shift.
- Button press: scale down to 0.98 on active.
- Section entrance: fade + translateY 16px, triggered on scroll with IntersectionObserver, staggered 80ms between children.
- Respect `prefers-reduced-motion: reduce` and disable all non-essential animation.

---

## 3. Components

### 3.1 Buttons

Three tiers. Shape is always pill.

**Primary** — dark button on light backgrounds. The single highest-importance action per view.
```
background: var(--color-ink-primary)
color:      var(--color-ink-inverse)
padding:    14px 32px
font:       var(--weight-medium), --text-base
radius:     var(--radius-pill)
hover:      background lightens 8%, no scale
```

**Secondary** — outlined. Paired with primary for dual-action moments (e.g. "shop now" + "learn more").
```
background: transparent
color:      var(--color-ink-primary)
border:     1.5px solid var(--color-ink-primary)
padding:    12.5px 30.5px (to match primary outer dimensions)
hover:      background var(--color-ink-primary), color var(--color-ink-inverse)
```

**Tertiary / Text Link** — inline within copy. Underlined, no pill.
```
color:           var(--color-ink-primary)
text-decoration: underline
text-underline-offset: 3px
hover:           text-decoration-thickness: 2px
```

**Button copy rules:** lowercase, 1-3 words max, action verb first. Good: "get started", "shop all", "take the quiz". Bad: "Click Here To Learn More About Our Products".

### 3.2 Navigation Header

Fixed top, transparent over hero, becomes solid on scroll.

- Left: wordmark (lowercase, `--weight-bold`, `--text-xl`).
- Center: 4-6 category links, `--text-sm`, `--weight-medium`, UPPERCASE with `--tracking-wide`. Underline on hover.
- Right: "account" link + primary pill button ("get started" or "shop").
- Mobile: hamburger → full-screen drawer with lowercase link stack, `--text-2xl` tap targets, drawer background `--color-surface-cream`.

### 3.3 Hero Section

The signature moment. One per page.

- Full-bleed, min-height 90vh on desktop.
- Split layout: 55% image, 45% text (or inverse). On mobile, stack image above text.
- Background: one solid surface color (`--color-surface-peach` is the default hero color).
- Headline: `--text-4xl` or `--text-5xl`, lowercase, `--leading-tight`, max 6-8 words.
- Sub-copy: `--text-lg`, 1-2 sentences, max 140 characters.
- Primary CTA below sub-copy.
- Image: real photography of a person (not abstract illustration), `--radius-xl`, may bleed to viewport edge on one side.

### 3.4 Product Card

- Background: `--color-surface-shell` or a soft accent tint.
- Radius: `--radius-lg`.
- Image occupies top 60% of card, `--radius-md` on image corners, object-fit cover.
- Text block: product name (`--text-lg`, `--weight-medium`, lowercase), one-line descriptor (`--text-sm`, `--color-ink-secondary`), price (`--text-base`, `--weight-semibold`).
- Hover: image scales to 1.03 over 250ms; card does not scale.
- No explicit "buy" button on card — the entire card is a link to the PDP.

### 3.5 Category / Feature Block

Used to segment the home page by category (hair, skin, etc.).

- Alternating left/right image placement down the page (zigzag rhythm).
- Each block uses that category's accent color as a small tag chip ("hair") above the headline.
- Headline: `--text-3xl`, lowercase.
- Body: one short paragraph, `--text-lg`.
- CTA: secondary button.

### 3.6 Testimonial / Social Proof

- Background: `--color-surface-ink`, text in `--color-ink-inverse`.
- Pull quote: `--font-serif`, `--text-3xl`, italic, lowercase.
- Attribution: `--text-sm`, UPPERCASE, `--tracking-wide`.
- Optional: small circular headshot, 48px, to the left of attribution.

### 3.7 Form Fields

- Input background: `--color-surface-shell`.
- Border: `--border-hairline` default, `--border-strong` on focus.
- Radius: `--radius-sm`.
- Label: above the field, `--text-sm`, `--weight-medium`, `--color-ink-primary`. Not a floating label.
- Helper/error text: below field, `--text-xs`. Error state shifts border and helper to `--color-error`.
- Height: 48px minimum (touch target).

### 3.8 Quiz / Intake Flow

A defining pattern for this category. Multi-step form that gates product access.

- One question per screen. No multi-question forms.
- Progress bar pinned to top, `--color-accent-coral` fill on `--color-border-subtle` track.
- Question headline: `--text-2xl`, lowercase, centered.
- Answer options: large pill-shaped buttons, full-width on mobile, 2-column grid on desktop, each minimum 56px tall.
- Selected state: background `--color-ink-primary`, text inverse.
- "Back" link bottom-left, "next" primary button bottom-right.

### 3.9 Footer

- Background: `--color-surface-cream` or `--color-surface-ink`.
- 4 columns on desktop: company, products, support, legal.
- Column headers: `--text-xs`, UPPERCASE, `--tracking-wide`, `--weight-semibold`.
- Links: `--text-sm`, lowercase, `--weight-regular`, opacity 0.7, full opacity on hover.
- Bottom row: wordmark left, legal disclaimers + social icons right.

---

## 4. Layout Patterns

### 4.1 Page Anatomy (Marketing Landing)

```
[ Nav — transparent ]
[ Hero — full-bleed, peach surface ]
[ Value props — 3 column, cream surface ]
[ Category feature 1 — image left, text right, shell surface, coral accent ]
[ Category feature 2 — image right, text left, sand surface, sage accent ]
[ Category feature 3 — image left, text right, shell surface, sky accent ]
[ Testimonial wall — ink surface, serif quotes ]
[ How it works — 3 or 4 numbered steps, cream surface ]
[ FAQ — accordion, shell surface ]
[ Closing CTA — ink surface, single centered headline + primary button ]
[ Footer ]
```

Vertical rhythm alternates surfaces so no two adjacent sections share a background color.

### 4.2 Grid

- 12-column, 24px gutter on desktop.
- Max content width: 1280px, centered, 24px side padding.
- Mobile: single column, 20px side padding, 16px gutter.
- Breakpoints: 640 / 768 / 1024 / 1280 / 1536 (standard Tailwind).

### 4.3 Asymmetry

Avoid perfect center alignment on marketing pages. Prefer:
- Hero text left-aligned with image off to the right, cropped by viewport edge.
- Feature sections where the image column is slightly wider than the text column (e.g. 7-col image, 5-col text).
- Occasional diagonal or organic blob shapes in backgrounds for texture, using SVG at low opacity.

---

## 5. Content & Voice

Design decisions that affect writers and content editors.

### 5.1 Voice Attributes

- **Conversational.** Write how you talk. Run-on sentences and short fragments both welcome.
- **Direct.** No euphemisms for sensitive topics. If it's about hair loss, say hair loss.
- **Warm, not corporate.** "we" not "the company". "you" often. Never "the consumer" or "the user".
- **Lightly witty.** A single clever aside per page. Not a Reddit thread.
- **Specific.** Name the ingredient, the dosage, the provider, the timeline.

### 5.2 Copy Length Guidelines

- Hero headline: 4-8 words.
- Hero subhead: 1-2 sentences, under 140 characters total.
- Section headline: 3-7 words.
- Body paragraph: 2-4 sentences. Break long content into multiple paragraphs.
- CTA: 2-3 words.
- Product descriptor on card: under 8 words.

### 5.3 Capitalization Rules

- **Lowercase by default:** all headlines, subheads, body, button labels, nav items (except uppercase micro-labels), product names, category names.
- **Uppercase allowed only for:** footer column headers, category nav, legal disclaimers, "SHOP ALL" style micro-CTAs, testimonial attribution lines.
- **Proper nouns:** brand names, people's names, medication brand names stay capitalized per standard English.

### 5.4 Punctuation Rules

- **No em dashes.** Use commas, periods, or parentheses instead. Rewrite if necessary.
- Oxford commas: yes.
- Exclamation points: maximum one per page, reserved for genuine enthusiasm, never in CTAs.
- Ellipses only in testimonial quotes where content is truncated.

---

## 6. Accessibility Requirements

Non-negotiable. These are table stakes, not aspirations.

- **Contrast:** All text meets WCAG AA (4.5:1 for body, 3:1 for large text 18pt+). The near-black + cream combo easily clears this; verify any accent-on-accent pairings.
- **Focus states:** visible 2px outline in `--color-border-strong` with 2px offset on all interactive elements. Never remove outline without a replacement.
- **Touch targets:** 44x44px minimum.
- **Semantic HTML:** use `<button>` for actions, `<a>` for navigation, proper heading hierarchy (one `<h1>` per page, no skipped levels).
- **Alt text:** every meaningful image. Decorative images get `alt=""`.
- **Form labels:** always visible, never placeholder-only.
- **Motion:** respect `prefers-reduced-motion`.
- **Lowercase CSS transform does NOT translate to screen readers.** Write content in proper sentence case in HTML and apply `text-transform: lowercase` via CSS. Screen readers will still announce it correctly.

---

## 7. Implementation Notes for Claude Code

When building from this guide:

1. **Set up tokens first.** Before any component, create `tokens.css` (or extend `tailwind.config.js`) with every variable in section 2. All downstream code references tokens, never raw values.
2. **Start with the hero.** It sets the tone for the rest of the page. Get the hero right before moving on.
3. **Build the button component early.** It appears everywhere and is easy to drift. Lock it down as the first component.
4. **Default to less.** When in doubt, remove an element. The aesthetic leans minimal.
5. **Use real placeholder content.** "Lorem ipsum" will produce layouts that feel wrong because real copy on this site is short and specific. Write actual placeholder copy in the brand voice.
6. **Images matter more than usual.** If final photography isn't available, use `--color-surface-peach` or `--color-surface-sand` colored rectangles with `--radius-xl` as placeholders rather than stock gradients or geometric patterns. The image slot presence is more important than filling it with something generic.
7. **No em dashes anywhere in generated copy.** This is a locked rule.

---

## 8. Anti-Patterns (Do Not Do)

- Blue-gradient healthtech hero (reads as every other telehealth startup).
- Pure white backgrounds as default.
- Title Case or ALL CAPS headlines.
- Serif body copy.
- Rounded-rectangle buttons instead of pills.
- Drop shadows on everything.
- Stock photography of doctors in white coats.
- Icons inside circles inside squares (over-nested containers).
- Centered-everything layouts.
- Three-CTA hero sections with competing actions.
- Em dashes in any copy.
- Emoji in CTAs or headlines (occasional inline body emoji is fine if it earns its place).
