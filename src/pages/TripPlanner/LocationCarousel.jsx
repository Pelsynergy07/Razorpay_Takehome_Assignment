import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight, Check } from 'lucide-react';

/**
 * 3D "coverflow" style picker for the participant flow's destination
 * question — one location filling the frame, its neighbours peeking in
 * from either side at a slight rotation. Swipe/drag or the arrow buttons
 * browse; tapping a card only marks it as the chosen one (it does not
 * advance) — confirming happens via the "Pick location" button below,
 * which stays disabled until a card has been tapped.
 */
const LocationCarousel = ({ options, onSelect }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedValue, setSelectedValue] = useState(null);
  const lastIndex = options.length - 1;
  const selectedOption = options.find((opt) => opt.value === selectedValue);

  const goPrev = () => setActiveIndex((i) => Math.max(0, i - 1));
  const goNext = () => setActiveIndex((i) => Math.min(lastIndex, i + 1));

  const handleDragEnd = (_e, info) => {
    const threshold = 60;
    if (info.offset.x < -threshold) goNext();
    else if (info.offset.x > threshold) goPrev();
  };

  const handleCardClick = (idx, value) => {
    setActiveIndex(idx);
    setSelectedValue(value);
  };

  return (
    <div className="location-carousel-block">
      <div className="location-carousel-stage">
        <motion.div
          className="location-carousel-drag-layer"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.35}
          onDragEnd={handleDragEnd}
        >
          {options.map((opt, idx) => {
            const offset = idx - activeIndex;
            if (Math.abs(offset) > 2) return null;
            const isActive = offset === 0;
            const isSelected = opt.value === selectedValue;

            return (
              <motion.div
                key={opt.value}
                className={`location-carousel-card ${isActive ? 'is-active' : ''} ${isSelected ? 'is-selected' : ''}`}
                onClick={() => handleCardClick(idx, opt.value)}
                animate={{
                  x: `${offset * 58}%`,
                  scale: isActive ? 1 : 0.82,
                  rotateY: offset === 0 ? 0 : offset > 0 ? -22 : 22,
                  opacity: Math.abs(offset) > 1 ? 0 : isActive ? 1 : 0.7,
                  zIndex: 10 - Math.abs(offset),
                }}
                transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              >
                <img src={opt.image} alt={opt.label} className="location-carousel-img" draggable={false} />
                <div className="location-carousel-gradient" />
                {isSelected && (
                  <div className="location-carousel-check"><Check size={14} strokeWidth={3} /></div>
                )}
                <div className="location-carousel-label">
                  <span className="location-carousel-name">{opt.label}</span>
                  {opt.region && <span className="location-carousel-region">{opt.region}</span>}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <button
          type="button"
          className="location-carousel-nav location-carousel-nav--prev"
          onClick={goPrev}
          disabled={activeIndex === 0}
          aria-label="Previous destination"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          className="location-carousel-nav location-carousel-nav--next"
          onClick={goNext}
          disabled={activeIndex === lastIndex}
          aria-label="Next destination"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="location-carousel-dots">
        {options.map((opt, idx) => (
          <span key={opt.value} className={`location-carousel-dot ${idx === activeIndex ? 'active' : ''}`} />
        ))}
      </div>

      <button
        type="button"
        className="secondary-btn-brand"
        disabled={!selectedOption}
        onClick={() => selectedOption && onSelect(selectedOption.value)}
      >
        {selectedOption ? `Pick ${selectedOption.label}` : 'Pick a location'} <ArrowRight size={16} />
      </button>
    </div>
  );
};

export default LocationCarousel;
