import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ExternalLink, X } from 'lucide-react';
import './InterviewerOnboarding.css';

const PRESENTATION_URL = 'https://razorpay-presentation.vercel.app/';

const easeOut = [0.16, 1, 0.3, 1];

const containerVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 12 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: easeOut,
      staggerChildren: 0.14,
      delayChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easeOut },
  },
};

const InterviewerOnboardingModal = ({ isOpen, onClose, onStartDemo }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="evaluator-modal-backdrop" onClick={onClose}>
        <motion.div
          className="evaluator-modal-card"
          onClick={(e) => e.stopPropagation()}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit={{ opacity: 0, scale: 0.96, y: 12, transition: { duration: 0.25, ease: easeOut } }}
        >
          <button type="button" className="evaluator-modal-close" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>

          <div className="evaluator-greeting-block">
            <motion.p className="evaluator-hello" variants={itemVariants}>
              Hello!
            </motion.p>
            <motion.p className="evaluator-greeting" variants={itemVariants}>
              Thanks for taking the time to go through this demo!
            </motion.p>
          </div>

          <motion.p className="evaluator-context" variants={itemVariants} style={{ marginTop: '16px' }}>
            This is a demo showcasing the <strong>"Group Sync Mode"</strong> of Myra, the AI
            travel agent of MakeMyTrip. This new feature lets a trip organizer{' '}
            <strong>collect everyone's preferences without a group chat back-and-forth</strong>{' '}
            and presents with options that work for everyone.
          </motion.p>

          <motion.p className="evaluator-context evaluator-presentation-link-line" variants={itemVariants}>
            This demo <strong>directly showcases the flow of this proposed feature</strong>.
            To get more context about this, please refer to the{' '}
            <a
              href={PRESENTATION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="evaluator-presentation-link"
              onClick={(e) => e.stopPropagation()}
            >
              project case study <ExternalLink size={12} />
            </a>.
          </motion.p>

          <motion.button
            type="button"
            className="evaluator-start-btn"
            variants={itemVariants}
            onClick={() => {
              onStartDemo();
              onClose();
            }}
          >
            <Sparkles size={15} /> Start the prototype
          </motion.button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default InterviewerOnboardingModal;
