import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import ChatFlowShell from '../../components/AIChatbot/ChatFlowShell';
import { UserBubble, BotTextResponse, MessageBlock } from '../../components/AIChatbot/ChatMessages';
import TypingIndicator from '../../components/AIChatbot/TypingIndicator';
import ChatInputBar from '../../components/AIChatbot/ChatInputBar';
import GradientSweepButton from '../../components/AIChatbot/GradientSweepButton';
import IntentFormCard from './IntentFormCard';
import LinkShareCard from './LinkShareCard';
import LiveAggregationHub from './LiveAggregationHub';
import ProcessingScreen from './ProcessingScreen';
import SynthesisResult from './SynthesisResult';
import TripSummaryCard from './TripSummaryCard';
import { useTripPlannerFlow } from './useTripPlannerFlow';
import './TripPlanner.css';

/**
 * Organizer entry flow — Screens 1.1 (chat intro), 1.2 (intent form),
 * 2.1 (link share). Lives inside the same Myra chat shell as the homepage
 * widget, mounted full-page at /plan.
 */
const OrganizerEntry = () => {
  const navigate = useNavigate();
  const flow = useTripPlannerFlow();
  const [messages, setMessages] = useState([
    {
      id: 'bot-welcome',
      role: 'bot',
      kind: 'text',
      text: "Hi! I'm Myra. Tell me a bit about the trip you're planning with your friends, and I'll help you get everyone's input in one place.",
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesScrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Every transition "thinks" briefly (~600-800ms) before the next bot turn lands.
  const thinkThen = (msg, delay = 850) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [...prev, { id: `bot-${Date.now()}`, role: 'bot', ...msg }]);
      setIsTyping(false);
    }, delay);
  };

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text || flow.tripStep !== 'intro' || isTyping) return;

    const botReply = flow.detectsTripIntent(text) ? flow.launchMessage() : flow.nudgeMessage();
    setMessages((prev) => [...prev, { id: `user-${Date.now()}`, role: 'user', kind: 'text', text }]);
    setInputValue('');
    thinkThen(botReply, 950);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleLaunchSyncMode = () => thinkThen(flow.startForm(), 850);

  const handleFormSubmit = (formValues) => {
    const { message } = flow.submitForm(formValues);
    thinkThen(message, 1200);
  };

  const joinUrl = flow.session ? `${window.location.origin}/join/${flow.session.id}` : '';

  if (flow.tripStep === 'hub') {
    return (
      <ChatFlowShell rootClassName="chat-sheet chat-sheet--route" onClose={() => navigate('/')}>
        <LiveAggregationHub session={flow.session} onProceed={flow.startSynthesis} />
      </ChatFlowShell>
    );
  }

  if (flow.tripStep === 'processing') {
    return (
      <ChatFlowShell rootClassName="chat-sheet chat-sheet--route" onClose={() => navigate('/')}>
        <ProcessingScreen onComplete={flow.completeSynthesis} />
      </ChatFlowShell>
    );
  }

  if (flow.tripStep === 'result') {
    return (
      <ChatFlowShell rootClassName="chat-sheet chat-sheet--route" onClose={() => navigate('/')}>
        <SynthesisResult
          recommendation={flow.recommendation}
          onUpdate={flow.updateRecommendation}
          onApprove={flow.approve}
        />
      </ChatFlowShell>
    );
  }

  if (flow.tripStep === 'closed') {
    return (
      <ChatFlowShell rootClassName="chat-sheet chat-sheet--route" onClose={() => navigate('/')}>
        <TripSummaryCard recommendation={flow.recommendation} />
      </ChatFlowShell>
    );
  }

  return (
    <ChatFlowShell
      rootClassName="chat-sheet chat-sheet--route"
      onClose={() => navigate('/')}
      messagesRef={messagesScrollRef}
      footer={flow.tripStep === 'intro' ? (
        <ChatInputBar
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onSend={handleSend}
          onKeyDown={handleKeyDown}
          inputRef={inputRef}
        />
      ) : null}
    >
      <AnimatePresence initial={false}>
        {messages.map((msg) => (
          <MessageBlock key={msg.id}>
            {msg.role === 'user' ? (
              <UserBubble text={msg.text} />
            ) : (
              <>
                <BotTextResponse text={msg.text} />
                {msg.kind === 'launch' && (
                  <GradientSweepButton onClick={handleLaunchSyncMode} className="launch-sync-btn">
                    Launch sync mode
                  </GradientSweepButton>
                )}
                {msg.kind === 'form' && <IntentFormCard onSubmit={handleFormSubmit} />}
                {msg.kind === 'share' && flow.session && (
                  <LinkShareCard joinUrl={joinUrl} onEnterHub={flow.enterHub} />
                )}
              </>
            )}
          </MessageBlock>
        ))}
        {isTyping && (
          <MessageBlock key="typing">
            <TypingIndicator />
          </MessageBlock>
        )}
      </AnimatePresence>
      <div ref={messagesEndRef} />
    </ChatFlowShell>
  );
};

export default OrganizerEntry;
