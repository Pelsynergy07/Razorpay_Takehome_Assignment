import React from 'react';
import ChatHeader from './ChatHeader';

/**
 * Shared chat chrome — header, scrollable message area, optional
 * below-messages slot (e.g. ScrollHintButton), optional footer (e.g.
 * ChatInputBar). Used both by the homepage's floating MyRA widget and by
 * dedicated routes (like the trip-planner flow) so there is exactly one
 * place that owns the header/messages/input composition.
 */
const ChatFlowShell = ({ onClose, onClearHistory, messagesRef, children, belowMessages, footer, rootClassName = 'chat-sheet' }) => (
  <div className={rootClassName}>
    <ChatHeader onClose={onClose} onClearHistory={onClearHistory} />
    <div className="chat-sheet-messages" ref={messagesRef}>
      {children}
    </div>
    {belowMessages}
    {footer}
  </div>
);

export default ChatFlowShell;
