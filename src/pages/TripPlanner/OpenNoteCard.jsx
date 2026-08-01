import React, { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Screen 2.6 — optional open note, skippable.
 */
const OpenNoteCard = ({ onSubmit, onSkip }) => {
  const [note, setNote] = useState('');

  return (
    <motion.div
      className="option-note-card"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <label htmlFor="openNote">Anything else we should know? (optional)</label>
      <textarea
        id="openNote"
        rows={3}
        placeholder="e.g. I'd love a day with no plans at all"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <div className="option-note-actions">
        <motion.button type="button" className="btn-tertiary" onClick={onSkip} whileTap={{ scale: 0.97 }}>
          Skip
        </motion.button>
        <motion.button
          type="button"
          className="btn-secondary"
          onClick={() => onSubmit(note.trim())}
          whileTap={{ scale: 0.98 }}
        >
          Done
        </motion.button>
      </div>
    </motion.div>
  );
};

export default OpenNoteCard;
