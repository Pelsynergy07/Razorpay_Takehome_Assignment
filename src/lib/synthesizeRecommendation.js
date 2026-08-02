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

const determineScenario = (session, responses) => {
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
    datesReasoning: '3 of 4 can shift a few days — locked Dec 19-22, works for everyone.',
    transports: [
      { id: 't1', title: 'AC Sleeper Volvo Bus', duration: 'Overnight 7h', cost: 1200, badge: 'Reconciled Effort', desc: 'Direct overnight route with lie-flat seating', selected: true },
      { id: 't2', title: 'Indigo Flight + Taxi Transfer', duration: '3h total', cost: 3400, badge: 'Fastest', desc: 'Flight to Dehradun (DED) + 40m cab ride to Rishikesh', selected: false },
      { id: 't3', title: 'Vande Bharat Express Train', duration: '4.5h', cost: 1600, badge: 'Scenic Rail', desc: 'Delhi to Haridwar station + 30m local cab', selected: false },
    ],
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
    resolvedSummary: 'Reconciled 4 participant responses: 3 preferred offbeat/relaxed pace while 1 wanted high activity. Selected Shivpuri rafting + hostel stay to stay under ₹20,000 budget while accommodating flexible dates.',
    itinerary: [
      {
        day: 1,
        dateLabel: 'Dec 19',
        title: 'Arrival & Settling In',
        emoji: '🛬',
        description: 'Arrive and get settled in for the days ahead.',
        activities: ['Check-in at Backpackers Hostel', 'Evening bonfire by the river', 'Trip briefing with the group'],
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
    datesReasoning: 'All 4 participants are available Dec 18-21 without any date conflicts.',
    transports: [
      { id: 't1', title: 'Direct Flight (IndiGo)', duration: '2.5h', cost: 4500, badge: 'Direct Flight', desc: 'Direct flight to Mopa (GOX) with shared airport cab', selected: true },
      { id: 't2', title: 'Tejas Express Train', duration: '10h', cost: 1800, badge: 'Budget Rail', desc: 'Overnight train with catering and recliner seats', selected: false },
    ],
    stays: [
      { id: 's1', title: 'Taj Holiday Village', rating: '4.8★', cost: 12000, type: 'Boutique Resort', image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=400&q=80', desc: 'Beachfront cottages with palm garden and sunset lounge', selected: true },
      { id: 's2', title: 'Zostel Goa (Candolim)', rating: '4.6★', cost: 3500, type: 'Social Hostel', image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=400&q=80', desc: 'Poolside hostel near beach strip', selected: false },
    ],
    activities: [
      { id: 'a1', title: 'South Goa Beach Hopping + Sunset Cruise', cost: 2500, badge: 'Chill Beach', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80', items: ['Palolem & Agonda Beach Walk', 'Mandovi River Sunset Cruise'], selected: true },
      { id: 'a2', title: 'Scuba Diving at Grand Island + Water Sports', cost: 4200, badge: 'Water Adventure', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=400&q=80', items: ['PADI Guided Island Scuba', 'Banana Ride & Jet Ski Bundle'], selected: false },
    ],
    resolvedSummary: 'Resolved beach vibe preference across all members. Balanced luxury resort stay with relaxed day trips.',
    itinerary: [
      {
        day: 1,
        dateLabel: 'Dec 18',
        title: 'Arrival & Beachside Check-in',
        emoji: '🛬',
        description: 'Arrive and get settled in.',
        activities: ['Check-in at Taj Holiday Village', 'Evening at the palm garden lounge', 'Welcome dinner by the beach'],
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
  }
};

export function synthesizeRecommendation(session, responses) {
  const scenario = determineScenario(session, responses);
  const [primaryVibe, secondaryVibe] = topVibes(responses, 2);
  const fallbackVibe = primaryVibe || 'offbeat';

  const best = bestMatchForVibe(fallbackVibe, session.budget_per_person);
  const destKey = DESTINATION_OPTIONS[best.destination] ? best.destination : 'Rishikesh';
  const customData = DESTINATION_OPTIONS[destKey];

  const estimatedCost = customData.transports.find(t=>t.selected).cost +
                        customData.stays.find(s=>s.selected).cost +
                        customData.activities.find(a=>a.selected).cost;

  return {
    destination: best.destination,
    dates: best.dates,
    estimatedCost,
    heroImage: customData.heroImage || DESTINATION_HEROES[best.destination] || DESTINATION_HEROES.Default,
    weather: customData.weather,
    datesReasoning: customData.datesReasoning,
    transports: customData.transports,
    stays: customData.stays,
    activities: customData.activities,
    resolvedSummary: customData.resolvedSummary,
    itinerary: customData.itinerary,
    whyItFits: scenario === 'partial'
      ? `Based on ${responses.length} of ${session.group_size} responses so far, ${VIBE_LABELS[fallbackVibe]} came out ahead, and ${best.destination} (${best.hotel}) fits comfortably within your ${inr(session.budget_per_person)} per-person budget. This may shift once everyone's answered.`
      : `${VIBE_LABELS[fallbackVibe]} was the clear favorite across your group, and ${best.destination} (${best.hotel}) fits comfortably within your ${inr(session.budget_per_person)} per-person budget.`,
    attributions: buildAttributions(responses, fallbackVibe),
    evidenceSources: [
      {
        platform: 'Reddit (r/IndiaTravel)',
        platformType: 'reddit',
        quote: '"If you\'re 4-6 friends going to Rishikesh, Backpackers Hostel + Shivpuri 16km rafting package is the undisputed best value. Clean decks, zero middleman markup."',
        author: 'u/wanderlust_delhi • 84 upvotes'
      },
      {
        platform: 'Google Reviews',
        platformType: 'google',
        quote: '"Verified 4.7★ across 1,280+ group stays. Quiet riverfront location, excellent cafe access, and seamless bus transport."',
        author: 'Google Local Guides'
      },
      {
        platform: 'TripAdvisor Verified',
        platformType: 'tripadvisor',
        quote: '"Ideal 4-day pace for young working professionals. Rafting in the morning, sunset Aarti in the evening."',
        author: 'Top Traveler Contributor'
      }
    ],
    riskFlag: scenario === 'budget_ceiling' ? 'Option is close to per-person budget limit.' : null,
    confidenceLevel: scenario === 'partial' ? 'moderate' : 'high',
  };
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
