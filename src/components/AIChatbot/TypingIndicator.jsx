import React, { useState } from 'react';
import { motion } from 'framer-motion';
import MyraAvatar from './MyraAvatar';

// A handful of light, occasional variations instead of a single robotic
// "..." every time — one picked per typing turn, not meant to be a big
// personality moment.
const THINKING_PHRASES = [
  'Thinking that through',
  'Tinkering with options',
  'Spelunking for deals',
  'Digging around',
  'Mapping it out',
  'One sec',
];

// Tracked at module scope (outside the component) so it survives across
// mount/unmount — otherwise two turns in a row can land on the same phrase
// purely by chance and it reads as if it's stuck on one line.
let lastPhraseIndex = -1;
const pickPhrase = () => {
  let idx = Math.floor(Math.random() * THINKING_PHRASES.length);
  while (idx === lastPhraseIndex) {
    idx = Math.floor(Math.random() * THINKING_PHRASES.length);
  }
  lastPhraseIndex = idx;
  return THINKING_PHRASES[idx];
};

const TypingIndicator = () => {
  const [phrase] = useState(pickPhrase);

  return (
    <div className="bot-response">
      <div className="myra-label">
        <MyraAvatar />
        <span className="myra-label-text">Myra</span>
      </div>
      <div className="typing-indicator-row">
        <span className="typing-indicator-text">{phrase}</span>
        <motion.span
          className="typing-indicator-spinner"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, ease: 'linear', repeat: Infinity }}
        >
          ✨
        </motion.span>
      </div>
    </div>
  );
};

export default TypingIndicator;
