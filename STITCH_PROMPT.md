# Google Stitch Prompt — MBS Medical (mbsdoc.com)

> Paste the contents of this file into Google Stitch as the project brief.
> Stitch performs best when you feed it the brand identity, exact visual
> tokens, page-by-page anatomy, and explicit anti-patterns in one shot.
> When you want a specific page mocked, copy the brief plus that page's
> section into the Stitch input.

---

## 1. Project overview

Build a marketing website for **MBS Medical** at mbsdoc.com — a veteran-owned, cash-pay telehealth medical practice serving the entire state of Florida.

**Stack:** Astro 4 (static site), pure CSS with custom properties (no Tailwind, no component framework), Cloudflare Pages deployment.

**Audience:** adults 30–65 in Florida who are tired of conventional primary care — long waits, 8-minute visits, insurance friction. They are health-literate, willing to pay cash, and want a real relationship with one provider who knows them. Many are men exploring TRT, women navigating perimenopause, and couples seeking longevity care.

**Goal of the site:**
- Build immediate trust and signal clinical credibility without feeling sterile or corporate.
- Funnel patients to (a) booking a visit at practicebetter.io, (b) submitting a contact-form question, and (c) buying provider-curated supplements through Fullscript.
- Reduce friction by being conversational, specific, and honest.

**Target feel:** the page a patient opens and immediately trusts. Editorial wellness brand × serious medical credential. Inspired by hims.com (warm neutral palette, lowercase confidence, pill shapes, asymmetric layouts) but more grounded and physician-led, less consumer-pop.

---

## 2. Brand voice

- **Conversational.** Write how you talk. Run-on sentences and short fragments both welcome.
- **Direct.** No euphemisms for sensitive topics. If it's about hair loss, say hair loss.
- **Warm, not corporate.** "we" not "the company". "you" often. Never "the consumer" or "the user".
- **Lightly witty.** A single clever aside per page. Not a Reddit thread.
- **Specific.** Name the ingredient, the dosage, the provider, the timeline.

Hard rules:
- **No em dashes anywhere.** Use commas, periods, or parentheses.
- **No emoji** in any UI element.
- **No staged stock photography** (no smiling-doctor, no handshaking-physician, no white-coat-with-stethoscope).

---

## 3. Color palette

The palette is built on warm neutrals with a single decisive accent. The single accent is the only expressive color allowed. Never blue.

| Token | Hex | Usage |
|---|---|---|
| `--color-primary` | `#1A1A18` | Warm near-black. All primary text, headings, primary CTA bg. NOT pure black. |
| `--color-secondary` | `#4A4A45` | Body copy on light surfaces. |
| `--color-tertiary` | `#7A7A72` | Muted text, captions, disabled state. |
| `--color-neutral` | `#F5F2EE` | **Page canvas.** Warm off-white. NEVER use pure white as the page background. |
| `--color-surface` | `#FFFFFF` | Pure white. Reserve for inputs and modals only. |
| `--color-surface-warm` | `#FAF7F3` | Card bg + alternating section bg. |
| `--color-accent` | `#2D5A4E` | **Forest green.** The brand's only expressive color. Primary patient-action CTAs, active states, link/icon accents. |
| `--color-accent-hover` | `#244A40` | Hover state for accent buttons. |
| `--color-accent-light` | `#E8F0EE` | Tag/badge/chip background. |
| `--color-accent-muted` | `#8BAF9F` | Subtle section tinting. |
| `--color-border` | `#E2DDD8` | Default divider, card border (1px). |
| `--color-border-strong` | `#C8C2BA` | Hover border, input border (1.5px). |

**Usage rules:**
- Section backgrounds **alternate** between `--color-neutral` and `--color-surface-warm`. Never two adjacent sections on the same surface.
- Accent green is the only saturated color. Keep it sparse: CTA, hover state, eyebrow text on chips, tag backgrounds (as `--color-accent-light`), and as a subtle border-left on cards.
- Dark sections (testimonial walls, closing CTA, footer) use `--color-primary` as bg with `--color-neutral` text.

---

## 4. Typography

