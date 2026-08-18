import React, { useState, useEffect, useRef } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const DEFAULT_STAGES = [
  'Doing the impossible…',
  'Searching across the globe…',
  'Looking for a mountain with a beach 🙄',
  'Bribing the weather gods…',
  'Wrapping it all up in a bow 🎀',
];
const DEFAULT_STAGE_DELAY = 1520;
const FINAL_STAGE_DELAY = 1000;

/**
 * Screen 4.1 — processing state. Cycles quirky micro-copy while the mock
 * synthesizer (standing in for the Phase 5 Edge Function) runs, then
 * hands off to the result screen.
 *
 * `stages`/`stageDelay` let other flows (e.g. the itinerary swap-confirm
 * loading beat in SynthesisResult.jsx) reuse this exact visual pattern with
 * their own shorter, context-specific micro-copy instead of the playful
 * default lines, without duplicating the spinner/cycling-text markup.
 */
const ProcessingScreen = ({ onComplete, stages = DEFAULT_STAGES, stageDelay = DEFAULT_STAGE_DELAY }) => {
  const [stageIndex, setStageIndex] = useState(0);

  // onComplete (handleCompleteSynthesis in the parent) is a new function
  // reference on every parent re-render — including the one this very call
  // triggers. Reading it through a ref (instead of depending on it) and
  // guarding with completedRef keeps this effect from re-arming itself and
  // firing onComplete over and over once the last stage is reached.
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const completedRef = useRef(false);

  useEffect(() => {
    const isLastStage = stageIndex >= stages.length - 1;
    const t = setTimeout(() => {
      if (isLastStage) {
        if (!completedRef.current) {
          completedRef.current = true;
          onCompleteRef.current();
        }
      } else {
        setStageIndex((i) => i + 1);
      }
    }, isLastStage ? FINAL_STAGE_DELAY : stageDelay);
    return () => clearTimeout(t);
  }, [stageIndex, stages.length, stageDelay]);

  return (
    <div className="processing-screen">
      <DotLottieReact
        src="/loading-spinner.json"
        loop
        autoplay
        style={{ width: 140, height: 140 }}
      />
      <p className="processing-stage-text">{stages[stageIndex]}</p>
    </div>
  );
};

export default ProcessingScreen;
