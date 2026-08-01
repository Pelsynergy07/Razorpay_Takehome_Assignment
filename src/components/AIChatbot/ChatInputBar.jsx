import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

const ChatInputBar = ({ value, onChange, onSend, onKeyDown, inputRef }) => (
  <div className="chat-sheet-input-area">
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
      <motion.button
        className={`chat-sheet-send-btn ${value.trim() ? 'active' : ''}`}
        onClick={onSend}
        disabled={!value.trim()}
        aria-label="Send message"
        whileTap={value.trim() ? { scale: 0.9 } : undefined}
      >
        <ArrowUp size={18} />
      </motion.button>
    </div>
  </div>
);

export default ChatInputBar;
