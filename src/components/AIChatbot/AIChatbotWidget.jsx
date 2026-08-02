import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import ChatFlowShell from './ChatFlowShell';
import ChatRedirectState from './ChatRedirectState';
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

const promptSuggestions = [
  { text: 'Cheapest flight from Delhi to Spain', icon: '✈️' },
  { text: 'Plan a relaxing getaway for my parents...', icon: '🏖️' },
  { text: 'Best hotels in Goa under ₹5000', icon: '🏨' },
  { text: 'Weekend trips near Mumbai', icon: '🗺️' },
  { text: 'Family vacation packages to Kerala', icon: '👨‍👩‍👧‍👦' },
];

const flightResults = [
  { airline: 'IndiGo', code: '6E 2154', depart: '06:25', arrive: '09:10', duration: '2h 45m', stops: 'Non Stop', price: '₹4,562', logo: '🔵' },
  { airline: 'Air India', code: 'AI 812', depart: '08:00', arrive: '10:55', duration: '2h 55m', stops: 'Non Stop', price: '₹5,120', logo: '🟠' },
  { airline: 'Vistara', code: 'UK 823', depart: '11:30', arrive: '14:20', duration: '2h 50m', stops: 'Non Stop', price: '₹5,890', logo: '🟣' },
  { airline: 'Akasa Air', code: 'QP 1347', depart: '15:45', arrive: '18:50', duration: '3h 05m', stops: '1 Stop', price: '₹3,899', logo: '🟡' },
];

const hotelResults = [
  { name: 'Taj Holiday Village', location: 'Candolim, Goa', rating: 4.5, reviews: 2841, price: '₹4,200', perNight: '/night', image: '🏨' },
  { name: 'The Leela Goa', location: 'Cavelossim, Goa', rating: 4.7, reviews: 3102, price: '₹6,800', perNight: '/night', image: '🏖️' },
];

const destinationResults = [
  { id: 1, name: 'Thailand', location: 'Thailand', image: 'https://picsum.photos/seed/thailand-trip/400/300' },
  { id: 2, name: 'Bangkok', location: 'Phuket, Thailand', image: 'https://picsum.photos/seed/bangkok-trip/400/300' },
  { id: 3, name: 'Bali', location: 'Indonesia', image: 'https://picsum.photos/seed/bali-trip/400/300' },
  { id: 4, name: 'Vietnam', location: 'Vietnam', image: 'https://picsum.photos/seed/vietnam-trip/400/300' },
  { id: 5, name: 'Singapore', location: 'Singapore', image: 'https://picsum.photos/seed/singapore-trip/400/300' },
  { id: 6, name: 'Maldives', location: 'Maldives', image: 'https://picsum.photos/seed/maldives-trip/400/300' },
  { id: 7, name: 'Sri Lanka', location: 'Sri Lanka', image: 'https://picsum.photos/seed/srilanka-trip/400/300' },
  { id: 8, name: 'Dubai', location: 'UAE', image: 'https://picsum.photos/seed/dubai-trip/400/300' },
  { id: 9, name: 'Malaysia', location: 'Malaysia', image: 'https://picsum.photos/seed/malaysia-trip/400/300' },
];

const generateBotResponse = (userMsg) => {
  const lower = userMsg.toLowerCase();

  if (lower.includes('flight') || lower.includes('cheapest') || lower.includes('fly')) {
    return {
      type: 'flights',
      text: 'Here are the best flight options I found for you:',
      results: flightResults,
    };
  }

  if (lower.includes('hotel') || lower.includes('stay') || lower.includes('goa')) {
    return {
      type: 'hotels',
      text: 'Here are some highly-rated hotels I recommend:',
      results: hotelResults,
    };
  }

  if (lower.includes('plan') || lower.includes('getaway') || lower.includes('vacation') || lower.includes('trip')) {
    return {
      type: 'destinations',
      text: "Southeast Asia offers a fantastic blend of vibrant culture, stunning landscapes, and delicious food, all within your budget. The key is to choose a destination that balances affordability with unique experiences.\n\n1. **Thailand**: The Classic Choice\n- **What makes it great:** Thailand is renowned for its incredible value, from street food to luxury resorts, offering something for every traveller in your group.",
      destinations: destinationResults,
    };
  }

  return {
    type: 'text',
    text: "That's a great question! I can help you find flights, hotels, and plan complete trips. Try asking me about specific destinations, and I'll find the best deals for you! 🌍",
  };
};

