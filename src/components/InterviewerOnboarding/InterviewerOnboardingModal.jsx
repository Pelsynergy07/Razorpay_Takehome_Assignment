import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Link2, Users2, Sparkles, ChevronRight, X } from 'lucide-react';
import './InterviewerOnboarding.css';

const STEPS = [
  { icon: MapPin, text: 'Click the Myra assistant in the bottom-right corner and say something like "planning a trip with my friends."' },
  { icon: Link2, text: 'Set the group size, dates, and budget — Myra generates a shareable link, no login needed for friends to fill in.' },
  { icon: Users2, text: 'Once responses come in, Myra reconciles everyone\'s input into one recommended itinerary.' },
];

const InterviewerOnboardingModal = ({ isOpen, onClose, onStartDemo }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="evaluator-modal-backdrop" onClick={onClose}>
        <motion.div
          className="evaluator-modal-card"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <button type="button" className="evaluator-modal-close" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>

          <p className="evaluator-greeting">Hello! Thanks for taking the time to go through this.</p>
          <p className="evaluator-context">
            This is a prototype of Myra, an AI travel assistant concept for MakeMyTrip.
            The feature to try is group sync mode — it lets a trip organizer collect
            everyone's preferences without a group chat back-and-forth.
          </p>

          <div className="evaluator-steps">
            {STEPS.map(({ icon: Icon, text }, i) => (
              <div key={i} className="evaluator-step">
                <span className="evaluator-step-icon"><Icon size={15} /></span>
                <p>{text}</p>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="evaluator-start-btn"
            onClick={() => {
              onStartDemo();
              onClose();
            }}
          >
            <Sparkles size={15} /> Start the prototype <ChevronRight size={16} />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default InterviewerOnboardingModal;
