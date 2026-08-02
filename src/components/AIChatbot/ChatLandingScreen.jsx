import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import {
  blockVariants,
  BLOCK_STAGGER,
  wordVariants,
  wordContainerVariants,
  peerContainerVariants,
  peerItemVariants,
  sequenceDelays,
} from './motionConfig';

const SUBTITLE_BOLD_WORDS = ["I'm", 'Myra'];
const SUBTITLE_REST_WORDS = "— your personal travel assistant. Let's plan your next trip together.".split(' ');

const formatRelativeTime = (timestamp) => {
  const diffMs = Date.now() - timestamp;
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
};

/**
 * Landing screen shown whenever the chat has no active conversation loaded —
 * greeting + suggested prompts on a fresh start, or a "pick up where you
 * left off" list of past conversations once any exist.
 *
 * Entrance: wordmark, greeting, subtitle, section label, then the
 * suggestion/history list — top to bottom, each waiting for the one above.
 */
const ChatLandingScreen = ({ conversations, suggestions, onSelectSuggestion, onSelectConversation }) => {
  const hasHistory = conversations.length > 0;
  const [wordmarkDelay, greetingDelay, subtitleDelay, labelDelay, listDelay] = sequenceDelays(Array(5).fill(BLOCK_STAGGER));

  return (
    <div className="myra-landing">
      <motion.div className="myra-landing-wordmark" variants={blockVariants} custom={wordmarkDelay} initial="hidden" animate="visible">
        myra<span className="myra-landing-wordmark-ai">.AI</span>
        <span className="myra-landing-beta">beta</span>
      </motion.div>

      <motion.h1 className="myra-landing-greeting" variants={blockVariants} custom={greetingDelay} initial="hidden" animate="visible">
        Hi, Pranav
      </motion.h1>
      <motion.p
        className="myra-landing-subtitle"
        variants={wordContainerVariants(subtitleDelay)}
        initial="hidden"
        animate="visible"
      >
        {SUBTITLE_BOLD_WORDS.map((word, i) => (
          <motion.span key={`b${i}`} variants={wordVariants} style={{ display: 'inline-block', marginRight: '0.25em' }}>
            <strong>{word}</strong>
          </motion.span>
        ))}
        {SUBTITLE_REST_WORDS.map((word, i) => (
          <motion.span key={`r${i}`} variants={wordVariants} style={{ display: 'inline-block', marginRight: '0.25em' }}>
            {word}
          </motion.span>
        ))}
      </motion.p>

      <motion.span className="myra-landing-section-label" variants={blockVariants} custom={labelDelay} initial="hidden" animate="visible">
        {hasHistory ? 'Pick up where you left off' : 'You may try asking'}
      </motion.span>

      <motion.div className="myra-landing-list" variants={peerContainerVariants(listDelay)} initial="hidden" animate="visible">
        {hasHistory
          ? conversations.map((c) => (
              <motion.button
                key={c.id}
                type="button"
                variants={peerItemVariants}
                className="myra-suggestion-pill"
                onClick={() => onSelectConversation(c.id)}
              >
                <span className="myra-suggestion-icon"><Sparkles size={14} /></span>
                <span className="myra-suggestion-body">
                  <span className="myra-suggestion-text">{c.title}</span>
                  <span className="myra-suggestion-meta">{formatRelativeTime(c.updatedAt)}</span>
                </span>
              </motion.button>
            ))
          : suggestions.map((s) => (
              <motion.button
                key={s.text}
                type="button"
                variants={peerItemVariants}
                className="myra-suggestion-pill"
                onClick={() => onSelectSuggestion(s.text)}
              >
                <span className="myra-suggestion-icon"><Sparkles size={14} /></span>
                <span className="myra-suggestion-text">{s.text}</span>
              </motion.button>
            ))}
      </motion.div>
    </div>
  );
};

export default ChatLandingScreen;
