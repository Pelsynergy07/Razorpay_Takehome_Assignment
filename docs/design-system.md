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
| `--mmt-teal` | `#14b8c4` | product extension | MyRA "Destination Overview" pin-icon badge — the only teal in the palette, scoped to that one badge |
| `--mmt-chat-user-bubble` | `#eceefb` | product extension | MyRA user message bubble background (pale lavender, not brand blue — keeps the user's own text visually quiet next to Myra's responses) |

## Gradients

| Token | Value | Status |
|---|---|---|
| `--gradient-btn-primary` | `linear-gradient(93deg, #53b2fe 0%, #065af3 100%)` | **verified** (`--color-btn-primary-bg`) |
| `--gradient-hero` | `linear-gradient(180deg, #051322 0%, #15457c 100%)` | **verified** (`.bgGradient`, 645px tall on homepage) |
| `--gradient-tint` | `linear-gradient(99deg, #eaf5ff 0%, #ffffff 97%)` | verified |
| `--gradient-price-drop` | `linear-gradient(90deg, #eaf5ff 0%, #e0f0ff 80%, #d4ebff 100%)` | derived |
| `--gradient-myra` | `linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)` | product extension — purple/pink, used **only** for the Myra bot *mascot* (floating-widget avatar, redirect-state bot badge). Marks "this circle is the bot," nothing else. |

Note the split: the **Myra wordmark itself** (the "Myra✨" label above every bot text response) uses `--gradient-btn-primary` (brand blue), not `--gradient-myra` — see [MyRA Chat System](#myra-chat-system) below. The purple/pink gradient is reserved for the round bot-avatar glyph; the text label stays on-brand blue so responses don't read as a foreign palette dropped into an MMT surface.

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
`--shadow-chatbot`, `--shadow-bottom-nav`, `--shadow-sheet` — the MyRA bottom sheet's upward top-edge lift,
`0 -8px 30px rgba(0,0,0,0.12)`), `--duration-*` / `--ease-*` for transitions, and `--z-*` for the
stacking scale (header 100 → dropdown 200 → widget 300 → chat panel 500 → overlay 900 → modal 1000 → toast 1100).

Mobile card elevation runs softer than the desktop-derived `--shadow-*` scale — real MMT mobile surfaces read
almost flat. Don't reuse `--shadow-sm`/`--shadow-xs` at 1:1 for a new mobile card; scale opacity down
(`rgba(0,0,0,0.02–0.06)`, 1–3px blur) the way `MobileHome.css`'s `--shadow-mobile-card` /
`--shadow-mobile-card-pressed` and the MyRA destination cards (`--shadow-xs` on the card, `--shadow-sm` on the
floating info panel — deliberately lighter than a desktop card would use) do.

## Conventions for new components

1. **Never hardcode a hex or px value that already has a token.** If you need a new one-off value, ask
   whether it's really one-off or whether it belongs on one of the scales above.
2. **Icon color**: lucide-react icons default to `stroke="currentColor"`. Prefer wrapping with a CSS class
   (`.icon-blue`, `.icon-white`, `.icon-secondary`, `.icon-red` — defined in `base.css`) over passing a hex
   string as the `color` prop. For the handful of cases that need a literal JS value (conditional colors,
   `fill` on a filled icon), import `{ colors }` from `src/styles/tokens.js` — keep it byte-identical to
   `tokens.css`.
3. **Brand wordmark**: always render via `<Logo size={n} />` (`src/components/Logo.jsx`) — never re-type
   `make`/`my`/`trip` markup by hand. `Logo` crops the official MMT app icon straight out of a hosted sprite
   (`background-image` + computed `background-position`/`background-size` scaled to `size`) — it takes no
   `variant` prop; the same icon renders identically on light and dark surfaces.
