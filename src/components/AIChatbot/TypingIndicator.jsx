import React from 'react';
import { Sparkles } from 'lucide-react';

const TypingIndicator = () => (
  <div className="bot-response">
    <div className="myra-label">
      <span className="myra-label-text">Myra</span>
      <Sparkles size={13} className="myra-sparkle" />
    </div>
    <div className="typing-indicator">
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
    </div>
  </div>
);

export default TypingIndicator;
