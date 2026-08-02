import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const STAGES = [
  'Doing the impossible…',
  'Searching across the globe…',
  'Looking for a mountain with a beach 🙄',
  'Bribing the weather gods…',
  'Wrapping it all up in a bow 🎀',
];
const STAGE_DELAY = 1100;

/**
 * Screen 4.1 — processing state. Cycles quirky micro-copy while the mock
 * synthesizer (standing in for the Phase 5 Edge Function) runs, then
 * hands off to the result screen.
 */
const ProcessingScreen = ({ onComplete }) => {
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
    const isLastStage = stageIndex >= STAGES.length - 1;
    const t = setTimeout(() => {
      if (isLastStage) {
        if (!completedRef.current) {
          completedRef.current = true;
          onCompleteRef.current();
        }
      } else {
        setStageIndex((i) => i + 1);
      }
    }, STAGE_DELAY);
    return () => clearTimeout(t);
  }, [stageIndex]);

  return (
    <div className="processing-screen">
      <DotLottieReact
        src="/loading-spinner.json"
        loop
        autoplay
        style={{ width: 140, height: 140 }}
      />
      <AnimatePresence mode="wait">
        <motion.p
          key={stageIndex}
          className="processing-stage-text"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          {STAGES[stageIndex]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
};

export default ProcessingScreen;
