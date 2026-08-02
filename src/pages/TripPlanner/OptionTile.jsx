import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Mountain, Waves, PartyPopper, Feather, Home, Building2, Users, Zap, Coffee } from 'lucide-react';

const ICONS = { Mountain, Waves, PartyPopper, Feather, Home, Building2, Users, Zap, Coffee };

/**
 * Screen 2.3-2.5 option tile with rich Unsplash photography background,
 * dark gradient overlay for text readability, spring hover/tap physics,
 * and icon micro-animations on hover.
 */
const OptionTile = ({ option, onSelect }) => {
  const Icon = ICONS[option.icon];
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      className="option-tile option-tile--photo"
      onClick={() => onSelect(option.value)}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={
        shouldReduceMotion
          ? undefined
          : {
              y: -5,
              boxShadow: '0 12px 24px -6px rgba(0, 0, 0, 0.35)',
              transition: { type: 'spring', stiffness: 400, damping: 25 },
            }
      }
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
    >
      {/* Photo background */}
      {option.image && (
        <img
          src={option.image}
          alt={option.label}
          className="option-tile-bg-img"
          loading="lazy"
        />
      )}

      {/* Dark overlay for contrast */}
      <div className="option-tile-overlay" />

      {/* Content wrapper */}
      <div className="option-tile-content">
        {Icon && (
          <motion.div
            className="option-tile-icon-wrapper"
            whileHover={shouldReduceMotion ? undefined : { rotate: 8, scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          >
            <Icon size={26} className="option-tile-icon" />
          </motion.div>
        )}
        <span className="option-tile-label">{option.label}</span>
      </div>
    </motion.button>
  );
};

export default OptionTile;
