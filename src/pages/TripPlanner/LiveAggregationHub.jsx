import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Bell } from 'lucide-react';
import { getResponses, subscribeToResponses } from '../../lib/tripApi';

const VIBE_LABELS = {
  mountains: 'mountains',
  beach: 'beach',
  party: 'party',
  offbeat: 'offbeat & relaxed',
};

const summarizeVibes = (responses) => {
  const withVibe = responses.filter((r) => r.vibe);
  if (withVibe.length === 0) return null;
  const counts = {};
  withVibe.forEach((r) => { counts[r.vibe] = (counts[r.vibe] || 0) + 1; });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([vibe, count]) => `${count} leaning ${VIBE_LABELS[vibe] || vibe}`)
    .join(', ');
};

/**
 * Screen 3.1 — organizer's live view. Subscribes to tripApi's cross-tab
 * "realtime" so it updates the moment a participant submits, without a
 * page refresh.
 */
const LiveAggregationHub = ({ session, onProceed }) => {
  const [responses, setResponses] = useState(() => getResponses(session.id));
  const [nudgeSent, setNudgeSent] = useState(false);
  const [synthesisRequested, setSynthesisRequested] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToResponses(session.id, setResponses);
    return unsubscribe;
  }, [session.id]);

  const respondedCount = responses.length;
  const pendingCount = Math.max(0, session.group_size - respondedCount);
  const signalLine = summarizeVibes(responses);

  const handleNudge = () => {
    setNudgeSent(true);
    setTimeout(() => setNudgeSent(false), 2500);
  };

  return (
    <div className="hub-screen">
      <h3 className="option-card-title">Live responses</h3>

      <div className="hub-avatar-row">
        {Array.from({ length: Math.min(respondedCount, 8) }).map((_, i) => (
          <span key={`in-${i}`} className="hub-avatar hub-avatar--responded">
            <Check size={14} />
          </span>
        ))}
        {Array.from({ length: Math.min(pendingCount, 8) }).map((_, i) => (
          <span key={`out-${i}`} className="hub-avatar hub-avatar--pending" />
        ))}
      </div>
      <p className="hub-response-count">
        {respondedCount} of {session.group_size} responded
      </p>

      <div className="hub-signal-line">
        {signalLine ? (
          <p className="bot-text-line">{signalLine}</p>
        ) : (
          <p className="bot-text-line hub-signal-empty">Waiting for the first response to come in…</p>
        )}
      </div>

      <div className="hub-actions">
        <motion.button type="button" className="btn-tertiary" onClick={handleNudge} whileTap={{ scale: 0.97 }}>
          <Bell size={15} />
          Nudge pending friends
        </motion.button>
        <motion.button
          type="button"
          className="btn-secondary"
          onClick={() => { setSynthesisRequested(true); onProceed?.(); }}
          whileTap={{ scale: 0.98 }}
        >
          Proceed to synthesis now
        </motion.button>
      </div>

      <AnimatePresence>
        {nudgeSent && (
          <motion.p
            className="hub-toast"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            Nudge sent to pending friends.
          </motion.p>
        )}
        {synthesisRequested && (
          <motion.p
            className="hub-toast"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            Synthesis is coming in the next phase — that's where Myra turns these answers into one recommendation.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LiveAggregationHub;
