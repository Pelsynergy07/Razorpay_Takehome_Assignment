# Myra Sync — Group Trip Planning for MakeMyTrip

A take-home design exercise exploring a new interaction pattern for AI travel assistants: instead of talking to one traveller, Myra Sync collects input from an entire group, asynchronously, and synthesizes it into a single, evidence-backed trip recommendation the organizer can review and approve.

The existing MakeMyTrip experience (search, booking flows, Myra chatbot) is recreated faithfully as the shell this feature lives inside, but the core of this project is the new capability: **an AI that can take multiple people's input and carry a decision forward, not just respond to one person at a time.**

Built to be reviewed like a real PR, clean component structure, a documented mock data layer standing in for the backend, and a codebase organized the way this would actually ship, not a one-off prototype.

## The Core Feature: Group Trip Sync

- **Organizer starts a plan** with a rough intent (dates, group size, budget), and gets a shareable link, no login or install required for anyone who receives it
- **Participants respond asynchronously**, on their own time, through a short, low-effort capture flow, no synchronous session required
- **Live aggregation view** for the organizer, watching responses arrive and a consensus signal emerge in real time
- **Evidence-first synthesis**, every recommendation is backed by visible attribution (who influenced what) and sourced evidence, not just a confident AI answer
- **Edge cases handled deliberately**, partial responses, polarized preferences, budget conflicts, and real-world risk factors are each surfaced honestly rather than papered over

## Also Included, the Supporting Shell

- Flight search card, city pickers, swap cities, dates, travellers & cabin class, trip type (One Way / Round Trip / Multi City)
- 12 travel categories, Flights, Hotels, Villas & Homestays, Holiday Packages, Trains, Buses, Cabs, Tours, Visa, Cruise, Forex, Travel Insurance
- Special fares & quick tools, Student, Armed Forces, GST, Senior Citizen, Doctor fares, and a Flight Tracker
- Flight results modal, generated from search inputs
- Myra AI chatbot, the existing single-user assistant, extended by the Sync flow above
- Offers section, promotional cards with gradients and live deal chips
- Mobile experience, dedicated PWA-style home, bottom navigation, and mobile header
- Token-driven design system (colors, spacing, type scale) matching the reference product

## Tech Stack

- [React 19](https://react.dev/)
- [Vite 8](https://vitejs.dev/)
- [lucide-react](https://lucide.dev/) for icons
- CSS custom-property design tokens

## Code Quality Notes

- Component boundaries follow the existing shell's conventions, new feature work (`TripPlanner/`) is isolated and doesn't touch unrelated parts of the app
- Mock data layer (`lib/`) stands in for a real backend, structured so it could be swapped for actual API calls without touching UI components
- Commit history reflects incremental, reviewable work, not one large drop
- Written to be readable and mergeable as-is, structured the way a real feature branch would be reviewed, not thrown together for a demo alone

## Getting Started

```bash
npm install       # install dependencies
npm run dev       # start the dev server
npm run build     # production build to dist/
npm run preview   # preview the production build
```

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── Header/                 # Desktop & mobile header
│   │   ├── SearchCard/             # Search card, city selector modal
│   │   ├── SearchResults/          # Flight results modal
│   │   ├── AIChatbot/              # Myra AI assistant widget
│   │   ├── Mobile/                 # Mobile home & bottom nav
│   │   ├── Promos/                 # Offers section
│   │   └── Footer.jsx              # Footer
│   ├── pages/
│   │   ├── DesignSystem.jsx        # Design system reference page
│   │   └── TripPlanner/            # Myra Sync: group trip planning flow (organizer + participant)
│   ├── lib/                        # Mock data layer (trip sessions, synthesis logic)
│   ├── styles/                     # tokens, base, global CSS
│   └── App.jsx                     # App shell
├── public/                         # Static assets
├── docs/                           # Design/product/spec documentation
└── index.html
```

## Notes

- Reference material gathered during development (downloaded pages, screenshots, extraction sources) lives locally under `reference/` and is intentionally not committed to the repository.
- This project was built for a design exercise, the mock data layer and simulated real-time behavior stand in for infrastructure that would exist in a production build.
