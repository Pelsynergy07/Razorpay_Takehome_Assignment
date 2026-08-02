import React, { useState } from 'react';
import { motion } from 'framer-motion';
import GradientSweepButton from '../../components/AIChatbot/GradientSweepButton';

/**
 * Screen 2.6 — optional open note screen with warm phrasings and low pressure.
 */
const OpenNoteCard = ({ onSubmit, onSkip }) => {
  const [note, setNote] = useState('');

  return (
    <motion.div
      className="option-note-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
    >
      <div className="option-note-header">
        <h3 className="option-card-title">Anything else we should know?</h3>
        <p className="option-card-subtitle">Optional, honestly, if there's nothing, hit skip.</p>
      </div>

      <textarea
        id="openNote"
        rows={3}
        placeholder="e.g. late arrival, veg only, I get motion sick on windy roads..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      <div className="option-note-actions">
        <motion.button
          type="button"
          className="btn-tertiary"
          onClick={onSkip}
          whileTap={{ scale: 0.96 }}
        >
          Skip
        </motion.button>
        <GradientSweepButton
          type="button"
          onClick={() => onSubmit(note.trim())}
        >
          Done
        </GradientSweepButton>
      </div>
    </motion.div>
  );
};

export default OpenNoteCard;