Two fonts. Both from Google Fonts. No exceptions, no system fallbacks for display type.

- **Fraunces** — display + all heading levels (h1–h3). Weight 300 for display & h1 (the lightness creates elegance — do not bump to 400 to compensate). Weight 400 for h2 and h3. Use the optical-size axis; let Fraunces feel handcrafted.
- **DM Sans** — body, labels, nav, buttons, captions. Weight 400 for body, 500 for labels and buttons. Never use DM Sans at display sizes.

| Style | Family | Size | Weight | Line-height | Tracking |
|---|---|---|---|---|---|
| Display | Fraunces | 56px | 300 | 1.05 | -0.02em |
| H1 | Fraunces | 42px | 300 | 1.1 | -0.02em |
| H2 | Fraunces | 30px | 400 | 1.2 | -0.01em |
| H3 | DM Sans | 18px | 500 | 1.3 | 0 |
| Body lg | DM Sans | 18px | 400 | 1.7 | 0 |
| Body md | DM Sans | 16px | 400 | 1.6 | 0 |
| Body sm | DM Sans | 14px | 400 | 1.5 | 0 |
| Label | DM Sans | 12px | 500 | 1 | 0.08em (uppercase) |

**Casing rules (these are the trick):**
- Hero displays + button text + the wordmark/logotype set in **lowercase**. This is the signature confidence move from hims.com. Do not override.
- All other headings (section h2, card h3, FAQ questions, step titles) are written in **sentence case** — first letter capitalized, proper nouns capitalized. Do not write "what we cover"; write "What we cover."
- The label class (12px DM Sans 500) is the **only** place uppercase is allowed.
- **No `text-transform: uppercase` on any heading h1–h3.** Only on `.label` and tag/chip text.
- **No title case** anywhere ("All Of Our Services" → wrong; "All of our services" → right).

---

## 5. Layout system

- **Max width:** 1200px, centered, 24px horizontal padding on mobile (16px gutter), 32–48px on desktop.
- **12-column CSS Grid** on desktop; single column on mobile.
- **Section padding:** minimum 80px top/bottom. Use 96–128px for hero and the closing CTA. Lean generous.
- **Alternate** `--color-neutral` and `--color-surface-warm` between adjacent sections so you never need a divider line.

**Editorial asymmetry is the governing principle.**
- Hero: text block on one side (5–7 cols), image/video on the other (5–7 cols), with the visual element bleeding slightly to the viewport edge. **No full-width centered hero with centered headline + centered subhead + centered CTA.** That is explicitly forbidden.
- Long-form sections use a 7-col text block with a pull-quote or large stat in the remaining 5 cols. Never centered narrow body text.
- Inline image-text pairs that break the grid slightly are encouraged.

**Do not generate:**
- Full-width centered hero (headline + subtext + CTA all centered)
- Three- or four-column icon-grid feature sections (icon + heading + paragraph triplets)
- Testimonial carousels or sliders of any kind
- Footer with three-column link lists and a social icon row
- Accordion-heavy FAQ layouts (one accordion is fine; ten in a row is not)

**Use instead:**
- Pull quotes in the margin alongside body copy
- Large typographic stats (Fraunces 56px numerals)
- Asymmetric editorial flow with a sticky meta column on long-form sections
- Single-column long-form for narrative content

---

## 6. Elevation & motion

**Flat.** Hierarchy is achieved through:
- Background tonal shifts between neutral and surface-warm
- 1px borders on cards and inputs (`--color-border`)
- The accent green creating contrast against warm neutrals
- Scale: cards rise 3px on hover (`transform: translateY(-3px)`), no shadow added

**No box-shadows on content cards.** Reserve shadows for modal overlays only: `0 8px 40px rgba(26,26,24,0.10)`.

**Motion is restrained.**
- Page load: hero content fades up. `opacity 0→1`, `transform: translateY(12px) → 0`, 500ms ease-out, siblings staggered 80ms apart.
- Scroll reveals: IntersectionObserver, threshold 0.15, same fade-up pattern.
- Card hover: `translateY(-3px)` over 200ms ease.
- Nav link hover: underline grows left-to-right via `::after scaleX`.
- Button hover: bg lightens or darkens 8%, **no scale on buttons**.
- Never: bounce, spring, 3D perspective, auto-playing carousels.

