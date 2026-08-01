import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Mic, Bot, Sparkles, ChevronRight } from 'lucide-react';
import ChatHeader from './ChatHeader';
import ChatRedirectState from './ChatRedirectState';
import { UserBubble, BotTextResponse, DestinationCarousel, MessageActions } from './ChatMessages';
import ScrollHintButton from './ScrollHintButton';
import ChatInputBar from './ChatInputBar';
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
  { id: 1, name: 'Thailand', location: 'Thailand', gradient: 'var(--gradient-hero)' },
  { id: 2, name: 'Bangkok', location: 'Phuket, Thailand', gradient: 'var(--gradient-btn-primary)' },
  { id: 3, name: 'Bali', location: 'Indonesia', gradient: 'var(--gradient-myra)' },
  { id: 4, name: 'Vietnam', location: 'Vietnam', gradient: 'linear-gradient(160deg, #003b95 0%, #008cff 100%)' },
  { id: 5, name: 'Singapore', location: 'Singapore', gradient: 'linear-gradient(160deg, var(--mmt-red-dark) 0%, var(--mmt-red) 100%)' },
  { id: 6, name: 'Maldives', location: 'Maldives', gradient: 'linear-gradient(160deg, #14b8c4 0%, #065af3 100%)' },
  { id: 7, name: 'Sri Lanka', location: 'Sri Lanka', gradient: 'linear-gradient(160deg, #764ba2 0%, #667eea 100%)' },
  { id: 8, name: 'Dubai', location: 'UAE', gradient: 'linear-gradient(160deg, #051322 0%, #15457c 100%)' },
  { id: 9, name: 'Malaysia', location: 'Malaysia', gradient: 'linear-gradient(160deg, #f093fb 0%, #764ba2 100%)' },
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
    if (chatOpen && isMobile) {
      setShowRedirect(true);
      const t = setTimeout(() => setShowRedirect(false), 1300);
      return () => clearTimeout(t);
    }
  }, [chatOpen, isMobile]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (text) => {
    const msg = text || inputValue.trim();
    if (!msg) return;

    const userMsg = { id: Date.now(), role: 'user', type: 'text', text: msg };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const response = generateBotResponse(msg);
      const botMsg = { id: Date.now() + 1, role: 'bot', ...response };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1200 + Math.random() * 800);
  };

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

  return (
    <>
      {/* Floating Widget (Desktop only) */}
      {showWidget && !isMobile && (
        <div className="chatbot-floating-widget" onClick={openChat}>
          <div className="widget-mascot">
            <Bot size={28} className="icon-white" />
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
          <div className="chat-sheet">
            <ChatHeader onClose={closeChat} />

            {showRedirect ? (
              <ChatRedirectState label="Myra" />
            ) : (
              <>
                <div className="chat-sheet-messages" ref={messagesScrollRef}>
                  {messages.map((msg) => (
                    <div key={msg.id} className="chat-sheet-msg-block">
                      {msg.role === 'user' ? (
                        <UserBubble text={msg.text} />
                      ) : (
                        <>
                          <BotTextResponse text={msg.text} />
                          {msg.type === 'destinations' && msg.destinations && (
                            <DestinationCarousel destinations={msg.destinations} />
                          )}
                          <MessageActions />
                        </>
                      )}
                    </div>
                  ))}

                  {isTyping && (
                    <div className="chat-sheet-msg-block">
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
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <ScrollHintButton onClick={scrollMessagesDown} />
              </>
            )}

            <ChatInputBar
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onSend={() => handleSend()}
              onKeyDown={handleKeyDown}
              inputRef={inputRef}
            />
          </div>
        </>
      )}

      {/* Desktop Chat Panel */}
      {chatOpen && !isMobile && (
        <div className="chatbot-panel">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-left">
              <div className="chatbot-avatar">
                <Bot size={22} className="icon-white" />
              </div>
              <div className="chatbot-header-info">
                <span className="chatbot-name">myra.AI</span>
                <span className="chatbot-status">
                  <span className="status-dot" />
                  Online
                </span>
              </div>
            </div>
            <button className="chatbot-close-btn" onClick={closeChat}>
              <X size={18} className="icon-white" />
            </button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`chat-message ${msg.role}`}>
                {msg.role === 'bot' && (
                  <div className="bot-avatar-sm">
                    <Bot size={14} className="icon-white" />
                  </div>
                )}
                <div className={`message-bubble ${msg.role}-bubble`}>
                  <p className="message-text">{msg.text}</p>

                  {/* Flight Results */}
                  {msg.type === 'flights' && msg.results && (
                    <div className="chat-results-list">
                      {msg.results.map((f, i) => (
                        <div key={i} className="chat-flight-card">
                          <div className="flight-card-top">
                            <span className="flight-logo">{f.logo}</span>
                            <div className="flight-airline-info">
                              <span className="flight-airline">{f.airline}</span>
                              <span className="flight-code">{f.code}</span>
                            </div>
                            <span className="flight-price">{f.price}</span>
                          </div>
                          <div className="flight-card-bottom">
                            <span className="flight-time">{f.depart}</span>
                            <div className="flight-duration-bar">
                              <span className="flight-duration">{f.duration}</span>
                              <div className="duration-line">
                                <span className="duration-dot start" />
                                <span className="duration-track" />
                                <span className="duration-dot end" />
                              </div>
                              <span className="flight-stops">{f.stops}</span>
                            </div>
                            <span className="flight-time">{f.arrive}</span>
                          </div>
                          <button className="flight-book-btn">Book Now <ChevronRight size={14} /></button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Hotel Results */}
                  {msg.type === 'hotels' && msg.results && (
                    <div className="chat-results-list">
                      {msg.results.map((h, i) => (
                        <div key={i} className="chat-hotel-card">
                          <div className="hotel-card-icon">{h.image}</div>
                          <div className="hotel-card-info">
                            <span className="hotel-name">{h.name}</span>
                            <span className="hotel-location">{h.location}</span>
                            <div className="hotel-rating">
                              <span className="rating-badge">★ {h.rating}</span>
                              <span className="rating-count">({h.reviews} reviews)</span>
                            </div>
                          </div>
                          <div className="hotel-card-price">
                            <span className="hotel-price">{h.price}</span>
                            <span className="hotel-per-night">{h.perNight}</span>
                            <button className="hotel-view-btn">View</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="chat-message bot">
                <div className="bot-avatar-sm">
                  <Bot size={14} className="icon-white" />
                </div>
                <div className="message-bubble bot-bubble typing-bubble">
                  <div className="typing-indicator">
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          {messages.length <= 1 && (
            <div className="chatbot-quick-prompts">
              {promptSuggestions.map((s, i) => (
                <button
                  key={i}
                  className="quick-prompt-pill"
                  onClick={() => handleSend(s.text)}
                >
                  <span className="prompt-emoji">{s.icon}</span>
                  <span>{s.text}</span>
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="chatbot-input-area">
            <div className="chatbot-input-wrapper">
              <input
                ref={inputRef}
                type="text"
                placeholder="Where do you want to go?"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="chatbot-input"
              />
              <button className="chatbot-mic-btn" aria-label="Voice input">
                <Mic size={18} />
              </button>
              <button
                className={`chatbot-send-btn ${inputValue.trim() ? 'active' : ''}`}
                onClick={() => handleSend()}
                disabled={!inputValue.trim()}
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatbotWidget;
