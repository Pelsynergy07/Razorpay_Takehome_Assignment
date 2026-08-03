import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { EASE } from './motionConfig';
import MyraAvatar from './MyraAvatar';

// Cycled through one after another for as long as Myra is "thinking" —
// rather than picking one and sitting on it, so the wait reads as active
// progress instead of a stalled label.
const THINKING_PHRASES = [
  'Thinking that through',
  'Tinkering with options',
  'Spelunking for deals',
  'Digging around',
  'Mapping it out',
  'One sec',
  'Putting things together',
];

// How long each phrase stays up before the next one scrolls in.
const PHRASE_CYCLE_MS = 1200;

// Tracked at module scope (outside the component) so it survives across
// mount/unmount — otherwise two turns in a row can start on the same phrase
// purely by chance and it reads as if it's stuck on one line.
let lastStartIndex = -1;
const pickStartIndex = () => {
  let idx = Math.floor(Math.random() * THINKING_PHRASES.length);
  while (idx === lastStartIndex) {
    idx = Math.floor(Math.random() * THINKING_PHRASES.length);
  }
  lastStartIndex = idx;
  return idx;
};

// Container just staggers its word children in; its own opacity/position
// only move on the way out, when the whole phrase steps aside for the next.
const phraseVariants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.4, ease: EASE } },
};

const wordVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

const TypingIndicator = () => {
  const [phraseIndex, setPhraseIndex] = useState(pickStartIndex);

  useEffect(() => {
    const id = setInterval(() => {
      setPhraseIndex((i) => (i + 1) % THINKING_PHRASES.length);
    }, PHRASE_CYCLE_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="bot-response">
      <div className="myra-label">
        <MyraAvatar />
        <span className="myra-label-text">Myra</span>
      </div>
      <div className="typing-indicator-row">
        <span className="typing-indicator-text-window">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={phraseIndex}
              className="typing-indicator-text"
              variants={phraseVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {THINKING_PHRASES[phraseIndex].split(' ').map((word, i) => (
                <motion.span
                  key={i}
                  variants={wordVariants}
                  style={{ display: 'inline-block', marginRight: '0.28em' }}
                >
                  {word}
                </motion.span>
              ))}
            </motion.span>
          </AnimatePresence>
        </span>
        <motion.span
          className="typing-indicator-spinner"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.44, ease: 'linear', repeat: Infinity }}
        >
          <Sparkles size={15} className="icon-blue" fill="currentColor" />
        </motion.span>
      </div>
    </div>
  );
};

export default TypingIndicator;
