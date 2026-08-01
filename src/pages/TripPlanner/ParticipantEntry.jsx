import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ChatFlowShell from '../../components/AIChatbot/ChatFlowShell';
import TypingIndicator from '../../components/AIChatbot/TypingIndicator';
import OptionTile from './OptionTile';
import OpenNoteCard from './OpenNoteCard';
import { participantCards } from './participantCards';
import { useParticipantFlow } from './useParticipantFlow';
import './TripPlanner.css';

const cardTransition = { duration: 0.28, ease: [0.16, 1, 0.3, 1] };

/**
 * Participant flow — Screens 2.2 (arrival) through 2.6 (open note), at
 * /join/:sessionId. Same ChatFlowShell chrome as the organizer route, but
 * the content area shows one card at a time (no step counter, per spec)
 * instead of an accumulating message list.
 */
const ParticipantEntry = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const flow = useParticipantFlow(sessionId);

  const currentCard = participantCards.find((c) => c.key === flow.step);

  return (
    <ChatFlowShell rootClassName="chat-sheet chat-sheet--route" onClose={() => navigate('/')}>
      <AnimatePresence mode="wait">
        {flow.step === 'not-found' && (
          <motion.div key="not-found" className="participant-screen" {...fadeProps}>
            <p className="bot-text-line">
              This trip link doesn't look right — it may have expired or been mistyped. Double-check the link
              your friend sent you.
            </p>
          </motion.div>
        )}

        {flow.step === 'arrival' && (
          <motion.div key="arrival" className="participant-screen" {...fadeProps}>
            <div className="participant-banner">
              <span className="myra-label-text">{flow.session.organizer_name || 'Your friend'}</span>
              <p>is organizing a trip! Help build a plan that fits everyone in 2 minutes.</p>
            </div>
            <motion.button className="btn-secondary participant-start-btn" onClick={flow.startCards} whileTap={{ scale: 0.98 }}>
              Start (2 mins)
            </motion.button>
            <motion.button className="btn-tertiary" onClick={flow.deferAll} whileTap={{ scale: 0.97 }}>
              You decide for me
            </motion.button>
          </motion.div>
        )}

        {currentCard && (
          <motion.div key={currentCard.key} className="participant-screen" {...fadeProps}>
            <h3 className="option-card-title">{currentCard.title}</h3>
            <div className="option-tile-grid">
              {currentCard.options.map((opt) => (
                <OptionTile
                  key={opt.value}
                  option={opt}
                  onSelect={(value) => flow.selectOption(currentCard.key, currentCard.field, value)}
                />
              ))}
            </div>
          </motion.div>
        )}

        {flow.step === 'note' && (
          <motion.div key="note" className="participant-screen" {...fadeProps}>
            <OpenNoteCard onSubmit={flow.finish} onSkip={() => flow.finish('')} />
          </motion.div>
        )}

        {flow.step === 'submitting' && (
          <motion.div key="submitting" className="participant-screen" {...fadeProps}>
            <TypingIndicator />
          </motion.div>
        )}

        {flow.step === 'thanks' && (
          <motion.div key="thanks" className="participant-screen" {...fadeProps}>
            <p className="bot-text-numbered">Thanks, you're in! 🎉</p>
            <p className="bot-text-line">Your answers have been shared — the organizer will take it from here.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </ChatFlowShell>
  );
};

const fadeProps = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: cardTransition,
};

export default ParticipantEntry;
