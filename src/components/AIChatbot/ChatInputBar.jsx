import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

// `tooltip` is used by the "show more options" flow (SynthesisResult.jsx's
// edit/swap screen) to prompt the user to type their preferences here,
// instead of that screen creating its own separate input field.
const ChatInputBar = ({ value, onChange, onSend, onKeyDown, inputRef, tooltip = null }) => (
  <div className="chat-sheet-input-area">
    <AnimatePresence>
      {tooltip && (
        <motion.div
          className="chat-input-tooltip"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.25 }}
        >
          {tooltip}
        </motion.div>
      )}
    </AnimatePresence>
    <div className="chat-sheet-input-wrapper">
      <input
        ref={inputRef}
        type="text"
        placeholder="Ask me anything"
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        className="chat-sheet-input"
      />
      <button
        className={`chat-sheet-send-btn ${value.trim() ? 'active' : ''}`}
        onClick={onSend}
        disabled={!value.trim()}
        aria-label="Send message"
      >
        <ArrowUp size={18} />
      </button>
    </div>
  </div>
);

export default ChatInputBar;
