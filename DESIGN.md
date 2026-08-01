# Design

Source of truth for implementation: [`src/styles/tokens.css`](src/styles/tokens.css) (CSS custom properties), mirrored in [`src/styles/tokens.js`](src/styles/tokens.js) for JS-side icon colors. Live view: run the app and visit `/design-system`. This file summarizes those tokens for design-decision context; see [`design-system.md`](design-system.md) for the full breakdown and provenance (verified vs. derived).

## Theme

Light, dense, deal-driven travel-booking UI. Mirrors MakeMyTrip's real product as closely as possible; one deliberate departure (the AI assistant surfaces) breaks from brand blue on purpose. Not a minimalist/SaaS aesthetic — MMT's UI is information-forward and saturated, not restrained.

## Color

| Token | Value | Use |
|---|---|---|
| `--mmt-blue` | `#008cff` | primary brand blue, links, active states |
| `--mmt-blue-light` / `--mmt-blue-mid` | `#53b2fe` / `#065af3` | primary button gradient |
| `--mmt-blue-deep` | `#003b95` | emphasis text on light surfaces |
| `--mmt-navy` / `--mmt-navy-light` | `#051322` / `#15457c` | hero gradient |
| `--mmt-red` / `--mmt-red-dark` | `#eb2226` / `#c81d21` | "my" badge, wishlist accent, red hover/pressed |
| `--mmt-white`, `--mmt-bg-page` (`#f2f2f2`), `--mmt-bg-page-alt` (`#f8f9fa`) | | surfaces |
| `--mmt-border` (`#e0e0e0`), `--mmt-border-subtle` (`#e6e6e6`), `--mmt-border-light` (`#f0f0f0`) | | dividers |
| `--mmt-blue-tint` | `#eaf5ff` | selected/active backgrounds |
| `--mmt-text-primary` (`#1a1a1a`) → `-secondary` (`#4a4a4a`) → `-tertiary` (`#737373`) → `-light` (`#9b9b9b`) | | text hierarchy |
| `--mmt-success` (`#1a7a2e`), `--mmt-warning` (`#f5a623`), `--mmt-purple` (`#9c27b0`), `--mmt-online` (`#4ade80`) | | status/feature-tag accents |

**Gradients**: `--gradient-btn-primary` (`linear-gradient(93deg, #53b2fe 0%, #065af3 100%)`), `--gradient-hero` (`linear-gradient(180deg, #051322 0%, #15457c 100%)`), `--gradient-tint`, `--gradient-price-drop`. `--gradient-myra` (`linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)`) is reserved exclusively for AI-assistant UI (chatbot widget, myra bubble) — the one intentional palette departure from brand blue.

Color strategy: **Committed** — brand blue carries the primary surfaces and CTAs; red is a sparing accent; the myra gradient is a deliberately isolated exception, never blended into core booking UI.

## Typography

- **Family**: `'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`, loaded via Google Fonts.
- **Scale**: `--text-2xs` 10 · `-xs` 11 · `-sm` 12 · `-base` 13 · `-md` 14 · `-lg` 16 · `-xl` 20 · `-2xl` 24 · `-3xl` 30 · `-4xl` 36.
- **Weights**: `--fw-regular` 400 · `-medium` 500 · `-semibold` 600 · `-bold` 700 · `-black` 800 (wordmark) · `-heavy` 900 (numerals/labels — city names, dates, traveller counts).

## Spacing

4px base grid: `--space-3xs` 2 · `-2xs` 4 · `-xs` 8 · `-sm` 12 · `-md` 16 · `-lg` 20 · `-xl` 24 · `-2xl` 32 · `-3xl` 40 · `-4xl` 48 · `-5xl` 64.

## Radius

| Token | Value | Use |
|---|---|---|
| `--radius-xs` → `-2xl` | 4 / 8 / 10 / 12 / 16 / 24px | general surfaces, search grid, cards |
| `--radius-btn` | 34px | primary CTA buttons (Search, Continue) — very-rounded rectangle, not a true pill |
| `--radius-pill` | 999px | true stadium shapes: avatars, filter chips, nav pills |

## Elevation, Motion, Z-index

Defined directly in `tokens.css`: `--shadow-*` (xs → xl, plus `--shadow-btn-primary`, `--shadow-chatbot`, `--shadow-bottom-nav`), `--duration-*` / `--ease-*` for transitions, `--z-*` stacking scale (header 100 → dropdown 200 → widget 300 → chat panel 500 → overlay 900 → modal 1000 → toast 1100).

## Layout topology

Dense, information-forward: hero search widget over a navy gradient, grid-based search results, bottom nav + category grid on mobile. Not airy/minimalist — scannability of prices, dates, and offers drives density over whitespace.

## Components & Conventions

1. Never hardcode a hex/px value that already has a token; consume `tokens.css` / `tokens.js`.
2. Icon color via CSS class (`.icon-blue`, `.icon-white`, `.icon-secondary`, `.icon-red` in `base.css`), not a hardcoded hex prop, except where a literal JS value is unavoidable (import `{ colors }` from `tokens.js`).
3. Brand wordmark always via `<Logo variant="light|dark" size={n} />` (`src/components/Logo.jsx`) — never re-typed `make`/`my`/`trip` spans.
4. AI-assistant surfaces (chatbot widget, myra bubble) always use `--gradient-myra`, never brand blue.
5. Verify at `/design-system` before shipping any token change.
