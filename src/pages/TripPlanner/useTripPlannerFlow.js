import { useState } from 'react';
import { createSession } from '../../lib/tripApi';

/**
 * Shared organizer-flow logic (Screens 1.1/1.2/2.1) so both the dedicated
 * /plan route and the homepage's floating MyRA widget drive the exact same
 * step machine and data layer instead of duplicating it.
 */
export function useTripPlannerFlow() {
  const [tripStep, setTripStep] = useState('intro'); // 'intro' | 'form' | 'share' | 'hub'
  const [session, setSession] = useState(null);

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
        text: "You're all set! Share this link with your friends — no login or app install needed on their end.",
      },
    };
  };

  const enterHub = () => setTripStep('hub');

  return {
    tripStep,
    session,
    detectsTripIntent,
    launchMessage,
    nudgeMessage,
    startForm,
    submitForm,
    enterHub,
  };
}
