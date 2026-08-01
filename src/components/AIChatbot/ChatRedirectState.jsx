import React from 'react';
import { Compass, Bot } from 'lucide-react';

const ChatRedirectState = ({ label = 'Myra' }) => (
  <div className="redirect-state">
    <div className="redirect-orbit-wrap">
      <div className="redirect-orbit-ring" />
      <div className="redirect-glyph-badge">
        <Compass size={26} className="icon-blue" />
      </div>
      <div className="redirect-bot-badge">
        <Bot size={22} className="icon-white" />
      </div>
    </div>
    <p className="redirect-text">
      <span className="redirect-text-lead">Redirecting you to </span>
      <span className="redirect-text-target">{label}</span>
    </p>
  </div>
);

export default ChatRedirectState;
