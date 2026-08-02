import { useState } from 'react';
import { getSession, submitResponse } from '../../lib/tripApi';
import { participantCards } from './participantCards';

/**
 * Enhanced step machine with:
 * - participant name tracked from arrival screen
 * - auto-advance on card selection (selectAndAdvance)
 * - back navigation restoring previous answers
 * - directional transition state
 */
export function useParticipantFlow(sessionId) {
  const [session, setSession] = useState(null);

  const steps = [
    'arrival',
    ...participantCards.map((c) => c.key),
    'note',
    'thanks',
  ];

  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [participantName, setParticipantName] = useState('');
  const [direction, setDirection] = useState('forward');

  useEffect(() => {
    let isMounted = true;
    Promise.resolve(getSession(sessionId)).then((s) => {
      if (isMounted) {
        setSession(s || {
          id: sessionId || 'demo-session',
          organizer_name: 'Pranav',
          group_size: 4,
          date_window: 'Mar 14-16',
          budget_per_person: 15000,
        });
      }
    });
    return () => { isMounted = false; };
  }, [sessionId]);

  const currentStep = stepIndex >= 0 ? steps[stepIndex] : 'not-found';
  const totalQuestions = participantCards.length;
  const questionIndex = stepIndex > 0 && stepIndex <= totalQuestions ? stepIndex : null;

  const startCards = () => {
    setDirection('forward');
    setStepIndex(1);
  };

  /** Select a value and immediately advance to the next step */
  const selectAndAdvance = (field, value) => {
    const updated = { ...answers, [field]: value };
    setAnswers(updated);
    setDirection('forward');
    // Advance after a tiny delay so the selected state renders visibly
    setTimeout(() => {
      setStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
    }, 180);
  };

  /** Select without advancing (used for textarea / slider drag) */
  const selectOnly = (field, value) => {
    setAnswers((prev) => ({ ...prev, [field]: value }));
  };

  const goNext = () => {
    setDirection('forward');
    setStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const goBack = () => {
    if (stepIndex > 0) {
      setDirection('backward');
      setStepIndex((prev) => prev - 1);
    }
  };

  const goToStep = (idx) => {
    if (idx >= 0 && idx < stepIndex) {
      setDirection('backward');
      setStepIndex(idx);
    }
  };

  const finish = async (openNote) => {
    setDirection('forward');
    const idx = steps.indexOf('thanks');
    setStepIndex(idx);
    await submitResponse(sessionId, {
      ...answers,
      openNote,
      participantName,
      deferred: false,
    });
  };

  const deferAll = async () => {
    setDirection('forward');
    setStepIndex(steps.indexOf('thanks'));
    await submitResponse(sessionId, { deferred: true, participantName });
  };

  return {
    session,
    step: currentStep,
    stepIndex,
    questionIndex,
    totalQuestions,
    answers,
    direction,
    participantName,
    setParticipantName,
    startCards,
    selectAndAdvance,
    selectOnly,
    goNext,
    goBack,
    goToStep,
    finish,
    deferAll,
  };
}
