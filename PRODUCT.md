# Product

## Register

product

## Platform

web

## Users

Travelers researching and booking flights, hotels, trains, and holiday packages, using the app on desktop and mobile web, in the same context as a real MakeMyTrip user: comparing prices, filtering search results, and now also getting help from an AI travel assistant embedded in the experience.

## Product Purpose

A MakeMyTrip clone built for a take-home assignment, demonstrating the core travel-search UI (header, hero search widget, search results, footer, mobile flows) plus an AI chatbot travel assistant ("myra") layered into that experience. Success looks like a pixel-faithful, functional recreation of MMT's booking UI with a well-integrated AI agent surface that still feels native to the product.

## Positioning

A faithful MakeMyTrip UI clone extended with an AI-native travel assistant, showing how an AI agent surface can be integrated into an existing, high-traffic booking flow without breaking its identity.

## Brand Personality

Mirrors MakeMyTrip's own brand as closely as possible: energetic, trustworthy, deal-driven, blue-and-red primary palette, bold heavy-weight numerals for prices/dates, dense information-forward layout. No creative departure from MMT's established visual language, except for the AI assistant surfaces, which intentionally break from brand blue (per `--gradient-myra`) to read as a distinct kind of surface.

## Anti-references

None specified beyond staying faithful to MakeMyTrip's actual product; avoid generic SaaS/startup styling (soft pastel cards, gradient text, cream/sand backgrounds) that would clash with MMT's dense, saturated, deal-driven identity.

## Design Principles

- Identity fidelity: every token and component should trace back to MakeMyTrip's real UI (verified from the saved MMT desktop/mobile captures), not an aesthetic guess.
- One deliberate departure: AI-assistant surfaces (chatbot, myra bubble) use the distinct `--gradient-myra` treatment; everything else draws only from the MMT token set.
- Dense, deal-forward information hierarchy over minimalist whitespace; MMT's UI rewards scannability of prices, dates, and offers.
- Tokens over hardcoded values: new UI should consume `src/styles/tokens.css` rather than re-deriving colors, spacing, or radii.

## Accessibility & Inclusion

No specific WCAG level or user need has been called out yet; treat standard web accessibility practice (sufficient contrast, keyboard operability, reduced-motion support) as the baseline until told otherwise.
