import React from 'react';
import { X, MoreHorizontal } from 'lucide-react';

const ChatHeader = ({ onClose }) => (
  <div className="chat-sheet-header">
    <button className="chat-sheet-icon-btn" onClick={onClose} aria-label="Close">
      <X size={20} />
    </button>
    <button className="chat-sheet-icon-btn" aria-label="More options">
      <MoreHorizontal size={20} />
    </button>
  </div>
);

export default ChatHeader;
