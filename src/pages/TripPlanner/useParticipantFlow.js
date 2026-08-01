import { useState } from 'react';
import { getSession, submitResponse } from '../../lib/tripApi';
import { participantCards } from './participantCards';

/**
 * Screens 2.2-2.6 step machine. Steps: 'arrival' -> one per
 * participantCards entry -> 'note' -> 'submitting' -> 'thanks'.
 * 'not-found' if the session id doesn't resolve to anything.
 */
export function useParticipantFlow(sessionId) {
  const [session] = useState(() => getSession(sessionId));
  const [step, setStep] = useState(session ? 'arrival' : 'not-found');
  const [answers, setAnswers] = useState({});

  const cardKeys = participantCards.map((c) => c.key);

  const startCards = () => setStep(cardKeys[0]);

  const selectOption = (cardKey, field, value) => {
    const updated = { ...answers, [field]: value };
    setAnswers(updated);
    const currentIndex = cardKeys.indexOf(cardKey);
    const nextStep = currentIndex < cardKeys.length - 1 ? cardKeys[currentIndex + 1] : 'note';
    setStep(nextStep);
  };

  const finish = (openNote) => {
    setStep('submitting');
    setTimeout(() => {
      submitResponse(sessionId, { ...answers, openNote, deferred: false });
      setStep('thanks');
    }, 900);
  };

  const deferAll = () => {
    setStep('submitting');
    setTimeout(() => {
      submitResponse(sessionId, { deferred: true });
      setStep('thanks');
    }, 900);
  };

  return { session, step, answers, startCards, selectOption, finish, deferAll };
}
