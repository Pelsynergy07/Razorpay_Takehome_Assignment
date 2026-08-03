import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ExternalLink, X } from 'lucide-react';
import './InterviewerOnboarding.css';

const PRESENTATION_URL = 'https://razorpay-presentation.vercel.app/';

const easeOut = [0.16, 1, 0.3, 1];
const GREETING_REVEAL_MS = 2200; // how long the hello/thanks card sits alone before it pushes up and grows
const REST_STAGGER = 0.22;

const InterviewerOnboardingModal = ({ isOpen, onClose, onStartDemo }) => {
  const [showRest, setShowRest] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setShowRest(false);
      return;
    }
    const timer = setTimeout(() => setShowRest(true), GREETING_REVEAL_MS);
    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="evaluator-modal-backdrop" onClick={onClose}>
        <motion.div
          className="evaluator-modal-card"
          layout
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ layout: { duration: 0.55, ease: easeOut }, opacity: { duration: 0.3, ease: easeOut }, y: { duration: 0.3, ease: easeOut } }}
        >
          <button type="button" className="evaluator-modal-close" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>

          <motion.div className="evaluator-greeting-block">
            <motion.p
              className="evaluator-hello"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: easeOut }}
            >
              Hello!
            </motion.p>
            <motion.p
              className="evaluator-greeting"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: easeOut, delay: 1 }}
            >
              Thanks for taking the time to go through this demo!
            </motion.p>
          </motion.div>

          <AnimatePresence>
            {showRest && (
              <motion.div
                key="rest"
                className="evaluator-rest-block"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, ease: easeOut }}
              >
                <motion.p
                  className="evaluator-context"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: easeOut }}
                >
                  This is a demo showcasing the <strong>"Group Sync Mode"</strong> of Myra, the AI
                  travel agent of MakeMyTrip. This new feature lets a trip organizer{' '}
                  <strong>collect everyone's preferences without a group chat back-and-forth</strong>{' '}
                  and presents with options that work for everyone.
                </motion.p>

                <motion.p
                  className="evaluator-context evaluator-presentation-link-line"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: easeOut, delay: REST_STAGGER }}
                >
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
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, ease: easeOut, delay: REST_STAGGER * 2 }}
                  onClick={() => {
                    onStartDemo();
                    onClose();
                  }}
                >
                  <Sparkles size={15} /> Start the prototype
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default InterviewerOnboardingModal;
