import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

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
 */
const ChatLandingScreen = ({ conversations, suggestions, onSelectSuggestion, onSelectConversation }) => {
  const hasHistory = conversations.length > 0;

  return (
    <motion.div
      className="myra-landing"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="myra-landing-wordmark">
        myra<span className="myra-landing-wordmark-ai">.AI</span>
        <span className="myra-landing-beta">beta</span>
      </div>

      <h1 className="myra-landing-greeting">Hi, Pranav</h1>
      <p className="myra-landing-subtitle">
        <strong>I'm Myra</strong> — your personal travel assistant. Let's plan your next trip together.
      </p>

      <span className="myra-landing-section-label">
        {hasHistory ? 'Pick up where you left off' : 'You may try asking'}
      </span>

      <div className="myra-landing-list">
        {hasHistory
          ? conversations.map((c) => (
              <button
                key={c.id}
                type="button"
                className="myra-suggestion-pill"
                onClick={() => onSelectConversation(c.id)}
              >
                <span className="myra-suggestion-icon"><Sparkles size={14} /></span>
                <span className="myra-suggestion-body">
                  <span className="myra-suggestion-text">{c.title}</span>
                  <span className="myra-suggestion-meta">{formatRelativeTime(c.updatedAt)}</span>
                </span>
              </button>
            ))
          : suggestions.map((s) => (
              <button
                key={s.text}
                type="button"
                className="myra-suggestion-pill"
                onClick={() => onSelectSuggestion(s.text)}
              >
                <span className="myra-suggestion-icon"><Sparkles size={14} /></span>
                <span className="myra-suggestion-text">{s.text}</span>
              </button>
            ))}
      </div>
    </motion.div>
  );
};

export default ChatLandingScreen;
