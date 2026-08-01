import React, { useRef, useState } from 'react';
import { Sparkles, Bookmark, MapPin, ThumbsUp, ThumbsDown, Copy } from 'lucide-react';

const parseBold = (line) => {
  const parts = line.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i}>{part.slice(2, -2)}</strong>
      : <React.Fragment key={i}>{part}</React.Fragment>
  );
};

const formatBotText = (text) => {
  const lines = text.split('\n').filter((l) => l.trim() !== '');
  return lines.map((line, i) => {
    const trimmed = line.trim();
    const numbered = trimmed.match(/^(\d+)\.\s+(.*)/);
    const bullet = trimmed.match(/^-\s+(.*)/);
    if (numbered) {
      return (
        <p key={i} className="bot-text-numbered">
          <strong>{numbered[1]}.</strong> {parseBold(numbered[2])}
        </p>
      );
    }
    if (bullet) {
      return <p key={i} className="bot-text-bullet">{parseBold(bullet[1])}</p>;
    }
    return <p key={i} className="bot-text-line">{parseBold(trimmed)}</p>;
  });
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
    <div className="bot-response-text">{formatBotText(text)}</div>
  </div>
);

const DestinationCard = ({ destination, isSaved, onToggleSave }) => (
  <div className="destination-card">
    <div className="destination-card-image">
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
