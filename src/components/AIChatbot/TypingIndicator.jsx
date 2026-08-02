import React from 'react';
import MyraAvatar from './MyraAvatar';

const TypingIndicator = () => (
  <div className="bot-response">
    <div className="myra-label">
      <MyraAvatar />
      <span className="myra-label-text">Myra</span>
    </div>
    <div className="typing-indicator">
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
    </div>
  </div>
);

export default TypingIndicator;
