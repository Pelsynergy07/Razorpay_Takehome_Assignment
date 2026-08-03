import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Link2, Users2, Sparkles, ExternalLink, X } from 'lucide-react';
import './InterviewerOnboarding.css';

const PRESENTATION_URL = 'https://razorpay-presentation.vercel.app/';

const STEPS = [
  { icon: MapPin, text: 'Click the Myra assistant in the bottom-right corner and say something like "planning a trip with my friends."' },
  { icon: Link2, text: 'Set the group size, dates, and budget — Myra generates a shareable link, no login needed for friends to fill in.' },
  { icon: Users2, text: 'Once responses come in, Myra reconciles everyone\'s input into one recommended itinerary.' },
];

const easeOut = [0.16, 1, 0.3, 1];
const GREETING_REVEAL_MS = 1300; // how long the hello/thanks card sits alone before it pushes up and grows
const REST_STAGGER = 0.15;

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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: easeOut }}
            >
              Hello
            </motion.p>
            <motion.p
              className="evaluator-greeting"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: easeOut, delay: 0.3 }}
            >
              Thank you for taking the time to do this with me.
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
                  transition={{ duration: 0.55, ease: easeOut }}
                >
                  This is a demo showcasing the "Group Sync Mode" of Myra, the AI travel agent
                  of MakeMyTrip. This new feature lets a trip organizer collect everyone's
                  preferences without a group chat back-and-forth and presents with options
                  that work for everyone.
                </motion.p>

                <motion.p
                  className="evaluator-context evaluator-presentation-link-line"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, ease: easeOut, delay: REST_STAGGER }}
                >
                  This demo directly showcases the flow of this proposed feature.
                  To get more context about this, please refer to the{' '}
                  <a
                    href={PRESENTATION_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="evaluator-presentation-link"
                    onClick={(e) => e.stopPropagation()}
                  >
                    presentation below <ExternalLink size={12} />
                  </a>.
                </motion.p>

                <div className="evaluator-steps">
                  {STEPS.map(({ icon: Icon, text }, i) => (
                    <motion.div
                      key={i}
                      className="evaluator-step"
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, ease: easeOut, delay: REST_STAGGER * 2 + i * REST_STAGGER }}
                    >
                      <span className="evaluator-step-icon"><Icon size={15} /></span>
                      <p>{text}</p>
                    </motion.div>
                  ))}
                </div>

                <motion.button
                  type="button"
                  className="evaluator-start-btn"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: easeOut, delay: REST_STAGGER * 2 + STEPS.length * REST_STAGGER }}
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
