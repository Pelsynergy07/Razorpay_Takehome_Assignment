import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * Reusable CTA button featuring a subtle animated gradient sweep that
 * signals an "AI moment" (Launch Sync Mode, Create Trip Session, Enter Hub).
 * Respects user's reduced motion setting, and stops sweeping once clicked
 * (it becomes a past chat-history action at that point, not an active nudge).
 */
const GradientSweepButton = ({
  children,
  onClick,
  type = 'button',
  disabled = false,
  className = '',
  whileTap = { scale: 0.98 },
  ...props
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [hasBeenClicked, setHasBeenClicked] = useState(false);

  const handleClick = (e) => {
    setHasBeenClicked(true);
    onClick?.(e);
  };

  return (
    <motion.button
      type={type}
      className={`btn-gradient-sweep ${shouldReduceMotion || hasBeenClicked ? 'reduced-motion' : ''} ${className}`}
      onClick={handleClick}
      disabled={disabled}
      whileTap={disabled ? undefined : whileTap}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default GradientSweepButton;
