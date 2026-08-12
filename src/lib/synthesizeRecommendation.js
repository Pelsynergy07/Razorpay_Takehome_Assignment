import { mockInventory } from './mockInventory';

/**
 * Mock stand-in for the Phase 5 Edge Function's Claude/OpenRouter call —
 * same system-prompt rules, same output shape, computed with plain JS
 * instead of an LLM. This is what the demo branch's real Edge Function
 * will eventually replace; every UI component consuming this only cares
 * about the return shape, so the swap is mechanical.
 *
 * Output shape (matches the doc's system prompt exactly):
 * { destination, dates, estimatedCost, whyItFits, attributions[],
 *   evidenceSources[], riskFlag, confidenceLevel }
 */

const VIBE_LABELS = { mountains: 'mountains', beach: 'beach', party: 'party', offbeat: 'offbeat & relaxed' };

const inr = (n) => `₹${n.toLocaleString('en-IN')}`;

const cheapestOverall = () => mockInventory.slice().sort((a, b) => a.costPerPerson - b.costPerPerson)[0];

const topVibes = (responses, n = 2) => {
  const counts = {};
  responses.forEach((r) => { if (r.vibe) counts[r.vibe] = (counts[r.vibe] || 0) + 1; });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, n).map(([vibe]) => vibe);
};

const bestMatchForVibe = (vibe, maxBudget) => {
  const candidates = mockInventory.filter((i) => i.vibe === vibe);
  const pool = candidates.length ? candidates : mockInventory;
  const withinBudget = pool.filter((i) => i.costPerPerson <= maxBudget);
  const shortlist = withinBudget.length ? withinBudget : pool;
  return shortlist.slice().sort((a, b) => a.costPerPerson - b.costPerPerson)[0];
};

const buildAttributions = (responses, vibe) => responses
  .map((r, i) => ({ r, i }))
  .filter(({ r }) => r.vibe === vibe)
  .map(({ i }) => ({ text: `Wants a ${VIBE_LABELS[vibe] || vibe} trip`, sourceParticipant: `Friend ${i + 1}` }));

// Cheapest same-vibe entry with no riskFlag, as the "safer alternative"
// offered alongside a flagged popular pick.
const findSaferAlternative = (flaggedItem) => {
  const sameVibeNoRisk = mockInventory.filter((i) => i.vibe === flaggedItem.vibe && !i.riskFlag && i.id !== flaggedItem.id);
  const pool = sameVibeNoRisk.length ? sameVibeNoRisk : mockInventory.filter((i) => !i.riskFlag && i.id !== flaggedItem.id);
  return pool.slice().sort((a, b) => a.costPerPerson - b.costPerPerson)[0];
};

// Scripted demo edge case, not a real per-destination/date check — the
// interview demo just needs "picking real travel dates always surfaces the
// risk-flagged Rishikesh pick vs. a safer alternative" as a canned beat.
// Checked once, right at intake-form submission (see useTripPlannerFlow's
// submitForm) — before a share link ever goes out to the group — instead of
// waiting until synthesis at the very end of the flow to surface it.
export function checkRiskOverride() {
  const flaggedPick = mockInventory.find((i) => i.riskFlag) || null;
  if (!flaggedPick) return null;
  return { flaggedPick, saferAlternative: findSaferAlternative(flaggedPick) };
}

