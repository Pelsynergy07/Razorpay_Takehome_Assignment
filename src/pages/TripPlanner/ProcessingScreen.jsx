import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TypingIndicator from '../../components/AIChatbot/TypingIndicator';

const STAGES = ['Collating inputs…', 'Checking reviews…', 'Checking timing constraints…'];
const STAGE_DELAY = 1100;

/**
 * Screen 4.1 — processing state. Cycles staged micro-copy while the mock
 * synthesizer (standing in for the Phase 5 Edge Function) runs, then
 * hands off to the result screen.
 */
const ProcessingScreen = ({ onComplete }) => {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const isLastStage = stageIndex >= STAGES.length - 1;
    const t = setTimeout(() => {
      if (isLastStage) onComplete();
      else setStageIndex((i) => i + 1);
    }, STAGE_DELAY);
    return () => clearTimeout(t);
  }, [stageIndex, onComplete]);

  return (
    <div className="processing-screen">
      <TypingIndicator />
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
