import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { X, Bot, Sparkles } from 'lucide-react';
import ChatFlowShell from './ChatFlowShell';
import ChatRedirectState from './ChatRedirectState';
import { UserBubble, BotTextResponse, DestinationCarousel, MessageActions, MessageBlock } from './ChatMessages';
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
import '../../pages/TripPlanner/TripPlanner.css';
import MyraAvatar from './MyraAvatar';
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
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'bot',
      type: 'text',
      text: "Hi there! 👋 I'm MyRA, your AI travel assistant. I can help you find the best flights, hotels, and plan amazing trips. What would you like to explore today?",
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showWidget, setShowWidget] = useState(!isOpen);
  const [chatOpen, setChatOpen] = useState(isOpen || false);
  const [showRedirect, setShowRedirect] = useState(false);
  const messagesEndRef = useRef(null);
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
      setShowRedirect(true);
      const t = setTimeout(() => setShowRedirect(false), 1300);
      return () => clearTimeout(t);
    }
  }, [chatOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Every bot turn "thinks" briefly before landing, instead of popping in
  // instantly.
  const thinkThen = (kind, text, delay = 1400) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'bot', type: kind, text }]);
      setIsTyping(false);
    }, delay);
  };

  const handleSend = (text) => {
    const msg = text || inputValue.trim();
    if (!msg || isTyping) return;

    const userMsg = { id: Date.now(), role: 'user', type: 'text', text: msg };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');

    if (flow.tripStep === 'intro' && flow.detectsTripIntent(msg)) {
      const { kind, text: launchText } = flow.launchMessage();
      thinkThen(kind, launchText, 1500);
      return;
    }

    setIsTyping(true);
    setTimeout(() => {
      const response = generateBotResponse(msg);
      const botMsg = { id: Date.now() + 1, role: 'bot', ...response };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1200 + Math.random() * 800);
  };

  const handleLaunchSyncMode = () => {
    const { kind, text } = flow.startForm();
    thinkThen(kind, text, 1400);
  };

  const handleTripFormSubmit = (formValues) => {
    const { message } = flow.submitForm(formValues);
    thinkThen(message.kind, message.text, 1800);
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
    if (onClose) onClose();
  };

  const scrollMessagesDown = () => {
    const el = messagesScrollRef.current;
    if (el) el.scrollBy({ top: 220, behavior: 'smooth' });
  };

  const renderChatBody = (rootClassName) => {
    if (chatOpen && !showRedirect && flow.tripStep === 'hub') {
      return (
        <ChatFlowShell rootClassName={rootClassName} onClose={closeChat}>
          <LiveAggregationHub session={flow.session} onProceed={flow.startSynthesis} />
        </ChatFlowShell>
      );
    }

    if (chatOpen && !showRedirect && flow.tripStep === 'processing') {
      return (
        <ChatFlowShell rootClassName={rootClassName} onClose={closeChat}>
          <ProcessingScreen onComplete={flow.completeSynthesis} />
        </ChatFlowShell>
      );
    }

    if (chatOpen && !showRedirect && flow.tripStep === 'result') {
      return (
        <ChatFlowShell rootClassName={rootClassName} onClose={closeChat}>
          <SynthesisResult
            recommendation={flow.recommendation}
            onUpdate={flow.updateRecommendation}
            onApprove={flow.approve}
          />
        </ChatFlowShell>
      );
    }

    if (chatOpen && !showRedirect && flow.tripStep === 'closed') {
      return (
        <ChatFlowShell rootClassName={rootClassName} onClose={closeChat}>
          <TripSummaryCard recommendation={flow.recommendation} />
        </ChatFlowShell>
      );
    }

    return (
      <ChatFlowShell
        rootClassName={rootClassName}
        onClose={closeChat}
        messagesRef={messagesScrollRef}
        belowMessages={!showRedirect && <ScrollHintButton onClick={scrollMessagesDown} />}
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
        ) : (
          <>
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <MessageBlock key={msg.id}>
                  {msg.role === 'user' ? (
                    <UserBubble text={msg.text} />
                  ) : (
                    <>
                      <BotTextResponse text={msg.text} />
                      {msg.type === 'destinations' && msg.destinations && (
                        <DestinationCarousel destinations={msg.destinations} />
                      )}
                      {msg.type === 'launch' && (
                        <GradientSweepButton onClick={handleLaunchSyncMode} className="launch-sync-btn">
                          Launch sync mode
                        </GradientSweepButton>
                      )}
                      {msg.type === 'form' && <IntentFormCard onSubmit={handleTripFormSubmit} />}
                      {msg.type === 'share' && flow.session && (
                        <LinkShareCard joinUrl={tripJoinUrl} onEnterHub={flow.enterHub} />
                      )}
                      {msg.type !== 'launch' && msg.type !== 'form' && msg.type !== 'share' && <MessageActions />}
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