The site has one auto-playing flag video in the homepage hero. It pauses after 10 seconds. Otherwise: nothing autoplays.

---

## 7. Components

### Navigation (sticky header)
- Fixed top, 68px tall, `--color-primary` (warm near-black) background with 14px backdrop blur, 1px bottom border at 8% inverse on scroll.
- Layout: logo left, 4–5 nav links center, pill CTA right.
- Logo: full-color MBS Medical caduceus mark on a soft off-white pill (the colored letters need contrast against the dark bar).
- Nav links: 12px DM Sans 500, uppercase, 0.08em tracking, color `rgba(neutral, 0.72)`, hover `--color-neutral` with terracotta-replaced-with-accent underline.
- "Services" is a hover-mega-menu dropdown — 4 columns of category sub-links.
- Mobile: hamburger opens a full-screen overlay (NOT a slide-out drawer). Lowercase link stack at 24px, drawer bg `--color-neutral`.

### Buttons (pill only)
All buttons `border-radius: 999px`. No exceptions.
- **Primary:** `--color-primary` bg, white text, 14px 28px padding, DM Sans 500 15px lowercase. Hover bg `#2D2D2A`.
- **Accent:** `--color-accent` (forest green) bg, white text. Reserve for patient-action CTAs ("book a visit", "request appointment", "contact us"). Hover `--color-accent-hover`.
- **Secondary:** transparent bg, 1.5px solid `--color-primary` border, primary text. Hover bg lightens to neutral.
- **Inverse:** for use on dark surfaces. White bg, dark text.
- **Outline-inverse:** transparent on dark, neutral border, neutral text. Hover inverts.
- Button copy: lowercase, 1–3 words max, action verb first. ("get started", "shop all", "take the quiz".)

### Cards
- Background `--color-surface-warm` (`#FAF7F3`)
- Border `1px solid --color-border`
- Border-radius 16px
- Padding 32px (or 2.25rem 2rem for compact)
- No shadow at rest
- Hover: `translateY(-3px)`, border darkens to `--color-border-strong`

### Tags / Badges (pills)
- Pill shape (`border-radius: 999px`)
- Bg `--color-accent-light` (`#E8F0EE`), text `--color-accent` (`#2D5A4E`)
- 12px DM Sans 500, 0.06em tracking, uppercase
- Use for: category eyebrow on a section, treatment specialty labels, status indicators

### Eyebrow label (above section headings)
- Same look as a tag but used inline above an h2. The class is `.accent-chip` in code. 12px uppercase DM Sans 500 in the accent-light pill.

### Form inputs
- Bg `#FFFFFF`, border `1.5px solid --color-border-strong`, radius 8px, padding 12px 16px
- Focus: border → `--color-accent`, no glow, no box-shadow
- Labels: 13px DM Sans 500, `--color-secondary`, above the input (never floating)
- Error state: border + helper text → `#B84A3E`

### Footer (editorial 2-column, NOT three-column links)
- Bg `--color-primary`, text `--color-neutral`
- Left column (1.6fr): full-color logo on a soft off-white pill, Fraunces 300 tagline (1.25rem, max-width 36ch), forest-green accent CTA "book a visit"
- Right column (1fr): single curated nav (Services / About / Patient tools / Supplements ↗ external / Contact) — DM Sans 16px, 0.875rem gap
- Bottom row: copyright legal line at 12px, ~45% opacity

### Modal (e.g. team bio modal)
- Backdrop `rgba(26,26,24,0.65)` with 4px blur, fades in
- Dialog `--color-neutral` bg, 24px radius, 2.5rem padding, max-width 720px, center-vertically with margin-top 4rem
- One floating round close button top-right, 40×40px on `--color-surface-warm`
- Header row: 160px square photo + name/role/credentials block
- Body: serial paragraphs of bio
- Optional inline link (e.g. external research center): Fraunces italic, accent-green color, hairline underline, small outward arrow icon that slides on hover
- Footer row: tag chips inline middot-separated, no pills