4. **AI assistant mascot** (bot avatar circles): use `--gradient-myra` (purple/pink) — the one deliberate
   palette departure, reserved for "this is the bot" glyphs. Everything else in MyRA, including the "Myra✨"
   wordmark label itself, stays on the brand-blue tokens above. See
   [MyRA Chat System](#myra-chat-system) for the full breakdown.
5. Check `/design-system` before shipping — every token renders live there, computed straight off the DOM.

## MyRA Chat System

The chatbot is the primary surface new work builds on top of — read this section fully before adding a new
message type, card, or control to it. Components live in `src/components/AIChatbot/`.

### Shell: mobile bottom sheet vs. desktop docked panel

`AIChatbotWidget.jsx` builds one `chatBody` (header + messages + input) and mounts it into two different
outer shells depending on `isMobile`:

| Breakpoint | Shell class | Shape |
|---|---|---|
| Mobile | `.chat-sheet` + `.chat-sheet-backdrop` | Fixed, `top: 12vh` down to the screen bottom, rounded top corners only (`--radius-2xl`), `--shadow-sheet`, slides up (`slideUp` keyframe). A dark scrim (`.chat-sheet-backdrop`, `rgba(0,0,0,0.4)`) sits behind it over the peeking page content; tapping it closes the sheet. |
| Desktop | `.chatbot-panel` | Fixed, docked bottom-right (`bottom/right: var(--space-xl)`), fixed 400×600px, all four corners rounded (`--radius-lg`), `--shadow-chatbot`. No backdrop — it floats over the page like a widget. |

**Rule**: when adding a new visual piece to the chat, style it once using the shared class names below — never
branch styles on mobile vs. desktop. The only thing that differs between breakpoints is the outer shell.

### Header

`ChatHeader.jsx` — two circular icon buttons only, `.chat-sheet-icon-btn` (36px, `--radius-pill`,
`--mmt-bg-page` background): **X** (close, left) and **•••** (more, right, currently a stub). No avatar, no
title, no online-status row — that older pattern is gone from both breakpoints.

### Messages

All message rendering lives in `ChatMessages.jsx`, laid out top-to-bottom in a single column
(`.chat-sheet-messages`) — there is no left/right two-party bubble chat pattern here.

- **User message** (`UserBubble`) — right-aligned (`align-self: flex-end`), `--mmt-chat-user-bubble`
  background, `--radius-lg` on three corners but `--radius-xs` on the **top-right** corner specifically
  (`border-radius: var(--radius-lg) var(--radius-xs) var(--radius-lg) var(--radius-lg)`) — that's the
  speech-bubble "tail" cue for outgoing messages. No avatar.
- **Bot text response** (`BotTextResponse`) — a `.myra-label` ("Myra" + a `Sparkles` icon) sits above the
  answer. The label text is a **blue** gradient-clipped span (`background: var(--gradient-btn-primary)` +
  `-webkit-background-clip: text`), *not* `--gradient-myra` (see conventions above). Body text runs through a
  tiny local `formatBotText()` parser (no markdown dependency) supporting exactly three patterns:
  `**bold**`, `1. ` numbered lines, `- ` bullet lines (rendered with a CSS `::before { content: '•' }`, not a
  literal bullet character in the JSX).
- **Destination carousel** (`DestinationCarousel` + `DestinationCard`) — see next section, it's the most
  structurally involved piece.
- **Message actions row** (`MessageActions`) — thumbs-up/down (mutually exclusive toggle), bookmark, copy;
  four `.msg-action-btn` (34px, `--radius-md`, 1px `--mmt-border` outline), `.active` state flips to
  `--mmt-blue` border/text + `--mmt-blue-tint` fill. Shown under every bot response.
- **Typing indicator** — reuses the pre-existing `.typing-indicator`/`.typing-dot` bounce animation, just
  placed under a `.myra-label` instead of the old avatar bubble.

### Destination carousel — exact structure (get this right, it's easy to flatten by accident)

This is a **card containing cards**, not a flat image-then-text list:

1. **Outer card** (`.destination-overview`) — white, `--radius-lg`, `--shadow-sm`, `--space-md` padding on
   all sides. Contains the header row (`--mmt-teal` circular pin badge + "Destination Overview" title), the
   scroll row, and the pagination — all inset by that padding. **Never** let the scroll row bleed to the
   sheet's edge (a negative-margin bleed trick was tried and explicitly reverted — it made the first card
   stick to the edge with no breathing room).
2. **Scroll row** (`.destination-carousel`) — plain `overflow-x: auto` + `scroll-snap-type: x mandatory`,
   `gap: var(--space-sm)`, scrollbar hidden. No edge-bleed margins.
3. **Each card** (`.destination-card`, 200px wide) — itself has `--radius-lg` + `overflow: hidden` +
   `--shadow-xs`, and contains two stacked (normal-flow, not absolutely-positioned) pieces:
   - `.destination-card-photo` (148px tall): the `<img>` (`object-fit: cover`), the bookmark toggle button
     (absolute, top-right, white circle), and a `::after` pseudo-element — a 16px-tall
     `linear-gradient(to bottom, transparent, white)` — that soft-fades the photo's bottom edge instead of
     cutting it hard.
   - `.destination-card-info` (normal flow, right after the photo): its own white rounded panel
     (`--radius-md`, `--shadow-sm`, `--space-sm` padding) containing name / location (`MapPin` icon +
     text) / "Know More" link. Pulled up over the photo's soft-faded edge by exactly `margin: -3px 6px 6px`
     — a small 2–3px overlap, not a large one. This is what makes it read as a floating panel rather than a
     plain bottom half of the card.
4. **Pagination** (`.destination-pagination`) — a solid `--mmt-blue` pill (`n/total`) plus two small static
   decorative dots (`.destination-dot`) — not a real one-dot-per-card indicator (the reference itself doesn't
   do that either when there are 9 cards).

### Input bar

`ChatInputBar.jsx` — `.chat-sheet-input-wrapper` is a **white floating pill** (`--mmt-white` fill,
`--shadow-md`, no border) — it reads as a card sitting on top of the sheet, not a flat gray field inset into
it. Placeholder **"Ask me anything"**, and a circular send button (`.chat-sheet-send-btn`, `ArrowUp` icon —
not a paper-plane `Send` icon) that is **always blue** (`opacity: 0.5` when empty, `1` + a blue glow shadow
once there's text) — unlike the old input, the button never goes fully gray/disabled-looking.

### Redirect / loading state

`ChatRedirectState.jsx` — shown for ~1.3s every time the sheet/panel transitions from closed → open (see the
`showRedirect` effect in `AIChatbotWidget.jsx`), before any messages render. Two circular badges
(`.redirect-glyph-badge` — light-blue tint, generic glyph icon; `.redirect-bot-badge` — `--gradient-myra`,
`Bot` icon) sit at opposite corners of a `150×150px` wrapper, connected by a rotating dashed ring
(`.redirect-orbit-ring`, `orbitRotate` 6s linear infinite keyframe, added to `base.css`). Below it, two-tone
text: `.redirect-text-lead` ("Redirecting you to ", `--mmt-blue-light`) + `.redirect-text-target` (the
destination label, bold, `--mmt-navy-light`).

### Extending this system

When prompting for a *new* MyRA component (a new card type, a new message kind, a new input affordance):
reference this section plus the exact class names above rather than re-describing "chat bubble" from
scratch — the point of documenting it this precisely is that a new component should be indistinguishable in
style from these without re-deriving the spacing/radius/shadow choices by eye each time.
