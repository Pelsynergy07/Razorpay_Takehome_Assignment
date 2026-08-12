import { useState } from 'react';
import { createSession, getSession, getResponses, submitResponse } from '../../lib/tripApi';
import { synthesizeRecommendation, checkRiskOverride, buildRecommendationFromInventoryItem } from '../../lib/synthesizeRecommendation';

/**
 * Shared organizer-flow logic (Screens 1.1 through 4.2) so both the
 * dedicated /plan route and the homepage's floating Myra widget drive the
 * exact same step machine and data layer instead of duplicating it.
 */
export function useTripPlannerFlow() {
  const [tripStep, setTripStep] = useState('intro'); // intro|form|share|hub|processing|result
  const [session, setSession] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  // Latest responses already known by the time the organizer reaches the
  // hub — set by the self-ack watcher the moment it sees the organizer's
  // own response land, so LiveAggregationHub can paint with that count on
  // its very first render instead of starting at 0 and waiting on its own
  // fetch (which, against a real Supabase backend, is a visible delay).
  const [cachedResponses, setCachedResponses] = useState([]);

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

  const submitForm = async ({ groupSize, destination, dateWindow, budgetPerPerson, startDate, endDate }) => {
    const created = await createSession({
      organizerName: 'Organizer',
      groupSize,
      destination,
      dateWindow,
      budgetPerPerson,
    });
    // Raw chosen dates ride along on the session object (client-side only,
    // not written to the backend) so that even when the organizer hasn't
    // named a destination yet, a later synthesis run can still check
    // whatever destination the group's votes land on against these same
    // dates — see synthesizeRecommendation's deferred risk-override check.
    const sessionWithDates = startDate && endDate ? { ...created, start_date: startDate, end_date: endDate } : created;
    setSession(sessionWithDates);

    // Risk-override edge case — fires immediately here only when the
    // organizer has BOTH named a destination and locked in real calendar
    // dates (not just a day count), before any share link goes out to the
    // group. If the destination isn't known yet, this can't be checked
    // until synthesis actually picks one (handled deferred, see above).
    const riskOverride = destination && startDate && endDate
      ? checkRiskOverride({ destination, startDate, endDate })
      : null;

    if (riskOverride) {
      // Demo convenience: the group's responses auto-fill here so the live
      // hub reads as fully collected if the organizer ever looks at it,
      // instead of sitting at "waiting for responses" — same convenience
      // the old end-of-flow risk check relied on, just triggered earlier now.
      await Promise.all(
        Array.from({ length: groupSize }, (_, i) =>
          submitResponse(created.id, { participantName: `Friend ${i + 1}`, deferred: false })
        )
      );
      setRecommendation({ scenario: 'risk_override_pending', ...riskOverride });
      setTripStep('result');
      return {
        session: sessionWithDates,
        message: {
          kind: 'result',
          text: "Hold on — before I send this to your group, there's something worth flagging about your dates.",
        },
      };
    }

    setTripStep('share');
    return {
      session: sessionWithDates,
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
      budgetPerPerson: session.budget_per_person,
    });
    setRecommendation(rec);
    setPendingRiskChoice(null);
    return rec;
  };

  // Screen 5.1 — final screen. Not necessarily the true end though: the
  // organizer can still catch a mistake here and loop back via reopenForEdit.
  const approve = () => setTripStep('closed');

  // Edit-after-approve loop — organizer spotted something wrong on the
  // final itinerary and wants to fix it. `recommendation` itself is left
  // untouched, so SynthesisResult reopens showing exactly what was approved;
  // onUpdate/onApprove from there work exactly as they did the first time,
  // so this can loop as many times as needed.
  const reopenForEdit = () => setTripStep('result');

  // Exit-flow edge case — drops the organizer's in-progress session and
  // takes the step machine back to its pre-launch state, so the chat can
  // return to the landing screen as if Group Sync mode had never started.
  const reset = () => {
    setTripStep('intro');
    setSession(null);
    setRecommendation(null);
    setPendingRiskChoice(null);
    setCachedResponses([]);
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
    } else if (restoredStep === 'hub') {
      const responses = await getResponses(sessionId);
      if (Array.isArray(responses)) setCachedResponses(responses);
    }

    setTripStep(restoredStep || 'share');
  };

  return {
    tripStep,
    session,
    recommendation,
    cachedResponses,
    setCachedResponses,
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
    reopenForEdit,
    restore,
    reset,
  };
}