---

## 8. Page anatomy

The site has 16 pages plus a hidden review tool. Build them in this order.

### 8.1 Home (`/`)
1. **Hero** — full-bleed 100vh background video of an American flag waving (this is the veteran-owned signal). Right-side scrim darkens the right portion only. Text panel anchored to the **right**, no frame, copy floats free over the dark side of the video. Copy: tiny pale-mint Fraunces italic eyebrow ("veteran-owned · florida telehealth"), lowercase Fraunces display title (4–7 words, e.g. "healthcare that treats the whole person"), neutral body subhead (1–2 sentences), two CTAs — accent-green "book a visit" + glass-outline "explore services". Flag video pauses at 10 seconds and the scrim deepens slightly.
2. **Value props** — `--color-neutral` surface. Eyebrow "why mbs medical", h2 "Care built differently", three flat cards in a 3-col grid (mobile single col). Each card: small colored accent bar (4px tall, 48px wide, accent-green), h3 sentence-case ("Whole-person care", "No insurance needed", "Telehealth, statewide"), small body paragraph.
3. **Feature zigzag** — three feature rows alternating `--color-surface-warm` and `--color-neutral`. Each row: image one side, text the other (alternate flip), eyebrow tag chip, h2 sentence-case, paragraph, primary + secondary CTA.
   - Row 1: Medical weight loss (image: GLP-1 pen). Tag: "medical weight loss". Title: "Finally, a weight loss plan that sticks."
   - Row 2: Men's health (image: man jogging at sunrise). Flipped. Title: "Get your edge back."
   - Row 3: Mental health (image: peaceful bedroom morning). Title: "Sleep, anxiety, and what's keeping you stuck."
4. **Stats row** — `--color-primary` ink surface. h2 "Numbers that mean something", four large stats: "64+ years combined experience", "11 specialties offered", "FL statewide telehealth", "12 years U.S. Army founder". Numbers in Fraunces 56px on neutral text.
5. **Testimonials** — same ink surface, eyebrow "patient stories", h2 "What our patients are saying", three flat ink cards (transparent border at 8% inverse). Quote in Fraunces italic 22px lowercase, attribution in 12px uppercase 0.08em tracking.
6. **How it works** — `--color-neutral`. Three steps (Book online → Meet your provider → Get your plan). Each step card: faint Fraunces 56px serial number in the top-right corner of the card, h3 sentence-case, short body paragraph.
7. **FAQ** — `--color-surface-warm`. Sticky meta column on left (eyebrow, h2 "Things people usually ask", contact link), accordion list on right with 5 questions/answers. Click toggles a `+` icon that rotates 45° on open.
8. **Closing CTA** — full-bleed `--color-primary`. Centered (this is the one place centered is allowed), large display "The care you've always deserved", subhead, accent-green button + outline-inverse "ask a question".
9. **Footer.**

### 8.2 About (`/about/`)
1. **Hero** — `--color-surface-warm` hero peach radial wash. Eyebrow "about mbs medical", h1 "Mind, body, and spirit", subhead, get-in-touch button. Right-side hero image (cinematic team portrait or quiet practice space). Asymmetric split.
2. **Philosophy** — `--color-neutral`, eyebrow "our approach", h2 "Healthcare built on trust, not transactions", three flat cards each with small accent-bar + h3 + paragraph (Veteran values / Continuity of care / Evolving care plans).
3. **Founders row** — two large 150px **circular** avatar buttons centered (David Hervig PA-C + Alex Anderson). Each button: round photo + name + role + credentials line below. Click opens a modal with the full bio.
4. **Team row** — three 120px circular avatar buttons (Julie Vera Rivas + Dr. Eric Folkens MD + Dr. Mark Dawson MD). Same modal pattern. Folkens's modal has a single inline external link to Bradenton Research Center (Fraunces italic, accent-green, hairline underline, outward arrow). No other team member has a link.
5. **Closing CTA** — ink surface, "Ready to meet your provider?".
6. **Footer.**

