import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { EASE } from './motionConfig';
import ChatFlowShell from './ChatFlowShell';
import { UserBubble, BotTextResponse, DestinationCarousel, MessageActions, MessageBlock, FollowUpReveal } from './ChatMessages';
import TypingIndicator from './TypingIndicator';
import ScrollHintButton from './ScrollHintButton';
import ChatInputBar from './ChatInputBar';
import GradientSweepButton from './GradientSweepButton';
import IntentFormCard from '../../pages/TripPlanner/IntentFormCard';
import LinkShareCard from '../../pages/TripPlanner/LinkShareCard';
import LiveAggregationHub from '../../pages/TripPlanner/LiveAggregationHub';
import ProcessingScreen from '../../pages/TripPlanner/ProcessingScreen';
import SynthesisResult from '../../pages/TripPlanner/SynthesisResult';
import TripSummaryCard from '../../pages/TripPlanner/TripSummaryCard';
import { useTripPlannerFlow } from '../../pages/TripPlanner/useTripPlannerFlow';
import { useChatFlowActions, useChatAutoScroll } from '../../pages/TripPlanner/useChatFlowActions';
import { generateMyraAIResponse } from '../../lib/openRouterClient';
import '../../pages/TripPlanner/TripPlanner.css';
import MyraAvatar from './MyraAvatar';
import ChatLandingScreen from './ChatLandingScreen';
import { listConversations, getConversation, saveConversation, createConversationId, clearAllConversations } from '../../lib/chatHistory';
import './AIChatbotWidget.css';

// Widget entrance: the mascot lottie scales up and starts playing first,
// then the card (bubbles + input) scales up right after it — not both at once.
const WIDGET_MASCOT_DURATION = 0.55;
const WIDGET_CARD_DURATION = 0.6;

// Myra always "thinks" for at least this long before a reply lands, even
// when the underlying response (AI call or offline fallback) resolves
// almost instantly — otherwise it reads as an obviously canned response.
// Randomized per message so it doesn't feel like a fixed canned delay.
const MIN_THINKING_MS_RANGE = [900, 1300];
const randomThinkingMs = () =>
  Math.round(MIN_THINKING_MS_RANGE[0] + Math.random() * (MIN_THINKING_MS_RANGE[1] - MIN_THINKING_MS_RANGE[0]));

const promptSuggestions = [
  { text: 'Cheapest flight from Delhi to Spain', icon: '✈️' },
  { text: 'Plan a relaxing getaway for my parents...', icon: '🏖️' },
  { text: 'Best hotels in Goa under ₹5000', icon: '🏨' },
  { text: 'Weekend trips near Mumbai', icon: '🗺️' },
  { text: 'Family vacation packages to Kerala', icon: '👨‍👩‍👧‍👦' },
];

// Widget teaser bubbles — each split into an emphasized (blue) phrase and a
// muted phrase, matching which half reads as the "hook" in the reference.
const widgetPromptBubbles = [
  { lead: 'Cheapest flight', rest: 'from Delhi to Spain', emphasis: 'lead', align: 'right' },
  { lead: 'Plan a relaxing getaway for', rest: 'my parents...', emphasis: 'rest', align: 'left' },
];

