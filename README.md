# MMT AI Agent

A pixel-faithful, front-end recreation of MakeMyTrip's travel booking home page, built as a take-home assignment. The project pairs the classic MakeMyTrip search experience with **MyRA**, an AI-powered travel assistant, plus responsive desktop and mobile (PWA-style) views.

## Features

- **Flight search card** — city pickers, swap cities, dates, travellers & cabin class, trip type (One Way / Round Trip / Multi City)
- **12 travel categories** — Flights, Hotels, Villas & Homestays, Holiday Packages, Trains, Buses, Cabs, Tours, Visa, Cruise, Forex, Travel Insurance
- **Special fares & quick tools** — Student, Armed Forces, GST, Senior Citizen, Doctor fares and a Flight Tracker
- **Flight results modal** — generated from the search inputs
- **MyRA AI chatbot** — in-app AI travel assistant with suggested flights
- **Offers section** — promotional cards with gradients and live deal chips
- **Mobile experience** — dedicated PWA-style home, bottom navigation and mobile header
- **Design system** — token-driven CSS (colors, spacing, type scale) matching the reference product

## Tech Stack

- [React 19](https://react.dev)
- [Vite 8](https://vitejs.dev)
- [lucide-react](https://lucide.dev) for icons
- CSS custom-property design tokens

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
│   │   ├── AIChatbot/              # MyRA AI assistant widget
│   │   ├── Mobile/                 # Mobile home & bottom nav
│   │   ├── Promos/                 # Offers section
│   │   └── Footer.jsx              # Footer
│   ├── pages/
│   │   ├── DesignSystem.jsx        # Design system reference page
│   │   └── TripPlanner/            # Group Trip Planner flow (organizer + participant)
│   ├── lib/                        # Mock data layer (trip sessions, synthesis logic)
│   ├── styles/                     # tokens, base, global CSS
│   └── App.jsx                     # App shell
├── public/                         # Static assets
├── docs/                           # Design/product/spec documentation
└── index.html
```

## Notes

- Reference material gathered during development (downloaded pages, screenshots, extraction sources) lives locally under `reference/` and is intentionally **not** committed to the repository.
