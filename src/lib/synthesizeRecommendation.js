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

export function synthesizeRecommendation(session, responses) {
  const scenario = determineScenario(session, responses);
  const [primaryVibe, secondaryVibe] = topVibes(responses, 2);
  const fallbackVibe = primaryVibe || 'offbeat';

  if (scenario === 'budget_ceiling') {
    const cheapest = cheapestOverall();
    const gap = cheapest.costPerPerson - session.budget_per_person;
    return {
      destination: cheapest.destination,
      dates: cheapest.dates,
      estimatedCost: cheapest.costPerPerson,
      whyItFits: `Your stated budget was ${inr(session.budget_per_person)} per person, but the closest fitting option, ${cheapest.destination} (${cheapest.hotel}), comes to ${inr(cheapest.costPerPerson)} — about ${inr(gap)} over. It's the nearest match across the full inventory.`,
      attributions: buildAttributions(responses, fallbackVibe),
      evidenceSources: [{ text: cheapest.evidence, source: cheapest.hotel }],
      riskFlag: `Every inventory option is at least ${inr(gap)} over your stated per-person budget.`,
      confidenceLevel: 'low',
    };
  }

  if (scenario === 'polarized' && secondaryVibe) {
    const optionA = bestMatchForVibe(primaryVibe, session.budget_per_person);
    const optionB = bestMatchForVibe(secondaryVibe, session.budget_per_person);
    return {
      destination: `${optionA.destination} + ${optionB.destination} (split-day)`,
      dates: optionA.dates,
      estimatedCost: Math.round((optionA.costPerPerson + optionB.costPerPerson) / 2),
      whyItFits: `Your group is fairly evenly split between ${VIBE_LABELS[primaryVibe]} and ${VIBE_LABELS[secondaryVibe]}, so instead of picking one this splits the trip: a few days at ${optionA.destination} (${optionA.hotel}) and a few at ${optionB.destination} (${optionB.hotel}) — a compromise that doesn't ignore either half of the group.`,
      attributions: [...buildAttributions(responses, primaryVibe), ...buildAttributions(responses, secondaryVibe)],
      evidenceSources: [
        { text: optionA.evidence, source: optionA.hotel },
        { text: optionB.evidence, source: optionB.hotel },
      ],
      riskFlag: 'Splitting the trip means more transit time between the two legs.',
      confidenceLevel: 'moderate',
    };
  }

  const best = bestMatchForVibe(fallbackVibe, session.budget_per_person);
  return {
    destination: best.destination,
    dates: best.dates,
    estimatedCost: best.costPerPerson,
    whyItFits: scenario === 'partial'
      ? `Based on ${responses.length} of ${session.group_size} responses so far, ${VIBE_LABELS[fallbackVibe]} came out ahead, and ${best.destination} (${best.hotel}) fits comfortably within your ${inr(session.budget_per_person)} per-person budget. This may shift once everyone's answered.`
      : `${VIBE_LABELS[fallbackVibe]} was the clear favorite across your group, and ${best.destination} (${best.hotel}) fits comfortably within your ${inr(session.budget_per_person)} per-person budget.`,
    attributions: buildAttributions(responses, fallbackVibe),
    evidenceSources: [{ text: best.evidence, source: best.hotel }],
    riskFlag: null,
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
