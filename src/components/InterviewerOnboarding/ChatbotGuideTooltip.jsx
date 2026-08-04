import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, X } from 'lucide-react';
import './InterviewerOnboarding.css';

const ChatbotGuideTooltip = ({ isVisible, onOpenChat, onDismiss }) => {
  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="chatbot-guide-tooltip-anchor"
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <div className="guide-tooltip-bubble" onClick={onOpenChat}>
          <div className="guide-tooltip-header">
            <span className="guide-tooltip-badge">
              <Sparkles size={12} /> Step 1: Start Demo
            </span>
            <button
              type="button"
              className="guide-tooltip-close"
              onClick={(e) => {
                e.stopPropagation();
                onDismiss();
              }}
            >
              <X size={13} />
            </button>
          </div>
          <p className="guide-tooltip-text">
            Click <strong>Myra AI Assistant</strong> to start planning a trip & see the group flow in action!
          </p>
          <div className="guide-tooltip-action">
            <span>Launch Myra</span> <ArrowRight size={14} />
          </div>
          <div className="guide-tooltip-arrow" />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ChatbotGuideTooltip;
