# Design System

Source of truth: [`src/styles/tokens.css`](src/styles/tokens.css) (CSS custom properties) and its JS mirror
[`src/styles/tokens.js`](src/styles/tokens.js) (for lucide-react icon `color`/`fill` props, which don't resolve
`var()`). Live, always-current view: run the app and visit **`/design-system`**.

Every component should consume these tokens rather than hardcoding a hex/px value. When prompting for a new
component, reference this file (or the `/design-system` page) instead of re-describing the palette from memory.

## Where these numbers came from

Two source artifacts were mined directly (not eyeballed from screenshots):

1. `MakeMyTrip - #1 Travel Website....html` — a saved copy of MakeMyTrip's **Flights search page**
   (desktop header + hero search widget).
2. `MakeMyTrip - ...Mobile breakpoint_PWA (1).mht` — a saved copy of the **mobile PWA homepage**
   (bottom nav, category grid, offers, Where2Go).

Each token below is marked **verified** (read directly out of that CSS/markup) or **derived** (extended from
the verified palette using the same logic — a tint, a shade, a step on the same scale — because the source
didn't expose an exact value for that use case). Derived values are safe to treat as canon going forward;
they're marked only so you know which numbers came from MakeMyTrip's own stylesheet vs. were extrapolated.

## Color

| Token | Value | Status | Use |
|---|---|---|---|
| `--mmt-blue` | `#008cff` | verified (`--color-primary`) | primary brand blue, links, active states |
| `--mmt-blue-light` | `#53b2fe` | verified | gradient start (primary buttons) |
| `--mmt-blue-mid` | `#065af3` | verified | gradient end (primary buttons), hover states |
| `--mmt-blue-deep` | `#003b95` | derived | emphasis text on light surfaces |
| `--mmt-navy` | `#051322` | verified | hero gradient start |
| `--mmt-navy-light` | `#15457c` | verified | hero gradient end |
| `--mmt-red` | `#eb2226` | verified | the "my" badge, wishlist accent |
| `--mmt-red-dark` | `#c81d21` | derived | red hover/pressed |
| `--mmt-white` / `--mmt-bg-page` (`#f2f2f2`) / `--mmt-bg-page-alt` (`#f8f9fa`) | | derived | surfaces |
| `--mmt-border` (`#e0e0e0`) / `--mmt-border-subtle` (`#e6e6e6`) / `--mmt-border-light` (`#f0f0f0`) | | derived | dividers, from lightest to most visible |
| `--mmt-blue-tint` | `#eaf5ff` | verified | selected/active backgrounds |
| `--mmt-text-primary` (`#1a1a1a`) / `-secondary` (`#4a4a4a`, verified) / `-tertiary` (`#737373`) / `-light` (`#9b9b9b`) | | mixed | text hierarchy, darkest to lightest |
| `--mmt-success` (`#1a7a2e`) / `--mmt-warning` (`#f5a623`) / `--mmt-purple` (`#9c27b0`) / `--mmt-online` (`#4ade80`) | | derived | status/feature-tag accents |

## Gradients

| Token | Value | Status |
|---|---|---|
| `--gradient-btn-primary` | `linear-gradient(93deg, #53b2fe 0%, #065af3 100%)` | **verified** (`--color-btn-primary-bg`) |
| `--gradient-hero` | `linear-gradient(180deg, #051322 0%, #15457c 100%)` | **verified** (`.bgGradient`, 645px tall on homepage) |
| `--gradient-tint` | `linear-gradient(99deg, #eaf5ff 0%, #ffffff 97%)` | verified |
| `--gradient-price-drop` | `linear-gradient(90deg, #eaf5ff 0%, #e0f0ff 80%, #d4ebff 100%)` | derived |
| `--gradient-myra` | `linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)` | product extension — the AI assistant (myra.AI / chatbot) is not part of stock MakeMyTrip, so it intentionally breaks from the brand-blue palette to read as "a different kind of surface." Use this gradient (and only this gradient) to mark AI-assistant UI. |

## Typography

- **Family**: `'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif` — verified
  (`--font-family: 'Lato', sans-serif'` in the reference `:root`). Loaded via Google Fonts in `index.css`.
- **Scale**: `--text-2xs` 10 · `-xs` 11 · `-sm` 12 · `-base` 13 · `-md` 14 · `-lg` 16 · `-xl` 20 · `-2xl` 24 ·
  `-3xl` **30** (verified — the search grid's city name / date numerals) · `-4xl` 36.
- **Weights**: `--fw-regular` 400 · `-medium` 500 · `-semibold` 600 · `-bold` 700 · `-black` 800 (wordmark) ·
  `-heavy` **900** (verified — MMT's numerals/labels use 900 heavily: city names, dates, traveller counts).

## Spacing

4px base grid: `--space-3xs` 2 · `-2xs` 4 · `-xs` 8 · `-sm` 12 · `-md` 16 · `-lg` 20 · `-xl` 24 · `-2xl` 32 ·
`-3xl` 40 · `-4xl` 48 · `-5xl` 64.

## Radius

| Token | Value | Status |
|---|---|---|
| `--radius-xs` | 4px | |
| `--radius-sm` | 8px | |
| `--radius-md` | 10px | matches the search-grid container border |
| `--radius-lg` | 12px | |
| `--radius-xl` | 16px | main search card |
| `--radius-2xl` | 24px | |
| `--radius-btn` | **34px** | **verified** (`--btn-border-radius`) — MMT's primary buttons (Search, Continue) are a very-rounded rectangle, *not* a true pill. Use this, not `--radius-pill`, for CTA buttons. |
| `--radius-pill` | 999px | true full-round/stadium shapes: avatars, filter chips, nav pills |

## Elevation, motion, z-index

See `tokens.css` directly — `--shadow-*` (xs → xl, plus purpose-built `--shadow-btn-primary`,
`--shadow-chatbot`, `--shadow-bottom-nav`), `--duration-*` / `--ease-*` for transitions, and `--z-*` for the
stacking scale (header 100 → dropdown 200 → widget 300 → chat panel 500 → overlay 900 → modal 1000 → toast 1100).

## Conventions for new components

1. **Never hardcode a hex or px value that already has a token.** If you need a new one-off value, ask
   whether it's really one-off or whether it belongs on one of the scales above.
2. **Icon color**: lucide-react icons default to `stroke="currentColor"`. Prefer wrapping with a CSS class
   (`.icon-blue`, `.icon-white`, `.icon-secondary`, `.icon-red` — defined in `base.css`) over passing a hex
   string as the `color` prop. For the handful of cases that need a literal JS value (conditional colors,
   `fill` on a filled icon), import `{ colors }` from `src/styles/tokens.js` — keep it byte-identical to
   `tokens.css`.
3. **Brand wordmark**: always render via `<Logo variant="light|dark" size={n} />` (`src/components/Logo.jsx`),
   never re-type `make`/`my`/`trip` spans — that markup is centralized so the red badge treatment can't drift.
4. **AI assistant surfaces** (chatbot widget, MyRA bubble): use `--gradient-myra`, never brand blue, so the
   assistant reads as visually distinct from core booking UI. This is the one deliberate palette departure —
   everything else should draw only from the tokens above.
5. Check `/design-system` before shipping — every token renders live there, computed straight off the DOM.
