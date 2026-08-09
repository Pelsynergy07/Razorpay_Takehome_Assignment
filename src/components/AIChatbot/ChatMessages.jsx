import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Bookmark, MapPin, ThumbsUp, ThumbsDown, Copy } from 'lucide-react';
import MyraAvatar from './MyraAvatar';
import {
  blockVariants,
  BLOCK_STAGGER,
  wordVariants,
  wordContainerVariants,
  peerContainerVariants,
  peerItemVariants,
} from './motionConfig';

/**
 * Chat turn wrapper. Not animated itself — the bot text / user bubble /
 * follow-up element inside it own the actual entrance, so nothing double
 * fades.
 */
export const MessageBlock = ({ children }) => (
  <div className="chat-sheet-msg-block">{children}</div>
);

/**
 * Wraps a follow-up element (button, card, carousel) that shares a message
 * turn with the bot text above it — it doesn't animate itself, it hands a
 * short stagger delay down to its child as `startDelay`, so the follow-up
 * starts a beat after the text above it begins rather than waiting for the
 * text to fully finish revealing.
 */
export const FollowUpReveal = ({ children, className }) => {
  const child = React.Children.only(children);
  return <div className={className}>{React.cloneElement(child, { startDelay: BLOCK_STAGGER })}</div>;
};

/**
 * A Yes/No (or similar) confirm button row used as a FollowUpReveal child —
 * exists so `startDelay` (cloned in by FollowUpReveal above) lands on a
 * `motion.div` that actually consumes it instead of a plain `<div>`, which
 * would otherwise forward the unrecognized prop straight onto the DOM node.
 */
export const ConfirmActions = ({ children, startDelay = 0 }) => (
  <motion.div className="chat-confirm-actions" variants={blockVariants} custom={startDelay} initial="hidden" animate="visible">
    {children}
  </motion.div>
);

const AnimatedBotText = ({ text, startDelay = 0 }) => {
  const sanitizedText = String(text || '')
    .replace(/\[LAUNCH_SYNC_MODE\]/gi, '')
    .replace(/\[AWAITING_CONFIRMATION\]/gi, '')
    .replace(/\[+\s*$/g, '')
    .replace(/\[\s*\]/g, '')
    .trim();

  const lines = sanitizedText.split('\n').filter((l) => {
    const t = l.trim();
    return t !== '' && t !== '[' && t !== ']';
  });

  return (
    <motion.div
      className="animated-bot-text"
      variants={wordContainerVariants(startDelay)}
      initial="hidden"
      animate="visible"
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
          cleanPart.split(/\s+/).filter(Boolean).forEach((w) => wordTokens.push({ word: w, isBold }));
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
  <motion.div
    className="user-msg-bubble"
    variants={blockVariants}
    custom={0}
    initial="hidden"
    animate="visible"
  >
    {text}
  </motion.div>
);

export const BotTextResponse = ({ text }) => (
  <div className="bot-response">
    <motion.div className="myra-label" variants={blockVariants} custom={0} initial="hidden" animate="visible">
      <MyraAvatar />
      <span className="myra-label-text">Myra</span>
    </motion.div>
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

export const DestinationCarousel = ({ destinations, startDelay = 0 }) => {
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
    <motion.div className="destination-overview" variants={blockVariants} custom={startDelay} initial="hidden" animate="visible">
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
    </motion.div>
  );
};

export const MessageActions = ({ startDelay = 0 }) => {
  const [liked, setLiked] = useState(null);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  return (
    <motion.div
      className="message-actions-row"
      variants={peerContainerVariants(startDelay)}
      initial="hidden"
      animate="visible"
    >
      <motion.button
        variants={peerItemVariants}
        className={`msg-action-btn ${liked === 'up' ? 'active' : ''}`}
        onClick={() => setLiked((l) => (l === 'up' ? null : 'up'))}
        aria-label="Helpful"
      >
        <ThumbsUp size={15} />
      </motion.button>
      <motion.button
        variants={peerItemVariants}
        className={`msg-action-btn ${liked === 'down' ? 'active' : ''}`}
        onClick={() => setLiked((l) => (l === 'down' ? null : 'down'))}
        aria-label="Not helpful"
      >
        <ThumbsDown size={15} />
      </motion.button>
      <motion.button
        variants={peerItemVariants}
        className={`msg-action-btn ${saved ? 'active' : ''}`}
        onClick={() => setSaved((s) => !s)}
        aria-label="Save"
      >
        <Bookmark size={15} fill={saved ? 'currentColor' : 'none'} />
      </motion.button>
      <motion.button
        variants={peerItemVariants}
        className={`msg-action-btn ${copied ? 'active' : ''}`}
        onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }}
        aria-label="Copy"
      >
        <Copy size={15} />
      </motion.button>
    </motion.div>
  );
};