const determineScenario = (session, responses) => {
  if (responses.length > 0 && responses.every((r) => r.deferred)) return 'all_deferred';
  if (responses.length < session.group_size) return 'partial';

  const counts = Object.values(
    responses.reduce((acc, r) => {
      if (r.vibe) acc[r.vibe] = (acc[r.vibe] || 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b - a);
  const isPolarized = counts.length >= 2 && counts[0] - counts[1] <= 1;

  if (cheapestOverall().costPerPerson > session.budget_per_person) return 'budget_ceiling';
  if (isPolarized) return 'polarized';
  return 'normal';
};

const DESTINATION_HEROES = {
  Goa: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
  Manali: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
  Rishikesh: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80',
  Thailand: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=800&q=80',
  Bali: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
  Coorg: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=800&q=80',
  Andaman: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=800&q=80',
  Default: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80',
};

const DESTINATION_OPTIONS = {
  Rishikesh: {
    heroImage: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80',
    weather: '21°C Pleasant | AQI 38',
    dateOptions: [
      { id: 'dt1', title: 'Dec 19 – Dec 22', badge: 'Best time to visit', desc: 'Mid-December is peak season for Rishikesh — river levels are ideal for rafting, days are clear and pleasant, and it lines up with the year-end holiday window so time off is easy to get.', selected: true },
      { id: 'dt2', title: 'Dec 26 – Dec 29', badge: 'Holiday rush', desc: 'Right after Christmas — same great weather, but hostels and rafting slots get busier and pricier this week.', selected: false },
      { id: 'dt3', title: 'Jan 9 – Jan 12', badge: 'Quieter & cheaper', desc: 'Same winter rafting conditions with fewer crowds and lower prices once the holiday rush clears.', selected: false },
    ],
    transports: [
      { id: 't1', title: 'AC Sleeper Volvo Bus', duration: 'Overnight 7h', cost: 1200, badge: 'Reconciled Effort', desc: 'Direct overnight route with lie-flat seating', arrivalTime: '6:00 AM', selected: true },
      { id: 't2', title: 'Indigo Flight + Taxi Transfer', duration: '3h total', cost: 3400, badge: 'Fastest', desc: 'Flight to Dehradun (DED) + 40m cab ride to Rishikesh', arrivalTime: '9:40 AM', selected: false },
      { id: 't3', title: 'Vande Bharat Express Train', duration: '4.5h', cost: 1600, badge: 'Scenic Rail', desc: 'Delhi to Haridwar station + 30m local cab', arrivalTime: '11:15 AM', selected: false },
    ],
    // "Show more options" search pool — only wired for Rishikesh's transport
    // category (the flagship demo path for the swap flow). Free-text search
    // in SynthesisResult.jsx scores against `tags`/title/desc; other
    // categories/destinations have no pool here, so that search honestly
    // reports it has nothing to search rather than fabricating results.
    morePool: {
      transports: [
        { id: 't4', title: 'Shared Innova Cab', duration: '9h door-to-door', cost: 2000, arrivalTime: '3:00 PM', desc: 'Direct shared cab, no transfers or waiting around', tags: ['cheap', 'budget', 'cab', 'car', 'door', 'shared'] },
        { id: 't5', title: 'Private Cab (Just Your Group)', duration: '7h', cost: 6000, arrivalTime: '1:00 PM', desc: 'Private car for just your group, flexible stops on the way', tags: ['private', 'luxury', 'comfortable', 'flexible', 'fast'] },
        { id: 't6', title: 'Budget AC Seater Bus', duration: 'Overnight 8h', cost: 900, arrivalTime: '7:00 AM', desc: 'Cheapest AC seater option — no sleeper berths', tags: ['cheap', 'cheapest', 'budget', 'bus', 'lowest', 'affordable'] },
        { id: 't7', title: 'Himalayan Queen + Cab', duration: '6h', cost: 2100, arrivalTime: '12:30 PM', desc: 'Scenic mountain train with a connecting cab into town', tags: ['scenic', 'train', 'views', 'relaxed', 'nature'] },
      ],
    },
    stays: [
      { id: 's1', title: 'Backpackers Hostel', rating: '4.6★', cost: 2500, type: 'Riverside Dorm', image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=400&q=80', desc: 'Social vibe with bonfire, river view decks, and breakfast included', selected: true },
      { id: 's2', title: 'Ganga Kinare Resort', rating: '4.8★', cost: 5500, type: 'Heritage Hotel', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80', desc: 'Luxury private riverfront property with private ghat access', selected: false },
      { id: 's3', title: 'Aloha On the Ganges', rating: '4.7★', cost: 4200, type: 'Apart-Hotel', image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=400&q=80', desc: 'Infinity pool overlooking mountain cliffs & river', selected: false },
    ],
    activities: [
      { id: 'a1', title: 'Rafting (16km) + Cliff Jump + Sunset Aarti', cost: 1800, badge: 'Top Vibe Match', image: 'https://images.unsplash.com/photo-1530866495561-507c9faab2ed?auto=format&fit=crop&w=400&q=80', items: ['Shivpuri 16km White Water Rafting', 'Maggie Point Cliff Jump', 'Triveni Ghat Evening Aarti'], selected: true },
      { id: 'a2', title: 'Sunrise Trek + Bungee Jump + Beatle Cafe Trail', cost: 3500, badge: 'High Energy', image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=400&q=80', items: ['Kunjapuri Sunrise Temple Trek', 'Mohanchatti Bungee Jump 83m', 'Beatles Ashram Walk'], selected: false },
      { id: 'a3', title: 'Yoga Retreat + Pottery Workshop + Cafe Crawl', cost: 1400, badge: 'Slow Pace', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=400&q=80', items: ['Guided Riverside Yoga Session', 'Clay Pottery & Craft Workshop', 'Laxman Jhula Cafe Hopping'], selected: false },
    ],
    resolvedSummary: [
      { label: 'Group vibe', detail: '3 of 4 friends wanted an offbeat, relaxed pace, 1 wanted high activity' },
      { label: 'Budget fit', detail: 'Shivpuri rafting + hostel stay keeps the trip under ₹20,000 per person' },
      { label: 'Dates', detail: 'Most of the group had flexible dates, which made Dec 19-22 work for everyone' },
      { label: 'Risk note', detail: 'The Shivpuri rafting stretch is dam-release-dependent this time of year — flagged separately before this pick was confirmed' },
    ],
    itinerary: [
      {
        day: 1,
        dateLabel: 'Dec 19',
        title: 'Arrival & Settling In',
        emoji: '🛬',
        description: 'Arrive and get settled in for the days ahead.',
        activities: ['Check-in at Backpackers Hostel', 'Evening bonfire by the river', 'Trip briefing with the group'],
        // Timing-sensitive Day 1 activities that ride on arrival time — the
        // impact-preview / swap-confirm flow in SynthesisResult.jsx reads
        // this when the organizer swaps transport options, so a later/
        // earlier arrival honestly flags what else it touches.
        timeSensitiveActivities: ['evening bonfire', 'trip briefing'],
        transportMode: 'AC Sleeper Volvo Bus',
        image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=400&q=80',
        rating: '4.6★',
        bookable: ['transport', 'stay'],
      },
      {
        day: 2,
        dateLabel: 'Dec 20',
        title: 'Rafting & River Adventure',
        emoji: '🚣',
        description: 'A full day of adventure on the river.',
        activities: ['Shivpuri 16km white water rafting', 'Cliff jump at Maggie Point', 'Triveni Ghat evening aarti'],
        transportMode: null,
        image: 'https://images.unsplash.com/photo-1530866495561-507c9faab2ed?auto=format&fit=crop&w=400&q=80',
        rating: '4.7★',
        bookable: ['activity'],
      },
      {
        day: 3,
        dateLabel: 'Dec 21',
        title: 'Yoga, Crafts & Cafe Trail',
        emoji: '🧘',
        description: 'A slower day to recharge.',
        activities: ['Guided riverside yoga session', 'Pottery & craft workshop', 'Cafe hopping around Laxman Jhula'],
        transportMode: null,
        image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=400&q=80',
        rating: '4.5★',
        bookable: ['activity'],
      },
      {
        day: 4,
        dateLabel: 'Dec 22',
        title: 'Final Sunset & Departure',
        emoji: '🌅',
        description: 'Wrap up and head home.',
        activities: ['Morning walk along the ghats', 'Check-out and pack up', 'Return via AC Sleeper Volvo Bus'],
        transportMode: 'AC Sleeper Volvo Bus',
        image: null,
        rating: null,
        bookable: ['transport'],
      },
    ],
  },
  Goa: {
    heroImage: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
    weather: '29°C Sunny | AQI 24',
    dateOptions: [
      { id: 'dt1', title: 'Dec 18 – Dec 21', badge: 'Best time to visit', desc: 'This is peak winter season in Goa — dry weather, calm seas, and the liveliest stretch of the beach and nightlife scene all year.', selected: true },
      { id: 'dt2', title: 'Dec 24 – Dec 27', badge: 'Christmas week', desc: 'Festive energy across the beach shacks, but expect higher resort prices and bigger crowds.', selected: false },
      { id: 'dt3', title: 'Jan 5 – Jan 8', badge: 'Quieter & cheaper', desc: 'Same great winter weather with thinner crowds and better rates once the holiday season winds down.', selected: false },
    ],
    transports: [
      { id: 't1', title: 'Direct Flight (IndiGo)', duration: '2.5h', cost: 4500, badge: 'Direct Flight', desc: 'Direct flight to Mopa (GOX) with shared airport cab', arrivalTime: '11:30 AM', selected: true },
      { id: 't2', title: 'Tejas Express Train', duration: '10h', cost: 1800, badge: 'Budget Rail', desc: 'Overnight train with catering and recliner seats', arrivalTime: '9:00 PM', selected: false },
    ],
    stays: [
      { id: 's1', title: 'Taj Holiday Village', rating: '4.8★', cost: 12000, type: 'Boutique Resort', image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=400&q=80', desc: 'Beachfront cottages with palm garden and sunset lounge', selected: true },
      { id: 's2', title: 'Zostel Goa (Candolim)', rating: '4.6★', cost: 3500, type: 'Social Hostel', image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=400&q=80', desc: 'Poolside hostel near beach strip', selected: false },
    ],
    activities: [
      { id: 'a1', title: 'South Goa Beach Hopping + Sunset Cruise', cost: 2500, badge: 'Chill Beach', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80', items: ['Palolem & Agonda Beach Walk', 'Mandovi River Sunset Cruise'], selected: true },
      { id: 'a2', title: 'Scuba Diving at Grand Island + Water Sports', cost: 4200, badge: 'Water Adventure', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=400&q=80', items: ['PADI Guided Island Scuba', 'Banana Ride & Jet Ski Bundle'], selected: false },
    ],
    resolvedSummary: [
      { label: 'Group vibe', detail: 'Beach was the clear preference across every member' },
      { label: 'Stay', detail: 'Balanced a luxury resort stay with relaxed day trips to fit the budget' },
    ],
    itinerary: [
      {
        day: 1,
        dateLabel: 'Dec 18',
        title: 'Arrival & Beachside Check-in',
        emoji: '🛬',
        description: 'Arrive and get settled in.',
        activities: ['Check-in at Taj Holiday Village', 'Evening at the palm garden lounge', 'Welcome dinner by the beach'],
        timeSensitiveActivities: ['evening lounge time', 'welcome dinner'],
        transportMode: 'Direct Flight (IndiGo)',
        image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=400&q=80',
        rating: '4.8★',
        bookable: ['transport', 'stay'],
      },
      {
        day: 2,
        dateLabel: 'Dec 19',
        title: 'Beach Hopping & Sunset Cruise',
        emoji: '🌅',
        description: 'Beach day, done right.',
        activities: ['Palolem Beach walk', 'Agonda Beach downtime', 'Mandovi River sunset cruise'],
        transportMode: null,
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80',
        rating: '4.5★',
        bookable: ['activity'],
      },
      {
        day: 3,
        dateLabel: 'Dec 20',
        title: 'Water Adventure Day',
        emoji: '🤿',
        description: 'Time in the water.',
        activities: ['PADI-guided scuba at Grand Island', 'Banana ride', 'Jet ski session'],
        transportMode: null,
        image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=400&q=80',
        rating: '4.6★',
        bookable: ['activity'],
      },
      {
        day: 4,
        dateLabel: 'Dec 21',
        title: 'Final Beach Morning & Departure',
        emoji: '🌴',
        description: 'Last swim, then home.',
        activities: ['Final morning swim', 'Check-out', 'Return flight to Mopa'],
        transportMode: 'Direct Flight (IndiGo)',
        image: null,
        rating: null,
        bookable: ['transport'],
      },
    ],
  },
  // Only populated so the risk-override edge case (organizer names
  // "Manali") shows real Manali content instead of falling back to
  // Rishikesh's cards — same shape as the two entries above.
  Manali: {
    heroImage: DESTINATION_HEROES.Manali,
    weather: '6°C Crisp & Snowy | Clear skies',
    dateOptions: [
      { id: 'dt1', title: 'Dec 20 – Dec 24', badge: 'Winter season', desc: 'Peak snow season in Manali — pine forests and the higher slopes are freshly snowed in, giving the town a proper winter-holiday feel.', selected: true },
      { id: 'dt2', title: 'Dec 27 – Dec 31', badge: 'New Year rush', desc: 'Same winter conditions, but expect packed markets and higher hotel rates over the New Year weekend.', selected: false },
      { id: 'dt3', title: 'Jan 10 – Jan 14', badge: 'Quieter & cheaper', desc: 'Same snowy scenery with thinner crowds and better rates once the holiday season winds down.', selected: false },
    ],
    transports: [
      { id: 't1', title: 'AC Volvo Bus (Delhi–Manali)', duration: 'Overnight 12h', cost: 1800, badge: 'Popular Route', desc: 'Direct overnight route with reclining seats, drops right into Mall Road', arrivalTime: '7:30 AM', selected: true },
      { id: 't2', title: 'Flight to Bhuntar (Kullu) + Taxi', duration: '3h total', cost: 5200, badge: 'Fastest', desc: 'Flight to Kullu-Manali Airport (KUU) + 50m cab ride to Manali', arrivalTime: '11:00 AM', selected: false },
      { id: 't3', title: 'Shared Innova Cab from Delhi', duration: '10h', cost: 2400, badge: 'Door to Door', desc: 'Direct cab, no transfers, flexible pickup times', arrivalTime: '6:00 PM', selected: false },
    ],
    stays: [
      { id: 's1', title: 'The Himalayan', rating: '4.6★', cost: 9500, type: 'Mountain View Hotel', image: 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=400&q=80', desc: 'Calm mountain-facing rooms with a bonfire deck and in-house cafe', selected: true },
      { id: 's2', title: 'Zostel Manali', rating: '4.5★', cost: 5500, type: 'Social Hostel', image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=400&q=80', desc: 'Popular backpacker hostel with a lively common area and trek meetups', selected: false },
    ],
    activities: [
      { id: 'a1', title: 'Solang Valley Snow Day + Old Manali Cafe Walk', cost: 2200, badge: 'Chill Pace', image: 'https://images.unsplash.com/photo-1517824806704-9040b037703b?auto=format&fit=crop&w=400&q=80', items: ['Solang Valley snow activities', 'Hidimba Devi Temple walk', 'Old Manali cafe hopping'], selected: true },
      { id: 'a2', title: 'Rohtang Pass Excursion + River Rafting', cost: 3600, badge: 'High Energy', image: DESTINATION_HEROES.Manali, items: ['Rohtang Pass day trip (subject to road status)', 'Beas River rafting', 'Vashisht hot springs'], selected: false },
    ],
    resolvedSummary: [
      { label: 'Group vibe', detail: 'Mountains was the strongest signal, with a calm, chill pace preferred' },
      { label: 'Budget fit', detail: 'The Himalayan stay + Solang Valley day keeps the trip within a comfortable per-person budget' },
    ],
    itinerary: [
      {
        day: 1,
        dateLabel: 'Dec 20',
        title: 'Arrival & Mall Road Evening',
        emoji: '🛬',
        description: 'Arrive and get settled in.',
        activities: ['Check-in at The Himalayan', 'Evening stroll on Mall Road', 'Trip briefing with the group'],
        timeSensitiveActivities: ['evening stroll', 'trip briefing'],
        transportMode: 'AC Volvo Bus (Delhi–Manali)',
        image: 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=400&q=80',
        rating: '4.6★',
        bookable: ['transport', 'stay'],
      },
      {
        day: 2,
        dateLabel: 'Dec 21',
        title: 'Solang Valley Snow Day',
        emoji: '❄️',
        description: 'A full day in the snow.',
        activities: ['Solang Valley snow activities', 'Cable car ride', 'Hot chocolate at a valley cafe'],
        transportMode: null,
        image: 'https://images.unsplash.com/photo-1517824806704-9040b037703b?auto=format&fit=crop&w=400&q=80',
        rating: '4.5★',
        bookable: ['activity'],
      },
      {
        day: 3,
        dateLabel: 'Dec 22',
        title: 'Old Manali & Hidimba Temple',
        emoji: '🛕',
        description: 'A slower cultural day.',
        activities: ['Hidimba Devi Temple walk', 'Old Manali cafe hopping', 'Local craft market'],
        transportMode: null,
        image: null,
        rating: '4.4★',
        bookable: ['activity'],
      },
      {
        day: 4,
        dateLabel: 'Dec 24',
        title: 'Final Morning & Departure',
        emoji: '🌄',
        description: 'Wrap up and head home.',
        activities: ['Morning walk by the Beas river', 'Check-out and pack up', 'Return via AC Volvo Bus'],
        transportMode: 'AC Volvo Bus (Delhi–Manali)',
        image: null,
        rating: null,
        bookable: ['transport'],
      },
    ],
  },
};

const DEFAULT_EVIDENCE_SOURCES = [
  {
    platform: 'Reddit (r/IndiaTravel)',
    platformType: 'reddit',
    quote: '"If you\'re 4-6 friends going to Rishikesh, Backpackers Hostel + Shivpuri 16km rafting package is the undisputed best value. Clean decks, zero middleman markup."',
    author: 'u/wanderlust_delhi'
  },
  {
    platform: 'Google Reviews',
    platformType: 'google',
    quote: '"Verified 4.7★ across 1,280+ group stays. Quiet riverfront location, excellent cafe access, and seamless bus transport."',
    author: 'Google Local Guides'
  },
  {
    platform: 'MakeMyTrip Verified',
    platformType: 'mmt',
    quote: '"Ideal 4-day pace for young working professionals. Rafting in the morning, sunset Aarti in the evening."',
    author: 'MakeMyTrip Verified Traveler'
  }
];

// Shared assembly step for every scenario that ends in a full synthesis
// dashboard (normal, partial, budget_ceiling, polarized, plus the manual
// pick / risk-choice resolutions) — looks up the winning inventory item's
// full destination detail and builds the exact shape SynthesisResult.jsx
// consumes.
const assembleRecommendation = (item, { scenario = 'normal', whyItFits = [], attributions = [], riskFlag = null, confidenceLevel = 'high', extraEvidence = [], budgetPerPerson = null } = {}) => {
  const destKey = DESTINATION_OPTIONS[item.destination] ? item.destination : 'Rishikesh';
  const customData = DESTINATION_OPTIONS[destKey];

  const estimatedCost = customData.transports.find((t) => t.selected).cost +
    customData.stays.find((s) => s.selected).cost +
    customData.activities.find((a) => a.selected).cost;

  // Rishikesh's static resolvedSummary carries a "Risk note" line, but that
  // claim ("flagged separately before this pick was confirmed") is only
  // true when this recommendation actually came out of resolving the risk
  // panel. A coincidental normal match, or a manual pick from the
  // "everyone deferred" edge case, never showed that panel — drop the line
  // rather than claim a risk callout that never happened.
  const resolvedSummary = scenario === 'risk_override_resolved'
    ? customData.resolvedSummary
    : (customData.resolvedSummary || []).filter((s) => s.label !== 'Risk note');

  return {
    scenario,
    destination: item.destination,
    dates: item.dates,
    estimatedCost,
    budgetPerPerson,
    heroImage: customData.heroImage || DESTINATION_HEROES[item.destination] || DESTINATION_HEROES.Default,
    weather: customData.weather,
    dateOptions: customData.dateOptions,
    transports: customData.transports,
    stays: customData.stays,
    activities: customData.activities,
    resolvedSummary,
    itinerary: customData.itinerary,
    morePool: customData.morePool || {},
    whyItFits,
    attributions,
    evidenceSources: extraEvidence.length > 0 ? [...extraEvidence, ...DEFAULT_EVIDENCE_SOURCES] : DEFAULT_EVIDENCE_SOURCES,
    riskFlag,
    confidenceLevel,
  };
};

export function synthesizeRecommendation(session, responses) {
  const scenario = determineScenario(session, responses);

  // Edge case — everyone who responded chose "you decide for me": there's
  // no preference data to honestly synthesize from, so this short-circuits
  // before any destination is picked. SynthesisResult.jsx renders a
  // dedicated honest-state panel for this shape instead of the dashboard.
  if (scenario === 'all_deferred') {
    return {
      scenario,
      groupSize: session.group_size,
      respondedCount: responses.length,
      budgetPerPerson: session.budget_per_person,
    };
  }

  const [primaryVibe] = topVibes(responses, 2);
  const fallbackVibe = primaryVibe || 'offbeat';

  const best = bestMatchForVibe(fallbackVibe, session.budget_per_person);

  // Risk-override edge case — only for sessions where useTripPlannerFlow's
  // submitForm actually armed this (real dates were picked at intake).
  // Never fires for a normal session just because its real, unsteered vibe
  // tally happens to land on a risk-flagged pick by coincidence.
  if (session.risk_demo_armed && best.riskFlag) {
    return { scenario: 'risk_override_pending', flaggedPick: best, saferAlternative: findSaferAlternative(best) };
  }

  const whyItFits = scenario === 'partial'
    ? [
        `${responses.length} of ${session.group_size} friends have replied so far`,
        `${VIBE_LABELS[fallbackVibe]} is the top pick right now`,
        `${best.destination} (${best.hotel}) fits your ${inr(session.budget_per_person)} per-person budget`,
        `This could change once everyone's answered`,
      ]
    : [
        `${VIBE_LABELS[fallbackVibe]} was the clear favorite for your group`,
        `${best.destination} (${best.hotel}) fits your ${inr(session.budget_per_person)} per-person budget`,
      ];

  return assembleRecommendation(best, {
    scenario,
    whyItFits,
    attributions: buildAttributions(responses, fallbackVibe),
    riskFlag: scenario === 'budget_ceiling' ? 'Option is close to per-person budget limit.' : null,
    confidenceLevel: scenario === 'partial' ? 'moderate' : 'high',
    budgetPerPerson: session.budget_per_person,
  });
}

// Builds a full synthesis dashboard from an organizer-chosen inventory item
// — used to resolve the "everyone deferred" manual pick and the
// "risk override" flagged-vs-alternative choice into a normal recommendation.
export function buildRecommendationFromInventoryItem(item, { scenario = 'manual_pick', whyItFits = [], riskFlag = null, extraEvidence = [], budgetPerPerson = null } = {}) {
  return assembleRecommendation(item, { scenario, whyItFits, attributions: [], riskFlag, confidenceLevel: 'high', extraEvidence, budgetPerPerson });
}

/**
 * Screen 4.3 — 1-2 alternative inventory options, excluding whatever's
 * currently recommended. Swapping just updates local state, no re-run.
 */
export function getAlternatives(recommendation, count = 2) {
  return mockInventory
    .filter((i) => !recommendation.destination.includes(i.destination))
    .sort((a, b) => a.costPerPerson - b.costPerPerson)
    .slice(0, count);
}
