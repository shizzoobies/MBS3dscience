# MBS Medical — Session Handoff

**Paste this entire doc into the start of the next session.** It's self-contained.

---

## Project

- **Site:** [mbsdoc.com](https://mbsdoc.com) — MBS Medical (veteran-owned Florida telehealth)
- **Owner:** David Hervig, PA-C
- **Stack:** Astro 4 static site (no Tailwind, custom CSS tokens) + 2 React islands (`@astrojs/react`) for contact form (`react-hook-form` + `zod`) and team-bio modal (Radix Dialog). Most pages still ship 0 KB of JS.
- **Repo:** [shizzoobies/mbsmedical](https://github.com/shizzoobies/mbsmedical) — push to `main` auto-deploys via **Cloudflare Pages**.
- **Local path:** `D:\Work for David Hervig\Website Final`
- **Node:** 22.12.0 · **Build:** `npm run build` · 15 static pages.

## Brand system

- **Palette (MBS-Test natural):**
  - `--color-neutral` `#F9F7F2` warm cream page bg
  - `--color-surface` `#FFFFFF` white (inputs, modals)
  - `--color-surface-warm` `#EAE7E0` image-card frame, alt-section panel
  - `--color-surface-soft` `#F4F1EA` off-cream alt band (pricing strip)
  - `--color-primary` `#3C3836` warm dark sepia (text + dark cards)
  - `--color-secondary` `#5C5753` body muted
  - `--color-tertiary` `#888377` meta / micro-labels
  - `--color-accent` `#7D8C7B` sage (secondary accent + filled featured cards)
  - `--color-rust` `#C27A63` rust (eyebrows, hover ink, tag accents — the PRIMARY accent in practice)
  - `--color-border` `#DEDBD2` hairline borders
- **Type:** **Fraunces** display/serif headings + **DM Sans** body/UI.
- **Hero titles:** sentence case with trailing period. Just shipped — was lowercase, user said it read odd.
- **Lowercase is reserved for:** buttons, wordmark, small element copy. NOT hero display titles.
- **No shadows on cards** (single exception: team-bio modal overlay + hero membership card box-shadow is in `HeroMembershipCard.astro` from an earlier iteration — currently the strip variant doesn't use it).
- **Eyebrows:** rust 10–11px uppercase 0.22em letter-spacing. Class: `.editorial-eyebrow`.
- **Editorial CTA pattern:** hairline rule + uppercase tracker link. Pill CTAs reserved for primary actions.

## Key files

```
src/
  layouts/Layout.astro                  page shell, fonts, ChatWidget, scroll-reveal IO
  components/
    Header.astro                        cream nav + mega-menu + mobile drawer (scroll fixed)
    Footer.astro                        white-card footer, 2-col, italic Fraunces tagline
    ServicePage.astro                   shared template for all 11 services
    MembershipPricing.astro             FULL pricing section (1 or 2 plans, side-by-side)
    HeroMembershipCard.astro            HORIZONTAL STRIP between hero & values (current single-plan variant)
    ChatWidget.astro                    floating chat (third-party, untouched)
    react/
      ContactForm.tsx                   rhf + zod form on /contact/
      TeamBioModal.tsx                  Radix Dialog island on /about/
  pages/
    index.astro                         home (flag video hero, stats, testimonials, CTA card)
    about.astro                         founders + clinical team grid, Radix modal
    services.astro                      services hub (full-bleed sig-coast hero)
    contact.astro                       full-bleed leaf hero + rhf form
    primary-care.astro                  HAS membership pricing wired ($99 DPC)
    concierge-medicine.astro            NEEDS pricing wired ($299/mo single plan)
    mens-health.astro                   NEEDS pricing wired ($139.99 Standard / $249 Premium)
    womens-health.astro                 NEEDS pricing wired ($139 Standard / $249 Premium)
    weight-loss.astro                   no pricing planned yet
    mental-health.astro                 no pricing planned yet
    sexual-health.astro                 no pricing planned yet
    hair-dermatology.astro              no pricing planned yet
    labs.astro                          no pricing planned yet
    lifestyle-medicine.astro            no pricing planned yet
    longevity.astro                     no pricing planned yet
  styles/global.css                     all tokens + shared rules. Modal styles are HERE
                                        (not scoped) so Radix Portal picks them up.
public/
  images/                               Pixabay-sourced via scripts/fetch-pixabay-images.mjs
  review-9f3kx.html                     internal pre-launch review tool (Firebase backend),
                                        themed to match v3 palette
scripts/
  fetch-pixabay-images.mjs              query-driven image fetcher, blocks medical-staff tags
  pixabay-manifest.json                 last-run provenance
```

## Membership pricing — IN PROGRESS

**Pattern locked in:**
- **Single-plan service** (Primary Care, Concierge) → render `<HeroMembershipCard />` as a horizontal full-width strip between hero and values. NOT inside the hero. NOT a boxed card. The user explicitly rejected the boxed-in-hero versions.
- **Two-plan service** (TRT, HRT) → keep hero image, render `<MembershipPricing />` (side-by-side comparison) below values. Premium tier gets `featured: true` → filled sage card with white text.

**Pricing locked in:**

| Service | Plan | Price | Includes |
|---|---|---|---|
| Primary Care | Direct Primary Care | $99/mo | 2 visits/mo + direct messaging + chronic + Rx **(DONE)** |
| Concierge | Concierge Membership | $299/mo | 24/7 direct messaging + quarterly labs included + extended visits |
| Men's Health | TRT Standard | $139.99/mo | Medication included, patient pays labs separately |
| Men's Health | TRT Premium | $249/mo | All meds + all lab costs included, priority scheduling |
| Women's Health | HRT Standard | $139/mo | Same as TRT Standard (meds, labs separate) |
| Women's Health | HRT Premium | $249/mo | Same as TRT Premium (meds + labs) |

**Universal terms** (rendered as `note` on each plan, default text already wired in components):
`Cancel anytime · 10% off annual`

**CTA default destination:** `https://mbsmedical.practicebetter.io` (PracticeBetter portal).

**To wire each remaining page:** add a `pricing` prop to its `<ServicePage>` call. See `primary-care.astro` for the working shape. For 2-plan pages, pass two plans and mark the Premium one `featured: true`.

## Stack-specific things that have already bitten

1. **Astro scoped styles + React portals.** When TeamBioModal was first added, all `.member-modal__*` rules were in `about.astro`'s scoped `<style>`. Radix Dialog renders via `createPortal` outside that scope → CSS didn't apply, image went 600px wide. Fix: those rules live in `global.css` now. **Lesson: any styles consumed by a portaled React component must be global, not in a page's `<style>`.**

2. **Build hooks emit noisy false-positive errors.** PreToolUse / PostToolUse hooks say "Edit operation failed" even when the edit succeeded. Trust the actual tool result (`The file ... has been updated successfully.`) and the subsequent `git commit` output, not the hooks.

3. **Pixabay matching is unreliable.** Queries that should return medical content often return junk (antique apothecary bottles, kitchen interiors, Scrabble tiles). Plan on 2–3 tries per slot. Filter list lives in `BLOCKED_TAGS` in the fetch script. **Don't fetch David's portrait — we don't have professional shots yet, do NOT promote his existing avatar.**

4. **The original 92vh hero min-height was a trap.** Made hero stretch to viewport height even when content was 600px, creating dead padding. Removed in commit `7a92c61`. Don't reintroduce it.

5. **No "AI tells."** Things that read as "AI templating" and user rejected:
   - Pill-shaped tag containers around list items (use middot-separated text instead)
   - Corner number badges (01/02/03) on bento steps
   - Lowercase hero titles
   - Generic stock photos (medical staff, especially)

## Recent decisions in this session (rough order)

- React islands added: contact form (rhf+zod) + team-bio Radix Dialog. Static-HTML kept for content pages.
- Team modal photo: 160×160 rounded square → 88×88 circle. Bio text darkened to ink-primary. Role line removed (kept name + credentials only).
- Tag treatment: pill chips → magazine credit roll with rust middots, no boxes. `white-space: nowrap` on each so compound words don't hyphenate.
- Alex Anderson credentials trimmed to "Digital Strategy".
- Membership pricing component built. Multiple iterations on placement: hero-replace-image rejected, hero-text-column-card rejected, hero-text-column-text-only rejected. **Current: horizontal full-width strip between hero and values.** This is the locked pattern.
- Hero `min-height: 92vh` removed (was creating dead space).
- All hero titles capitalized to sentence case (latest commit).

## Open follow-ups when next session starts

1. **Wire pricing into Concierge** ($299/mo single plan) — `pricing` prop in `concierge-medicine.astro`, same shape as primary-care.
2. **Wire pricing into Men's Health** (2 plans). Use `<MembershipPricing />` (auto-renders because plans.length > 1). Mark Premium `featured: true`. Keep hero image.
3. **Wire pricing into Women's Health** (2 plans, HRT mirror of TRT).
4. **Optional**: dedicated `/membership` hub page with all 4–6 plans together (good for SEO + cross-sell). User said yes to this AFTER per-service pages are done.
5. **Real David photo** — once he provides one, swap `/public/images/david.jpg` and consider promoting his portrait card on About to a larger 4:5 frame.

## What NOT to do

- **Don't rebuild the site in Next.js / shadcn.** User asked, we discussed the tradeoffs, decided to keep Astro and selectively pull in shadcn-quality React primitives. See conversation around the `shadcn-web-design-handoff.md` doc.
- **Don't add Tailwind.** Our CSS token system is hand-rolled and intentional.
- **Don't reintroduce boxed pricing cards inside the hero text column.** User rejected that shape multiple times.
- **Don't restore `min-height: 92vh` on `.sp-hero`.**
- **Don't fetch new David Hervig photos from Pixabay.** Wait for real photography.
- **Don't add corner number badges to bento cards.**
- **Don't push to `redesign-v3` anymore.** We shipped to `main` already; main is the live branch.

## How to run / verify

```bash
cd "D:/Work for David Hervig/Website Final"
npm run build              # static build into ./dist/
npm run dev                # local at http://localhost:4321/
node scripts/fetch-pixabay-images.mjs <slotId>   # refetch one or more image slots
```

After each change: build → git add -A → git commit → git push origin main. Cloudflare auto-deploys in 1–3 min.

## Last 10 commits as of this handoff

```
bfd494c v3: capitalize remaining 7 service-page hero titles
edcda62 v3: capitalize hero titles across the site (sentence case)
7a92c61 v3: kill the 92vh hero min-height that was creating dead space below
9da23d7 v3: pricing as horizontal full-width strip between hero and values
6a2a47d v3: drop boxed pricing card in hero, switch to editorial text price line  ← REJECTED
4bb29f4 v3: keep hero image, drop pricing card BELOW intro text                   ← REJECTED
02a56a8 v3: pricing card in service-page hero for single-plan services            ← REJECTED
47f1ca1 v3: tighten membership pricing section spacing
fa6fb3a v3: membership pricing component + Direct Primary Care plan ($99/mo)
8fe53a8 trim alex's credentials line to 'Digital Strategy'
```

`9da23d7` is the current pattern for pricing placement. Earlier `02a56a8` / `4bb29f4` / `6a2a47d` were rejected iterations — don't go back to those shapes.
