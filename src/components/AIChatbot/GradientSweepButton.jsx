import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { blockVariants } from './motionConfig';

/**
 * Reusable CTA button featuring a subtle animated gradient sweep that
 * signals an "AI moment" (Launch Sync Mode, Create Trip Session, Enter Hub).
 * Stops sweeping once clicked (it becomes a past chat-history action at
 * that point, not an active nudge). Entrance is delayed by `startDelay` so
 * it only appears once whatever is above it in the turn has finished.
 */
const GradientSweepButton = ({
  children,
  onClick,
  type = 'button',
  disabled = false,
  className = '',
  startDelay = 0,
  ...props
}) => {
  const [hasBeenClicked, setHasBeenClicked] = useState(false);

  const handleClick = (e) => {
    setHasBeenClicked(true);
    onClick?.(e);
  };

  return (
    <motion.button
      type={type}
      className={`btn-gradient-sweep ${hasBeenClicked ? 'reduced-motion' : ''} ${className}`}
      onClick={handleClick}
      disabled={disabled}
      variants={blockVariants}
      custom={startDelay}
      initial="hidden"
      animate="visible"
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default GradientSweepButton;
