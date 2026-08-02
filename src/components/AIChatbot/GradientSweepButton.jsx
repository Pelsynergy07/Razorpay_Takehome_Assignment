import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * Reusable CTA button featuring a subtle animated gradient border sweep
 * that signals an "AI moment" (Launch Sync Mode, Create Trip Session, Enter Hub).
 * Respects user's reduced motion setting.
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

  return (
    <motion.button
      type={type}
      className={`btn-gradient-sweep ${shouldReduceMotion ? 'reduced-motion' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled}
      whileTap={disabled ? undefined : whileTap}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default GradientSweepButton;
