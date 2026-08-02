import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Bookmark, MapPin, ThumbsUp, ThumbsDown, Copy } from 'lucide-react';

const blockTransition = { duration: 0.65, ease: [0.16, 1, 0.3, 1] };

/**
 * Chat turn wrapper — smooth, subtle ease-out entrance with zero spring recoil.
 */
export const MessageBlock = ({ children }) => (
  <motion.div
    className="chat-sheet-msg-block"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={blockTransition}
  >
    {children}
  </motion.div>
);

const wordVariants = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.38,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const containerVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.035,
    },
  },
};

const AnimatedBotText = ({ text }) => {
  const lines = text.split('\n').filter((l) => l.trim() !== '');

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="animated-bot-text"
    >
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();
        const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        const bulletMatch = trimmed.match(/^-\s+(.*)/);

        let contentStr = trimmed;
        let prefix = null;
        let pClass = 'bot-text-line';

        if (numberedMatch) {
          prefix = <strong>{numberedMatch[1]}. </strong>;
          contentStr = numberedMatch[2];
          pClass = 'bot-text-numbered';
        } else if (bulletMatch) {
          prefix = <span className="bullet-dot">• </span>;
          contentStr = bulletMatch[1];
          pClass = 'bot-text-bullet';
        }

        const parts = contentStr.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
        const wordTokens = [];

        parts.forEach((part) => {
          const isBold = part.startsWith('**') && part.endsWith('**');
          const cleanPart = isBold ? part.slice(2, -2) : part;
          const words = cleanPart.split(/\s+/).filter(Boolean);

          words.forEach((w) => {
            wordTokens.push({ word: w, isBold });
          });
        });

        return (
          <p key={lineIdx} className={pClass}>
            {prefix && (
              <motion.span variants={wordVariants} style={{ display: 'inline-block', marginRight: '0.25em' }}>
                {prefix}
              </motion.span>
            )}
            {wordTokens.map((item, wIdx) => (
              <motion.span
                key={wIdx}
                variants={wordVariants}
                style={{ display: 'inline-block', marginRight: '0.25em', whiteSpace: 'pre-wrap' }}
              >
                {item.isBold ? <strong>{item.word}</strong> : item.word}
              </motion.span>
            ))}
          </p>
        );
      })}
    </motion.div>
  );
};

export const UserBubble = ({ text }) => (
  <div className="user-msg-bubble">{text}</div>
);

export const BotTextResponse = ({ text }) => (
  <div className="bot-response">
    <div className="myra-label">
      <span className="myra-label-text">Myra</span>
      <Sparkles size={13} className="myra-sparkle" />
    </div>
    <div className="bot-response-text">
      <AnimatedBotText text={text} />
    </div>
  </div>
);

const DestinationCard = ({ destination, isSaved, onToggleSave }) => (
  <div className="destination-card">
    <div className="destination-card-photo">
      <img src={destination.image} alt={destination.name} className="destination-card-img" loading="lazy" />
      <button
        className={`destination-bookmark-btn ${isSaved ? 'active' : ''}`}
        onClick={onToggleSave}
        aria-label="Save destination"
      >
        <Bookmark size={15} fill={isSaved ? 'currentColor' : 'none'} />
      </button>
    </div>
    <div className="destination-card-info">
      <span className="destination-card-name">{destination.name}</span>
      <span className="destination-card-location">
        <MapPin size={11} /> {destination.location}
      </span>
      <a href="#" className="destination-card-link" onClick={(e) => e.preventDefault()}>Know More</a>
    </div>
  </div>
);

export const DestinationCarousel = ({ destinations }) => {
  const scrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [saved, setSaved] = useState({});

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.firstChild?.offsetWidth ?? 1;
    const gap = 12;
    const index = Math.round(el.scrollLeft / (cardWidth + gap));
    setActiveIndex(Math.max(0, Math.min(index, destinations.length - 1)));
  };

  const toggleSave = (id) => {
    setSaved((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="destination-overview">
      <div className="destination-overview-header">
        <span className="destination-overview-icon">
          <MapPin size={13} className="icon-white" />
        </span>
        <span className="destination-overview-title">Destination Overview</span>
      </div>
      <div className="destination-carousel" ref={scrollRef} onScroll={handleScroll}>
        {destinations.map((d) => (
          <DestinationCard
            key={d.id}
            destination={d}
            isSaved={!!saved[d.id]}
            onToggleSave={() => toggleSave(d.id)}
          />
        ))}
      </div>
      <div className="destination-pagination">
        <span className="destination-pagination-pill">{activeIndex + 1}/{destinations.length}</span>
        <div className="destination-pagination-dots">
          <span className="destination-dot" />
          <span className="destination-dot" />
        </div>
      </div>
    </div>
  );
};

export const MessageActions = () => {
  const [liked, setLiked] = useState(null);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  return (
    <div className="message-actions-row">
      <button
        className={`msg-action-btn ${liked === 'up' ? 'active' : ''}`}
        onClick={() => setLiked((l) => (l === 'up' ? null : 'up'))}
        aria-label="Helpful"
      >
        <ThumbsUp size={15} />
      </button>
      <button
        className={`msg-action-btn ${liked === 'down' ? 'active' : ''}`}
        onClick={() => setLiked((l) => (l === 'down' ? null : 'down'))}
        aria-label="Not helpful"
      >
        <ThumbsDown size={15} />
      </button>
      <button
        className={`msg-action-btn ${saved ? 'active' : ''}`}
        onClick={() => setSaved((s) => !s)}
        aria-label="Save"
      >
        <Bookmark size={15} fill={saved ? 'currentColor' : 'none'} />
      </button>
      <button
        className={`msg-action-btn ${copied ? 'active' : ''}`}
        onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }}
        aria-label="Copy"
      >
        <Copy size={15} />
      </button>
    </div>
  );
};