### 8.3 Services hub (`/services/`)
1. **Hero** — `--color-neutral` (wide pale sand wash). Centered (this hub page is allowed to be centered because it's a directory). Eyebrow "what we treat", h1 "All of our services", subhead.
2. **Four category sections** alternating `--color-neutral` and `--color-surface-warm`. Each category:
   - Category header: tag chip (accent-light pill), h2 sentence-case category label, paragraph descriptor.
   - 2–4 service sub-cards in a 3-col grid. Each sub-card is a horizontal row: 3px accent-green left border, body title + tagline, round 36px accent-green arrow circle on the right that translates 4px on hover. Compact, clean.
3. Categories:
   - Primary care & prevention (Primary Care, Lab Testing, Lifestyle Medicine)
   - Weight & performance (Weight Loss, Longevity & Performance)
   - Hormone & wellness (Men's Health, Women's Health, Sexual Health, Hair & Dermatology)
   - Specialty & premium (Mental Health, Concierge Medicine)
4. **Closing CTA** — ink surface, "Not sure where to start?", forest-green free-consultation CTA.
5. **Footer.**

### 8.4 Contact (`/contact/`)
1. **Hero** — `--color-surface-warm` shell with a peach radial wash. Eyebrow "get in touch", h1 "Let's talk about your health", subhead.
2. **Contact layout** — two columns. Left (sticky on desktop): three flat info cards stacked: "Book a visit" with accent-green CTA, "Response time" copy, dark "All of Florida" service-area card. Right: a contact form on `--color-surface-warm` with first/last name in a 2-col row, email, phone (optional), service-of-interest select, message textarea, full-width primary button. Disclaimer below: "This form is not for medical emergencies. If you are experiencing a medical emergency, call 911."
3. **Footer.**

### 8.5 Patient tools (`/tools/`)
1. **Hero** — `--color-neutral` cream with a butter radial wash. Eyebrow "patient resources", h1 "Tools and resources", subhead.
2. **Tools grid** — six flat cards in a 2-col / 3-col grid. Featured "Book an appointment" card uses peach-tinted surface (visually different). Other five: Patient portal, Join a video visit, Message us, Our services, Meet your providers. Each card: tag chip + h2 sentence-case + body + secondary button.
3. **Quick info grid** — `--color-surface-warm`, four short blocks (Hours / Payment / Prescriptions / Labs).
4. **Footer.**

### 8.6 Service page template (used for 11 pages)
Used by: weight-loss, primary-care, mens-health, mental-health, womens-health, longevity, sexual-health, hair-dermatology, labs, lifestyle-medicine, concierge-medicine.

1. **Hero** — varied surface per page (each page picks its own tinted surface so the user feels they've moved): peach, sand, sky-tinted shell, butter-tinted, sage-tinted, etc. Asymmetric: text left, image right (or flipped). Eyebrow tag chip ("medical weight loss", "ongoing care", etc.), lowercase Fraunces 56px display title, body subhead, accent-green primary CTA + secondary CTA.
2. **Three core values** — flat cards, accent-bar + h3 + paragraph each (e.g. for weight-loss: "GLP-1 weight loss programs", "Physician-guided plans", "Metabolic optimization").
3. **Two or three feature rows** — zigzag, alternating surface colors. Each row: image one side, text the other, tag chip, h2 sentence-case, short paragraph, primary CTA. Each row has a different accent tag color BUT all ultimately resolve to forest green (legacy multi-accent classes are aliased to a single accent now — the visual effect should be a single accent green throughout).
4. **Sub-services** — `--color-surface-warm` collapsible. Closed by default. Click reveals a 1/2/3-column hairline-divider list of conditions/treatments covered (e.g. "Insulin Resistance", "Type 2 Diabetes Support", "Semaglutide", etc.). The summary row is a chip + h2 + a circular `+` toggle that rotates 45° when open. No background pills inside the list — just typography.
5. **Testimonials** — `--color-primary` ink, three flat ink cards, Fraunces italic quotes lowercase, uppercase attribution.
6. **How it works** — `--color-neutral`, three steps with serial-number cards.
7. **FAQ** — `--color-surface-warm`, sticky meta column + accordion list.
8. **Closing CTA** — ink, "Ready to get started?", accent-green book + outline-inverse ask.
9. **Footer.**

### 8.7 Hidden review tool (`/review-9f3kx.html`)
Pre-launch QA tool, Firebase-backed, 3px brand strip removed (no longer present), dark ink header with Fraunces italic page title, sidebar of pages grouped by category, main panel per-page review form. Out of scope for marketing redesign but matches the same warm-neutral / accent-green palette internally.

---

## 9. Imagery direction

- **Real photography only.** No AI-generated medical staff. AI-generated lifestyle/customer imagery is acceptable; medication product shots and lab equipment are acceptable.
- **Sourced from Pixabay** (royalty-free, commercial-use license).
- **Tone:** customer/lifestyle (people in their daily lives), medication product shots (GLP-1 pens, pill bottles, syringes), lab equipment (test tubes, pipettes), peaceful interior shots (bedrooms, kitchens, home offices), nature/outdoor shots (running trails, hiking).
- **Never:** doctors in white coats, nurses with stethoscopes, staged hospital scenes, handshaking-in-suits, fake exam-room photos.
- **Format:** 1600px wide max, progressive JPEG quality 78, mozjpeg encoded. Hero images use 4:5 aspect ratio (or 16:9 on mobile). Feature row images use 4:3.

---

## 10. Anti-patterns (explicit blocks)

Stitch must never produce these for this brand:

- `font-family: Inter`, `system-ui`, `Roboto`, or any sans other than DM Sans
- Any serif other than Fraunces
- Blue (`#0066CC`, `#2563EB`, or any blue) as an action or accent color
- `background: linear-gradient(...)` on hero sections or section backgrounds (gradients fine on subtle radial accents only)
- `border-radius: 8px` or `border-radius: 12px` on buttons (pill only)
- `box-shadow: 0 4px 6px rgba(0,0,0,0.1)` content-card shadows
- Three- or four-column icon grids
- Testimonial carousels or auto-rotating sliders
- `text-transform: uppercase` on h1/h2/h3
- Title Case headlines
- Centered hero with centered CTA below centered subhead
- Emoji in any UI element
- Stock photography of doctors, nurses, white coats, scrubs, stethoscopes
- Auto-playing video other than the home hero flag
- `<marquee>`, ticker scrollers, parallax-heavy hero sections
- Footer with three columns of links + a social icon row

---

## 11. What I want from Stitch

When given this brief, generate:

1. **A complete homepage mockup** following the page anatomy in section 8.1.
2. **A service-page template** following section 8.6, parameterized so it can be reskinned per service via different hero surface tints + different imagery.
3. **The about page** with the founders + team modal pattern in section 8.2.
4. **The mega-menu** dropdown for the header per section 7.
5. **The footer** per section 7 (editorial 2-col, NOT three-col link lists).
6. **Mobile breakpoints** for everything: hamburger overlay (full-screen, not drawer), single-column stacks, hero text panel above the visual element.
7. **Component library page** showing buttons (5 variants), cards, tags, eyebrows, inputs, FAQ accordions, and the team avatar modal.

If you make a stylistic decision that conflicts with this brief (e.g. you want to add a third color, switch to a sans-serif headline, or center a hero), flag it and propose an on-brand alternative instead of overriding the brief silently.

---

## 12. Reference

Live site: **mbsdoc.com** — feel free to inspect for current layout patterns.
GitHub source: **github.com/shizzoobies/mbsmedical** (branch: `main`).
Repo paths worth checking:
- `src/styles/global.css` — token implementation
- `src/layouts/Layout.astro` — page shell
- `src/components/Header.astro` — nav with mega-menu
- `src/components/Footer.astro` — editorial 2-col footer
- `src/components/ServicePage.astro` — service-page template
- `src/pages/index.astro` — homepage with full-bleed flag hero
- `src/pages/about.astro` — circular-avatar team grid + modal
- `DESIGN.md` — formal design spec
- `CLAUDE_HANDOFF.md` — engineering handoff with token convention
