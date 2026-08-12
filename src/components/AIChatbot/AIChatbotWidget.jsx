import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { EASE } from './motionConfig';
import ChatFlowShell from './ChatFlowShell';
import { UserBubble, BotTextResponse, DestinationCarousel, MessageActions, MessageBlock, FollowUpReveal, ConfirmActions } from './ChatMessages';
import TypingIndicator from './TypingIndicator';
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

// Shown as the off-topic fallback, and reused verbatim once the organizer
// exits Group Sync mode — after exiting, the demo stays on this canned
// reply for anything typed next instead of re-detecting trip intent.
const GENERIC_PROMPT_MESSAGE = "Welcome! 👋 This interactive prototype is tailored specifically to showcase MakeMyTrip's AI Group Travel Planning experience (Myra).\n\nTo test the prototype, try sending a message about planning a trip with your friends — for example: **'I want to plan a weekend trip to Rishikesh with my squad'**!";

const promptSuggestions = [
  { text: 'Plan a trip with my friends', icon: '🧑‍🤝‍🧑' },
  { text: 'Plan a trip for my family', icon: '👨‍👩‍👧‍👦' },
  { text: 'Plan a romantic getaway with my partner', icon: '💑' },
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

  // Lock the page behind the chat from scrolling while it's open — without
  // this, wheel/touch input over the chat (or chaining past the message
  // list's top/bottom edge) visibly scrolls the homepage underneath.
  useEffect(() => {
    if (!chatOpen) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
    };
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

  const handleSelectConversation = async (id) => {
    const conv = getConversation(id);
    if (!conv) return;

    // Screens past the trip form (hub/processing/result/closed) render off
    // `flow.session` / `flow.recommendation` — those only ever lived in
    // useTripPlannerFlow's React state, never in the persisted messages, so
    // a freshly mounted flow (e.g. right after a page reload) has them as
    // null and those screens crash the instant they render. Re-hydrate from
    // whichever flow-bearing message was last in this conversation and wait
    // for it to land BEFORE swapping the messages in, so we never render a
    // hub/result/closed screen against a still-null session/recommendation.
    const lastFlowMsg = [...conv.messages].reverse().find((m) => m.sessionId);
    if (lastFlowMsg) {
      await flow.restore({ sessionId: lastFlowMsg.sessionId, tripStep: lastFlowMsg.type });
    }

    setActiveConversationId(id);
    setMessages(conv.messages);
    setSyncStage('idle');
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
    handleEmptyProceedAttempt,
    handleConfirmEmptyProceedYes,
    handleConfirmEmptyProceedNo,
    handleCompleteSynthesis,
    handleApprove,
    handleEditAfterApprove,
    handleExtendRound,
    handleChooseRiskOption,
    handleCompleteRiskChoiceResolution,
  } = useChatFlowActions({ flow, setMessages, setIsTyping, echoUser, kindField: 'type' });

  const [syncStage, setSyncStage] = useState('idle'); // 'idle' | 'awaiting_confirmation' | 'confirmed'
  // Once true, Group Sync mode was exited on purpose — the chat stays open
  // (nothing is cleared), but any further input gets the generic demo
  // prompt instead of re-detecting trip intent and re-offering sync mode.
  const [syncExited, setSyncExited] = useState(false);

  // "Show more options" (SynthesisResult.jsx's edit/swap screen) is driven
  // through this real chat input rather than a field of its own — tapping
  // that button sets which category is waiting for the next message
  // (surfaces a tooltip on the input, see ChatInputBar below); the next
  // message sent is routed to that category's search instead of the normal
  // AI/offline reply logic, then handed back down as `moreOptionsQuery`.
  const [moreOptionsCategory, setMoreOptionsCategory] = useState(null);
  const [moreOptionsQuery, setMoreOptionsQuery] = useState(null);

  const isConfirmationReply = (text) =>
    /yes|yeah|sure|yep|ok|okay|let's|do it|sounds good|absolutely|definitely|go ahead|start|proceed|yup|affirmative/i.test(text);

  const isTripIntent = (text) =>
    /friends|trip|vacation|holiday|getaway|goa|manali|rishikesh|group|plan|flight|hotel|weekend|travel|squad|fly|stay|pack|explore/i.test(text);

  // Exit-flow edge case — once Group Sync mode has actually started
  // (past the pre-launch intro step), typing "exit" asks for confirmation
  // instead of falling through to the AI/offline reply logic below.
  const handleExitAttempt = () => {
    ensureConversationId();
    echoUser('exit');
    thinkThen({ type: 'exit_confirm', text: "Are you sure you want to exit? This will reset the demo and take you back to the start." }, 500);
  };

  const handleConfirmExitYes = () => {
    setIsTyping(true);
    setTimeout(() => {
      flow.reset();
      setSyncStage('idle');
      setSyncExited(true);
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'bot',
        type: 'text',
        text: "Okay, you've exited Group Sync mode. You can keep chatting here.",
      }]);
      setIsTyping(false);
    }, 500);
  };

  const handleConfirmExitNo = () => {
    echoUser('No, stay');
    thinkThen({ type: 'text', text: "No worries — let's pick up right where we left off." }, 600);
  };

  const handleSend = async (text) => {
    const msg = text || inputValue.trim();
    if (!msg || isTyping) return;

    if (flow.tripStep !== 'intro' && /^exit$/i.test(msg.trim())) {
      setInputValue('');
      handleExitAttempt();
      return;
    }

    if (moreOptionsCategory) {
      // Deliberately not pushed to `messages` — the query isn't shown as a
      // chat bubble, it's handled entirely inside the still-open edit
      // screen (loader -> new cards). Pushing it would also re-trigger
      // useChatAutoScroll's scroll-to-bottom on .chat-sheet-messages, the
      // same container the edit screen is absolutely positioned inside —
      // that scroll would carry the edit screen out of view and make it
      // look like the user got bounced back to the chat underneath it.
      const category = moreOptionsCategory;
      setInputValue('');
      setMoreOptionsCategory(null);
      setMoreOptionsQuery({ categoryKey: category, query: msg, nonce: Date.now() });
      return;
    }

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

    // Post-exit demo dead-end — once Group Sync mode has been exited on
    // purpose, keep replying with the generic prompt instead of letting the
    // AI or offline intent-detection silently re-launch sync mode.
    if (syncExited) {
      await waitOutMinThinkTime();
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'bot', type: 'text', text: GENERIC_PROMPT_MESSAGE }]);
      setIsTyping(false);
      return;
    }

    // 1. Deterministic Smart Fallback Engine runs FIRST for state-machine
    // transitions. Trip-intent/confirmation keywords must reliably open
    // Group Sync Mode — the AI can't be trusted on the critical path here:
    // cheap free models sometimes misjudge a mid-flow reply (e.g. the user
    // repeating "trip"/"friends"/"squad" instead of a crisp "yes") as
    // off-topic and echo the generic welcome text back, trapping the user
    // in a loop. Keyword matching has no such failure mode.
    // Step 2: user confirms (or simply repeats trip-related words) after
    // being asked to try sync mode.
    if (syncStage === 'awaiting_confirmation' && (isConfirmationReply(msg) || isTripIntent(msg))) {
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

    // Step 1: user expresses trip intent for the first time.
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

    // 2. Neither deterministic check matched (genuinely open-ended or
    // off-topic message) — try OpenRouter AI for a nicer conversational
    // reply, with instant fallback to the generic prompt below.
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

    // Off-topic / Irrelevant prompt fallback
    await waitOutMinThinkTime();
    setMessages(prev => [...prev, {
      id: crypto.randomUUID(),
      role: 'bot',
      type: 'text',
      text: GENERIC_PROMPT_MESSAGE,
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

  const renderChatBody = (rootClassName) => {
    return (
      <ChatFlowShell
        rootClassName={rootClassName}
        onClose={closeChat}
        onClearHistory={handleClearHistory}
        messagesRef={messagesScrollRef}
        footer={flow.tripStep !== 'form' && (
          <ChatInputBar
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onSend={() => handleSend()}
            onKeyDown={handleKeyDown}
            inputRef={inputRef}
            tooltip={moreOptionsCategory ? "Chat with your preferences on what you'd like to see instead" : null}
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
                      {msg.type !== 'processing' && msg.type !== 'risk_processing' && <BotTextResponse text={msg.text} />}
                      {msg.type === 'zero_response_confirm' && (
                        <FollowUpReveal text={msg.text}>
                          <ConfirmActions>
                            <button type="button" className="btn-secondary" onClick={handleConfirmEmptyProceedYes}>Yes, continue</button>
                            <button type="button" className="btn-secondary" onClick={handleConfirmEmptyProceedNo}>No, wait</button>
                          </ConfirmActions>
                        </FollowUpReveal>
                      )}
                      {msg.type === 'exit_confirm' && (
                        <FollowUpReveal text={msg.text}>
                          <ConfirmActions>
                            <button type="button" className="btn-secondary" onClick={handleConfirmExitYes}>Yes, exit</button>
                            <button type="button" className="btn-secondary" onClick={handleConfirmExitNo}>No, stay</button>
                          </ConfirmActions>
                        </FollowUpReveal>
                      )}
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
                          />
                        </FollowUpReveal>
                      )}
                      {msg.type === 'self_ack' && (
                        <FollowUpReveal text={msg.text}>
                          <GradientSweepButton onClick={handleEnterHub} className="link-share-hub-btn">
                            Look at the live responses
                          </GradientSweepButton>
                        </FollowUpReveal>
                      )}
                      {msg.type === 'hub' && (
                        <FollowUpReveal text={msg.text}>
                          {flow.session ? (
                            <LiveAggregationHub session={flow.session} onProceed={handleProceedToSynthesis} onEmptyProceedAttempt={handleEmptyProceedAttempt} />
                          ) : (
                            <BotTextResponse text="This trip session couldn't be restored — it may have been cleared from this browser." />
                          )}
                        </FollowUpReveal>
                      )}
                      {msg.type === 'processing' && (
                        <FollowUpReveal text={msg.text}>
                          <ProcessingScreen onComplete={handleCompleteSynthesis} />
                        </FollowUpReveal>
                      )}
                      {msg.type === 'risk_processing' && (
                        <FollowUpReveal text={msg.text}>
                          <ProcessingScreen onComplete={handleCompleteRiskChoiceResolution} />
                        </FollowUpReveal>
                      )}
                      {msg.type === 'result' && (
                        <FollowUpReveal text={msg.text}>
                          {flow.recommendation ? (
                            <SynthesisResult
                              recommendation={flow.recommendation}
                              onUpdate={flow.updateRecommendation}
                              onApprove={handleApprove}
                              onExtendRound={handleExtendRound}
                              onChooseRiskOption={handleChooseRiskOption}
                              scrollContainerRef={messagesScrollRef}
                              onMoreOptionsCategoryChange={setMoreOptionsCategory}
                              moreOptionsActiveCategory={moreOptionsCategory}
                              moreOptionsQuery={moreOptionsQuery}
                            />
                          ) : (
                            <BotTextResponse text="This recommendation couldn't be restored — the trip session may have been cleared from this browser." />
                          )}
                        </FollowUpReveal>
                      )}
                      {msg.type === 'closed' && (
                        <FollowUpReveal text={msg.text}>
                          {flow.recommendation ? (
                            <TripSummaryCard recommendation={flow.recommendation} onEdit={handleEditAfterApprove} />
                          ) : (
                            <BotTextResponse text="This trip summary couldn't be restored — the trip session may have been cleared from this browser." />
                          )}
                        </FollowUpReveal>
                      )}
                      {!['launch', 'form', 'share', 'self_ack', 'hub', 'processing', 'risk_processing', 'result', 'closed', 'zero_response_confirm', 'exit_confirm'].includes(msg.type) && (
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
