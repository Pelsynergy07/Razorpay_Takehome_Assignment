import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatFlowShell from '../../components/AIChatbot/ChatFlowShell';
import { UserBubble, BotTextResponse, MessageBlock, FollowUpReveal } from '../../components/AIChatbot/ChatMessages';
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
import { useChatFlowActions, useChatAutoScroll } from './useChatFlowActions';
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
  const messagesScrollRef = useRef(null);
  const inputRef = useRef(null);

  useChatAutoScroll({ messages, isTyping, containerRef: messagesScrollRef, kindField: 'kind' });

  // Action buttons (Launch sync mode, Create trip session, Enter hub) echo
  // as a user message first, instead of silently jumping to the next step.
  const echoUser = (text) => {
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'user', kind: 'text', text }]);
  };

  const {
    thinkThen,
    handleLaunchSyncMode,
    handleTripFormSubmit: handleFormSubmit,
    handleEnterHub,
    handleProceedToSynthesis,
    handleEmptyProceedAttempt,
    handleConfirmEmptyProceedYes,
    handleConfirmEmptyProceedNo,
    handleCompleteSynthesis,
    handleApprove,
    handleExtendRound,
    handleChooseRiskOption,
    handleCompleteRiskChoiceResolution,
  } = useChatFlowActions({ flow, setMessages, setIsTyping, echoUser, kindField: 'kind' });

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text || flow.tripStep !== 'intro' || isTyping) return;

    const botReply = flow.detectsTripIntent(text) ? flow.launchMessage() : flow.nudgeMessage();
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'user', kind: 'text', text }]);
    setInputValue('');
    thinkThen(botReply, 900);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const joinUrl = flow.session ? `${window.location.origin}/join/${flow.session.id}` : '';

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
      <>
        {messages.map((msg) => (
          <MessageBlock key={msg.id}>
            {msg.role === 'user' ? (
              <UserBubble text={msg.text} />
            ) : (
              <>
                {msg.kind !== 'processing' && msg.kind !== 'risk_processing' && <BotTextResponse text={msg.text} />}
                {msg.kind === 'zero_response_confirm' && (
                  <FollowUpReveal text={msg.text}>
                    <div className="chat-confirm-actions">
                      <button type="button" className="btn-secondary" onClick={handleConfirmEmptyProceedYes}>Yes, continue</button>
                      <button type="button" className="btn-tertiary" onClick={handleConfirmEmptyProceedNo}>No, wait</button>
                    </div>
                  </FollowUpReveal>
                )}
                {msg.kind === 'launch' && (
                  <FollowUpReveal text={msg.text}>
                    <GradientSweepButton onClick={handleLaunchSyncMode} className="launch-sync-btn">
                      Launch sync mode
                    </GradientSweepButton>
                  </FollowUpReveal>
                )}
                {msg.kind === 'form' && (
                  <FollowUpReveal text={msg.text}>
                    <IntentFormCard onSubmit={handleFormSubmit} />
                  </FollowUpReveal>
                )}
                {msg.kind === 'share' && flow.session && (
                  <FollowUpReveal text={msg.text}>
                    <LinkShareCard joinUrl={joinUrl} onEnterHub={handleEnterHub} />
                  </FollowUpReveal>
                )}
                {msg.kind === 'hub' && (
                  <FollowUpReveal text={msg.text}>
                    <LiveAggregationHub session={flow.session} onProceed={handleProceedToSynthesis} onEmptyProceedAttempt={handleEmptyProceedAttempt} />
                  </FollowUpReveal>
                )}
                {msg.kind === 'processing' && (
                  <FollowUpReveal text={msg.text}>
                    <ProcessingScreen onComplete={handleCompleteSynthesis} />
                  </FollowUpReveal>
                )}
                {msg.kind === 'risk_processing' && (
                  <FollowUpReveal text={msg.text}>
                    <ProcessingScreen onComplete={handleCompleteRiskChoiceResolution} />
                  </FollowUpReveal>
                )}
                {msg.kind === 'result' && (
                  <FollowUpReveal text={msg.text}>
                    <SynthesisResult
                      recommendation={flow.recommendation}
                      onUpdate={flow.updateRecommendation}
                      onApprove={handleApprove}
                      onExtendRound={handleExtendRound}
                      onChooseRiskOption={handleChooseRiskOption}
                      scrollContainerRef={messagesScrollRef}
                    />
                  </FollowUpReveal>
                )}
                {msg.kind === 'closed' && (
                  <FollowUpReveal text={msg.text}>
                    <TripSummaryCard recommendation={flow.recommendation} />
                  </FollowUpReveal>
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
      </>
    </ChatFlowShell>
  );
};

export default OrganizerEntry;
