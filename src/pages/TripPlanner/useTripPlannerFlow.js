import { useState } from 'react';
import { createSession, getResponses } from '../../lib/tripApi';
import { synthesizeRecommendation } from '../../lib/synthesizeRecommendation';

/**
 * Shared organizer-flow logic (Screens 1.1 through 4.2) so both the
 * dedicated /plan route and the homepage's floating MyRA widget drive the
 * exact same step machine and data layer instead of duplicating it.
 */
export function useTripPlannerFlow() {
  const [tripStep, setTripStep] = useState('intro'); // intro|form|share|hub|processing|result
  const [session, setSession] = useState(null);
  const [recommendation, setRecommendation] = useState(null);

  // TEMPORARY mock intent detection — advances only when the message
  // mentions "friends", standing in for real intent recognition. Remove
  // once an actual NLU/intent step exists.
  const detectsTripIntent = (text) => /friends/i.test(text);

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

  const submitForm = ({ groupSize, dateWindow, budgetPerPerson }) => {
    const created = createSession({
      organizerName: 'Organizer',
      groupSize,
      dateWindow,
      budgetPerPerson,
    });
    setSession(created);
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

  // Runs the mock synthesizer (stand-in for the Phase 5 Edge Function call)
  // and advances to the result screen.
  const completeSynthesis = () => {
    const responses = getResponses(session.id);
    const rec = synthesizeRecommendation(session, responses);
    setRecommendation(rec);
    setTripStep('result');
    return rec;
  };

  const updateRecommendation = (partial) => setRecommendation((prev) => ({ ...prev, ...partial }));

  // Screen 5.1 — final screen, nothing after this.
  const approve = () => setTripStep('closed');

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
    approve,
  };
}
