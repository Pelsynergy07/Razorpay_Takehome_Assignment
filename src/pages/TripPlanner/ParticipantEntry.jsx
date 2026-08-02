import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import confetti from 'canvas-confetti';
import ChatFlowShell from '../../components/AIChatbot/ChatFlowShell';
import TypingIndicator from '../../components/AIChatbot/TypingIndicator';
import GradientSweepButton from '../../components/AIChatbot/GradientSweepButton';
import OptionTile from './OptionTile';
import OpenNoteCard from './OpenNoteCard';
import { participantCards } from './participantCards';
import { useParticipantFlow } from './useParticipantFlow';
import './TripPlanner.css';

const cardTransition = { type: 'spring', stiffness: 350, damping: 28 };

/**
 * Ambient background mesh with soft, slow-moving MMT-toned gradient blobs.
 * Respects prefers-reduced-motion.
 */
const AmbientMeshBackground = () => {
  const shouldReduceMotion = useReducedMotion();
  if (shouldReduceMotion) return null;

  return (
    <div className="ambient-mesh-container" aria-hidden="true">
      <motion.div
        className="ambient-blob ambient-blob--blue"
        animate={{
          x: [0, 30, -20, 0],
          y: [0, -40, 20, 0],
          scale: [1, 1.15, 0.9, 1],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="ambient-blob ambient-blob--red"
        animate={{
          x: [0, -35, 25, 0],
          y: [0, 30, -30, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="ambient-blob ambient-blob--purple"
        animate={{
          x: [0, 25, -30, 0],
          y: [0, 35, -20, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
};

/**
 * Participant capture flow — Screens 2.2 through 2.6 at /join/:sessionId.
 */
const ParticipantEntry = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const flow = useParticipantFlow(sessionId);

  const currentCard = participantCards.find((c) => c.key === flow.step);

  // Trigger single subtle confetti burst on mount of the "thanks" screen
  useEffect(() => {
    if (flow.step === 'thanks') {
      confetti({
        particleCount: 32,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#008cff', '#003b95', '#eb2226', '#ffb400', '#10b981'],
        disableForReducedMotion: true,
      });
    }
  }, [flow.step]);

  return (
    <ChatFlowShell rootClassName="chat-sheet chat-sheet--route participant-shell" onClose={() => navigate('/')}>
      <AmbientMeshBackground />
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
          <motion.div key="arrival" className="participant-screen participant-arrival" {...fadeProps}>
            <div className="participant-banner">
              <span className="myra-organizer-badge">
                {flow.session?.organizer_name || 'Your friend'}
              </span>
              <h2 className="arrival-headline">
                {flow.session?.organizer_name || 'Your friend'} wants your inputs to plan an amazing trip.
              </h2>
              <p className="arrival-subheadline">
                2 minutes of your time, and you get to shape where the group ends up! No app to install, no login, we just need to know what you're into.
              </p>
            </div>
            
            <GradientSweepButton
              className="participant-start-btn"
              onClick={flow.startCards}
            >
              Let's do this
            </GradientSweepButton>

            <motion.button
              type="button"
              className="btn-tertiary participant-defer-btn"
              onClick={flow.deferAll}
              whileTap={{ scale: 0.97 }}
            >
              Just decide for me, I'm easy
            </motion.button>
          </motion.div>
        )}

        {currentCard && (
          <motion.div key={currentCard.key} className="participant-screen participant-card-screen" {...fadeProps}>
            <div className="card-header-group">
              <h3 className="option-card-title">{currentCard.title}</h3>
              {currentCard.subtitle && <p className="option-card-subtitle">{currentCard.subtitle}</p>}
            </div>
            <div className={`option-tile-grid option-tile-grid--${currentCard.options.length}`}>
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
          <motion.div key="thanks" className="participant-screen participant-thanks" {...fadeProps}>
            <h2 className="thanks-title">You're in. 🎉</h2>
            <p className="thanks-subtitle">
              We'll ping {flow.session?.organizer_name || 'the organizer'} with your picks. They'll take it from here.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </ChatFlowShell>
  );
};

const fadeProps = {
  initial: { opacity: 0, scale: 0.97, y: 12 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.97, y: -12 },
  transition: cardTransition,
};

export default ParticipantEntry;
