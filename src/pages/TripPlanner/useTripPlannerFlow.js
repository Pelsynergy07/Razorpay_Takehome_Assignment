import { useState } from 'react';
import { createSession, getResponses } from '../../lib/tripApi';
import { synthesizeRecommendation } from '../../lib/synthesizeRecommendation';

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
