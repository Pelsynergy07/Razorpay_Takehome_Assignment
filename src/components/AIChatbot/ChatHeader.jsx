import React from 'react';
import { X, Trash2 } from 'lucide-react';

const ChatHeader = ({ onClose, onClearHistory }) => (
  <div className="chat-sheet-header">
    <button className="chat-sheet-icon-btn" onClick={onClose} aria-label="Close">
      <X size={20} />
    </button>
    {onClearHistory && (
      <button
        className="chat-sheet-icon-btn chat-sheet-icon-btn--danger"
        onClick={onClearHistory}
        aria-label="Delete all chat history"
        title="Delete all chat history"
      >
        <Trash2 size={18} />
      </button>
    )}
  </div>
);

export default ChatHeader;
