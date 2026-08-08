import { useState } from 'react';
import { createSession, getSession, getResponses, submitResponse } from '../../lib/tripApi';
import { synthesizeRecommendation, hasRiskFlagForDestination, buildRecommendationFromInventoryItem } from '../../lib/synthesizeRecommendation';

/**
 * Shared organizer-flow logic (Screens 1.1 through 4.2) so both the
 * dedicated /plan route and the homepage's floating Myra widget drive the
 * exact same step machine and data layer instead of duplicating it.
 */
export function useTripPlannerFlow() {
  const [tripStep, setTripStep] = useState('intro'); // intro|form|share|hub|processing|result
  const [session, setSession] = useState(null);
  const [recommendation, setRecommendation] = useState(null);

  // Broad intent detection for offline fallback — triggers whenever the user
  // mentions trips, group travel, vacations, flight/hotel planning, or friends.
  const detectsTripIntent = (text) =>
    /friends?|trip|vacation|holiday|getaway|goa|manali|rishikesh|group|plan|flight|hotel|weekend|travel|fly|stay|pack|explore/i.test(text);

  const launchMessage = () => ({
    kind: 'launch',
    text: "Got it! Let's set up the basics so I can invite your friends and start collecting everyone's preferences.",
  });

  const nudgeMessage = () => ({
    kind: 'text',
    text: 'Tell me who you\'re planning this trip with — e.g. "planning a trip with my friends" — and I\'ll get things moving.',
  });

  const startForm = () => {
    setTripStep('form');
    return { kind: 'form', text: 'Great — a few quick details:' };
  };

  const submitForm = async ({ groupSize, destination, dateWindow, budgetPerPerson }) => {
    const created = await createSession({
      organizerName: 'Organizer',
      groupSize,
      destination,
      dateWindow,
      budgetPerPerson,
    });
    setSession(created);

    // Demo convenience for the risk-override edge case: a destination
    // that's already known to carry a real-world risk flag auto-fills the
    // group's responses, so the flow can be walked through end to end
    // right away instead of needing group_size real participants to
    // actually open the join link first.
    if (destination && hasRiskFlagForDestination(destination)) {
      await Promise.all(
        Array.from({ length: groupSize }, (_, i) =>
          submitResponse(created.id, { participantName: `Friend ${i + 1}`, deferred: false })
        )
      );
    }

    setTripStep('share');
    return {
      session: created,
      message: {
        kind: 'share',
        text: "Alright, we're set. Drop this link in your group chat, they'll take 2 minutes to fill it in, no signup, no app install, promise.",
      },
    };
  };

  const enterHub = () => setTripStep('hub');

  const startSynthesis = () => setTripStep('processing');

  // Runs the synthesizer and advances to the result screen.
  const completeSynthesis = async () => {
    const responses = await getResponses(session.id);
    const rec = synthesizeRecommendation(session, responses);
    setRecommendation(rec);
    setTripStep('result');
    return rec;
  };

  const updateRecommendation = (partial) => setRecommendation((prev) => ({ ...prev, ...partial }));

  // Risk-override edge case — the organizer picked one of the two choice
  // cards (the flagged pick or the safer alternative). Kept separate from
  // completeSynthesis since re-running synthesizeRecommendation here would
  // just land back on risk_override_pending (session.destination hasn't
  // changed); this builds straight from the chosen inventory item instead.
  const [pendingRiskChoice, setPendingRiskChoice] = useState(null);

  const startRiskChoiceResolution = (item, isFlaggedChoice, flaggedPick) => {
    setPendingRiskChoice({ item, isFlaggedChoice, flaggedPick });
  };

  const completeRiskChoiceResolution = () => {
    if (!pendingRiskChoice) return recommendation;
    const { item, isFlaggedChoice, flaggedPick } = pendingRiskChoice;
    const rec = buildRecommendationFromInventoryItem(item, {
      scenario: 'risk_override_resolved',
      whyItFits: isFlaggedChoice
        ? [
            `Most of the signal pointed to ${item.destination} — going with it despite the flagged risk.`,
            `${item.hotel} fits your group's budget at ₹${item.costPerPerson.toLocaleString('en-IN')} per person.`,
          ]
        : [
            `Picked to avoid the flagged risk on ${flaggedPick.destination}.`,
            `${item.hotel} in ${item.destination} fits your group's budget at ₹${item.costPerPerson.toLocaleString('en-IN')} per person.`,
          ],
      riskFlag: isFlaggedChoice ? item.riskFlag : null,
      extraEvidence: isFlaggedChoice && item.riskEvidence ? [item.riskEvidence] : [],
    });
    setRecommendation(rec);
    setPendingRiskChoice(null);
    return rec;
  };

  // Screen 5.1 — final screen, nothing after this.
  const approve = () => setTripStep('closed');

  // Exit-flow edge case — drops the organizer's in-progress session and
  // takes the step machine back to its pre-launch state, so the chat can
  // return to the landing screen as if Group Sync mode had never started.
  const reset = () => {
    setTripStep('intro');
    setSession(null);
    setRecommendation(null);
    setPendingRiskChoice(null);
  };

  // Re-hydrates `session`/`recommendation` after switching back to a
  // previously-saved conversation: those two only ever lived in this hook's
  // React state, never in the persisted chat messages, so a fresh mount
  // otherwise leaves session/recommendation null while the restored
  // messages still render screens (hub/result/closed) that assume they
  // exist — session data itself is safe to re-fetch since tripApi always
  // persists it (and responses) to localStorage keyed by session id.
  const restore = async ({ sessionId, tripStep: restoredStep }) => {
    if (!sessionId) return;
    const restoredSession = await getSession(sessionId);
    if (!restoredSession) return;
    setSession(restoredSession);

    if (restoredStep === 'result' || restoredStep === 'closed') {
      const responses = await getResponses(sessionId);
      setRecommendation(synthesizeRecommendation(restoredSession, responses));
    }

    setTripStep(restoredStep || 'share');
  };

  return {
    tripStep,
    session,
    recommendation,
    detectsTripIntent,
    launchMessage,
    nudgeMessage,
    startForm,
    submitForm,
    enterHub,
    startSynthesis,
    completeSynthesis,
    updateRecommendation,
    startRiskChoiceResolution,
    completeRiskChoiceResolution,
    approve,
    restore,
    reset,
  };
}