const AIChatbotWidget = ({ isOpen, onClose, isMobile }) => {
  const flow = useTripPlannerFlow();
  const [messages, setMessages] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [conversations, setConversations] = useState(() => listConversations());
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showWidget, setShowWidget] = useState(!isOpen);
  const [chatOpen, setChatOpen] = useState(isOpen || false);
  const [showRedirect, setShowRedirect] = useState(false);
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
      setShowRedirect(true);
      const t = setTimeout(() => setShowRedirect(false), 800);
      return () => clearTimeout(t);
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
    if (conv) {
      setActiveConversationId(id);
      setMessages(conv.messages);
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

    // 1. Try OpenRouter AI first
    const aiResult = await generateMyraAIResponse(msg, messages);

    if (aiResult) {
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'bot', type: 'text', text: aiResult.text }]);
      setIsTyping(false);

      if (aiResult.hasLaunchIntent) {
        setSyncStage('confirmed');
        const { kind, text: launchText } = flow.launchMessage();
        thinkThen({ type: kind, text: launchText }, 800);
      } else if (aiResult.isAwaitingConfirmation) {
        setSyncStage('awaiting_confirmation');
      }
      return;
    }

    // 2. Offline Smart Fallback Engine
    // Step 2: User confirms after AI asked to try sync mode
    if (syncStage === 'awaiting_confirmation' && isConfirmationReply(msg)) {
      setSyncStage('confirmed');
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: crypto.randomUUID(),
          role: 'bot',
          type: 'text',
          text: "Awesome! Let's set up your group trip session...",
        }]);
        const { kind, text: launchText } = flow.launchMessage();
        thinkThen({ type: kind, text: launchText }, 800);
      }, 600);
      return;
    }

    // Step 1: User expresses trip intent
    if (syncStage === 'idle' && isTripIntent(msg)) {
      setSyncStage('awaiting_confirmation');
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: crypto.randomUUID(),
          role: 'bot',
          type: 'text',
          text: "Group trips are fantastic, but coordinating budgets, dates, and preferences across everyone can be tricky! 🏖️\n\nWould you like to enable **Group Sync Mode** so your friends can easily share their preferences via a quick 2-minute share link?",
        }]);
        setIsTyping(false);
      }, 700);
      return;
    }

    // Off-topic / Irrelevant prompt fallback
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'bot',
        type: 'text',
        text: "Welcome! 👋 This interactive prototype is tailored specifically to showcase MakeMyTrip's AI Group Travel Planning experience (MyRA).\n\nTo test the prototype, try sending a message about planning a trip with your friends — for example: **'I want to plan a weekend trip to Rishikesh with my squad'**!",
      }]);
      setIsTyping(false);
    }, 700);
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
        belowMessages={!showRedirect && messages.length > 0 && <ScrollHintButton onClick={scrollMessagesDown} />}
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
        {showRedirect ? (
          <ChatRedirectState label="Myra" />
        ) : messages.length === 0 ? (
          <ChatLandingScreen
            conversations={conversations}
            suggestions={promptSuggestions.slice(0, 3)}
            onSelectSuggestion={handleSend}
            onSelectConversation={handleSelectConversation}
          />
        ) : (
          <>
            <AnimatePresence initial={false}>
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
                      {msg.type === 'share' && flow.session && (
                        <FollowUpReveal text={msg.text}>
                          <LinkShareCard joinUrl={tripJoinUrl} onEnterHub={handleEnterHub} />
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
            </AnimatePresence>
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
          <div className="widget-mascot">
            <MyraAvatar size="100%" />
          </div>
          <div className="widget-prompts">
            {promptSuggestions.slice(0, 2).map((s, i) => (
              <div key={i} className="widget-prompt-pill">
                <span>{s.text}</span>
              </div>
            ))}
          </div>
          <div className="widget-input-preview">
            <span>Where do you want to go?</span>
            <Sparkles size={16} className="icon-blue" />
          </div>
          <button className="widget-close" onClick={(e) => { e.stopPropagation(); setShowWidget(false); }}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Mobile Chat Sheet */}
      {chatOpen && isMobile && (
        <>
          <div className="chat-sheet-backdrop" onClick={closeChat} />
          {renderChatBody('chat-sheet')}
        </>
      )}

      {/* Desktop Chat Panel — same MyRA components, docked panel shell */}
      {chatOpen && !isMobile && renderChatBody('chatbot-panel')}
    </>
  );
};

export default AIChatbotWidget;
