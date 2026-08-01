import React from 'react';
import { motion } from 'framer-motion';
import { Mountain, Waves, PartyPopper, Feather, Home, Building2, Users, Zap, Coffee } from 'lucide-react';

const ICONS = { Mountain, Waves, PartyPopper, Feather, Home, Building2, Users, Zap, Coffee };

/**
 * Screens 2.3-2.5 option tile — tap to select, auto-advances (handled by
 * the caller). Vibe options carry a gradient (image-led per spec, colored
 * blocks stand in for photography); accommodation/pace options are plain
 * bordered tiles since the spec doesn't ask those to be image-led.
 */
const OptionTile = ({ option, onSelect }) => {
  const Icon = ICONS[option.icon];
  const hasGradient = !!option.gradient;

  return (
    <motion.button
      type="button"
      className={`option-tile ${hasGradient ? 'option-tile--gradient' : 'option-tile--plain'}`}
      style={hasGradient ? { background: option.gradient } : undefined}
      onClick={() => onSelect(option.value)}
      whileTap={{ scale: 0.96 }}
    >
      {Icon && <Icon size={hasGradient ? 28 : 22} className={hasGradient ? 'option-tile-icon--light' : 'option-tile-icon--dark'} />}
      <span className="option-tile-label">{option.label}</span>
    </motion.button>
  );
};

export default OptionTile;