const AIChatbotWidget = ({ isOpen, onClose, onOpen, isMobile }) => {
  const flow = useTripPlannerFlow();
  const [messages, setMessages] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [conversations, setConversations] = useState(() => listConversations());
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showWidget, setShowWidget] = useState(!isOpen);
  const [chatOpen, setChatOpen] = useState(isOpen || false);
  const messagesScrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen !== undefined) {
      setChatOpen(isOpen);
      setShowWidget(!isOpen);
    }
  }, [isOpen]);

  useEffect(() => {
    if (chatOpen) {
      setConversations(listConversations());
    }
  }, [chatOpen]);

  useChatAutoScroll({ messages, isTyping, containerRef: messagesScrollRef, kindField: 'type' });

  // Persist the active conversation to localStorage on every change, so it
  // shows up in the "pick up where you left off" list next time.
  useEffect(() => {
    if (activeConversationId && messages.length > 0) {
      saveConversation(activeConversationId, messages);
    }
  }, [activeConversationId, messages]);

  const ensureConversationId = () => {
    if (activeConversationId) return activeConversationId;
    const id = createConversationId();
    setActiveConversationId(id);
    return id;
  };

  const handleSelectConversation = (id) => {
    const conv = getConversation(id);
    if (!conv) return;
    setActiveConversationId(id);
    setMessages(conv.messages);
    setSyncStage('idle');

    // Screens past the trip form (hub/processing/result/closed) render off
    // `flow.session` / `flow.recommendation` — those only ever lived in
    // useTripPlannerFlow's React state, never in the persisted messages, so
    // a freshly mounted flow has them as null and those screens crash the
    // instant they render. Re-hydrate from whichever flow-bearing message
    // was last in this conversation before swapping the messages in.
    const lastFlowMsg = [...conv.messages].reverse().find((m) => m.sessionId);
    if (lastFlowMsg) {
      flow.restore({ sessionId: lastFlowMsg.sessionId, tripStep: lastFlowMsg.type });
    }
  };

  const handleClearHistory = () => {
    if (messages.length === 0 && conversations.length === 0) return;
    const ok = window.confirm('Delete all chat history? This cannot be undone.');
    if (!ok) return;
    clearAllConversations();
    setConversations([]);
    setMessages([]);
    setActiveConversationId(null);
  };

  // Action buttons (Launch sync mode, Create trip session, Enter hub) echo
  // as a user message first, instead of silently jumping to the next step.
  const echoUser = (text) => {
    ensureConversationId();
    setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'user', type: 'text', text }]);
  };

  const {
    thinkThen,
    handleLaunchSyncMode,
    handleTripFormSubmit,
    handleEnterHub,
    handleProceedToSynthesis,
    handleCompleteSynthesis,
    handleApprove,
  } = useChatFlowActions({ flow, setMessages, setIsTyping, echoUser, kindField: 'type' });

  const [syncStage, setSyncStage] = useState('idle'); // 'idle' | 'awaiting_confirmation' | 'confirmed'

  const isConfirmationReply = (text) =>
    /yes|yeah|sure|yep|ok|okay|let's|do it|sounds good|absolutely|definitely|go ahead|start|proceed|yup|affirmative/i.test(text);

  const isTripIntent = (text) =>
    /friends|trip|vacation|holiday|getaway|goa|manali|rishikesh|group|plan|flight|hotel|weekend|travel|squad|fly|stay|pack|explore/i.test(text);

  const handleSend = async (text) => {
    const msg = text || inputValue.trim();
    if (!msg || isTyping) return;

    ensureConversationId();
    const userMsg = { id: crypto.randomUUID(), role: 'user', type: 'text', text: msg };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');

    setIsTyping(true);
    const thinkStart = Date.now();
    const minThinkingMs = randomThinkingMs();

    // Whatever branch below resolves the reply, Myra shows "thinking" for at
    // least minThinkingMs before it lands — a near-instant response (fast
    // API, or the synchronous fallback branches) reads as fake otherwise.
    const waitOutMinThinkTime = async () => {
      const elapsed = Date.now() - thinkStart;
      if (elapsed < minThinkingMs) {
        await new Promise((resolve) => setTimeout(resolve, minThinkingMs - elapsed));
      }
    };

    // 1. Try OpenRouter AI first
    const aiResult = await generateMyraAIResponse(msg, messages);

    if (aiResult) {
      await waitOutMinThinkTime();
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'bot', type: 'text', text: aiResult.text }]);
      setIsTyping(false);

      if (aiResult.hasLaunchIntent) {
        setSyncStage('confirmed');
        const { kind, text: launchText } = flow.launchMessage();
        thinkThen({ type: kind, text: launchText }, minThinkingMs);
      } else if (aiResult.isAwaitingConfirmation) {
        setSyncStage('awaiting_confirmation');
      }
      return;
    }

    // 2. Offline Smart Fallback Engine
    // Step 2: User confirms after AI asked to try sync mode
    if (syncStage === 'awaiting_confirmation' && isConfirmationReply(msg)) {
      setSyncStage('confirmed');
      await waitOutMinThinkTime();
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'bot',
        type: 'text',
        text: "Awesome! Let's set up your group trip session...",
      }]);
      const { kind, text: launchText } = flow.launchMessage();
      thinkThen({ type: kind, text: launchText }, minThinkingMs);
      return;
    }

    // Step 1: User expresses trip intent
    if (syncStage === 'idle' && isTripIntent(msg)) {
      setSyncStage('awaiting_confirmation');
      await waitOutMinThinkTime();
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'bot',
        type: 'text',
        text: "Group trips are fantastic, but coordinating budgets, dates, and preferences across everyone can be tricky! 🏖️\n\nWould you like to enable **Group Sync Mode** so your friends can easily share their preferences via a quick 2-minute share link?",
      }]);
      setIsTyping(false);
      return;
    }

    // Off-topic / Irrelevant prompt fallback
    await waitOutMinThinkTime();
    setMessages(prev => [...prev, {
      id: crypto.randomUUID(),
      role: 'bot',
      type: 'text',
      text: "Welcome! 👋 This interactive prototype is tailored specifically to showcase MakeMyTrip's AI Group Travel Planning experience (Myra).\n\nTo test the prototype, try sending a message about planning a trip with your friends — for example: **'I want to plan a weekend trip to Rishikesh with my squad'**!",
    }]);
    setIsTyping(false);
  };

  const tripJoinUrl = flow.session ? `${window.location.origin}/join/${flow.session.id}` : '';

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const openChat = () => {
    setChatOpen(true);
    setShowWidget(false);
    if (onOpen) onOpen();
  };

  const closeChat = () => {
    setChatOpen(false);
    setShowWidget(true);
    // Leaving the chat returns to the landing screen next time — any
    // conversation so far is already persisted, so nothing is lost.
    setMessages([]);
    setActiveConversationId(null);
    if (onClose) onClose();
  };

  const scrollMessagesDown = () => {
    const el = messagesScrollRef.current;
    if (el) el.scrollBy({ top: 220, behavior: 'smooth' });
  };

  const renderChatBody = (rootClassName) => {
    return (
      <ChatFlowShell
        rootClassName={rootClassName}
        onClose={closeChat}
        onClearHistory={handleClearHistory}
        messagesRef={messagesScrollRef}
        belowMessages={messages.length > 0 && <ScrollHintButton onClick={scrollMessagesDown} />}
        footer={flow.tripStep !== 'form' && (
          <ChatInputBar
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onSend={() => handleSend()}
            onKeyDown={handleKeyDown}
            inputRef={inputRef}
          />
        )}
      >
        {messages.length === 0 ? (
          <ChatLandingScreen
            conversations={conversations}
            suggestions={promptSuggestions.slice(0, 3)}
            onSelectSuggestion={handleSend}
            onSelectConversation={handleSelectConversation}
          />
        ) : (
          <>
            {messages.map((msg) => (
                <MessageBlock key={msg.id}>
                  {msg.role === 'user' ? (
                    <UserBubble text={msg.text} />
                  ) : (
                    <>
                      {msg.type !== 'processing' && <BotTextResponse text={msg.text} />}
                      {msg.type === 'destinations' && msg.destinations && (
                        <FollowUpReveal text={msg.text}>
                          <DestinationCarousel destinations={msg.destinations} />
                        </FollowUpReveal>
                      )}
                      {msg.type === 'launch' && (
                        <FollowUpReveal text={msg.text}>
                          <GradientSweepButton onClick={handleLaunchSyncMode} className="launch-sync-btn">
                            Launch sync mode
                          </GradientSweepButton>
                        </FollowUpReveal>
                      )}
                      {msg.type === 'form' && (
                        <FollowUpReveal text={msg.text}>
                          <IntentFormCard onSubmit={handleTripFormSubmit} />
                        </FollowUpReveal>
                      )}
                      {msg.type === 'share' && (
                        <FollowUpReveal text={msg.text}>
                          <LinkShareCard
                            joinUrl={tripJoinUrl || `${window.location.origin}/join/${flow.session?.id || 'demo'}`}
                            onEnterHub={handleEnterHub}
                          />
                        </FollowUpReveal>
                      )}
                      {msg.type === 'hub' && (
                        <FollowUpReveal text={msg.text}>
                          <LiveAggregationHub session={flow.session} onProceed={handleProceedToSynthesis} />
                        </FollowUpReveal>
                      )}
                      {msg.type === 'processing' && (
                        <FollowUpReveal text={msg.text}>
                          <ProcessingScreen onComplete={handleCompleteSynthesis} />
                        </FollowUpReveal>
                      )}
                      {msg.type === 'result' && (
                        <FollowUpReveal text={msg.text}>
                          <SynthesisResult
                            recommendation={flow.recommendation}
                            onUpdate={flow.updateRecommendation}
                            onApprove={handleApprove}
                            scrollContainerRef={messagesScrollRef}
                          />
                        </FollowUpReveal>
                      )}
                      {msg.type === 'closed' && (
                        <FollowUpReveal text={msg.text}>
                          <TripSummaryCard recommendation={flow.recommendation} />
                        </FollowUpReveal>
                      )}
                      {!['launch', 'form', 'share', 'hub', 'processing', 'result', 'closed'].includes(msg.type) && (
                        <FollowUpReveal text={msg.text}>
                          <MessageActions />
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
        )}
      </ChatFlowShell>
    );
  };

  return (
    <>
      {/* Floating Widget (Desktop only, collapsed state) */}
      {showWidget && !isMobile && (
        <div className="chatbot-floating-widget" onClick={openChat}>
          <motion.div
            className="widget-mascot-wrap"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: WIDGET_MASCOT_DURATION, ease: EASE }}
          >
            <div className="widget-mascot-shadow" />
            <div className="widget-mascot">
              <MyraAvatar size="100%" />
            </div>
          </motion.div>

          <motion.div
            className="widget-card"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: WIDGET_CARD_DURATION, ease: EASE, delay: WIDGET_MASCOT_DURATION }}
          >
            <button className="widget-close" onClick={(e) => { e.stopPropagation(); setShowWidget(false); }}>
              <X size={16} />
            </button>

            <div className="widget-card-glow" />

            <div className="widget-prompts">
              {widgetPromptBubbles.map((b, i) => (
                <div key={i} className={`widget-prompt-bubble widget-prompt-bubble--${b.align}`}>
                  <span className={b.emphasis === 'lead' ? 'widget-bubble-accent' : 'widget-bubble-muted'}>{b.lead}</span>{' '}
                  <span className={b.emphasis === 'rest' ? 'widget-bubble-accent' : 'widget-bubble-muted'}>{b.rest}</span>
                </div>
              ))}
            </div>

            <div className="widget-input-preview">
              <span>Where do you want to go?</span>
              <Sparkles size={16} className="icon-blue" />
            </div>
          </motion.div>
        </div>
      )}

      {/* Mobile Chat Sheet */}
      {chatOpen && isMobile && (
        <>
          <div className="chat-sheet-backdrop" onClick={closeChat} />
          {renderChatBody('chat-sheet')}
        </>
      )}

      {/* Desktop Chat Panel — same Myra components, docked panel shell */}
      {chatOpen && !isMobile && renderChatBody('chatbot-panel')}
    </>
  );
};

export default AIChatbotWidget;
