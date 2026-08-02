import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Users2, PartyPopper } from 'lucide-react';
import { getResponses, subscribeToResponses } from '../../lib/tripApi';
import GradientSweepButton from '../../components/AIChatbot/GradientSweepButton';

const VIBE_META = {
  mountains: { label: 'Mountains', emoji: '⛰️' },
  beach: { label: 'Beach', emoji: '🏖️' },
  party: { label: 'Party', emoji: '🎉' },
  offbeat: { label: 'Offbeat & relaxed', emoji: '🌿' },
};

const summarizeVibes = (responses) => {
  const withVibe = responses.filter((r) => r.vibe);
  if (withVibe.length === 0) return [];
  const counts = {};
  withVibe.forEach((r) => { counts[r.vibe] = (counts[r.vibe] || 0) + 1; });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([vibe, count]) => ({ vibe, count, ...(VIBE_META[vibe] || { label: vibe, emoji: '✨' }) }));
};

// Gender-neutral critter avatars — real emoji glyphs, a different one per friend, on a colorful filled backdrop.
const FUN_AVATAR_ICONS = ['🐶', '🐱', '🦊', '🐼', '🐨', '🦁', '🐯', '🐵', '🐰', '🐻'];
const FUN_AVATAR_COLORS = [
  '#008cff', '#9c27b0', '#14b8c4', '#ff5c9c',
  '#f5a623', '#e8637a', '#15457c', '#7c5cff',
  '#1a7a2e', '#c81d21',
];

const FunAvatarFace = ({ index = 0, muted = false }) => {
  const bg = FUN_AVATAR_COLORS[index % FUN_AVATAR_COLORS.length];
  const icon = FUN_AVATAR_ICONS[index % FUN_AVATAR_ICONS.length];
  return (
    <span
      className="hub-avatar-face"
      style={{ background: bg }}
    >
      {icon}
    </span>
  );
};

/**
 * Screen 3.1 — organizer's live view. Subscribes to tripApi's cross-tab
 * "realtime" so it updates the moment a participant submits, without a
 * page refresh.
 */
const LiveAggregationHub = ({ session, onProceed }) => {
  const [responses, setResponses] = useState([]);
  const [proceeded, setProceeded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    Promise.resolve(getResponses(session.id)).then((data) => {
      if (isMounted && Array.isArray(data)) setResponses(data);
    });
    const unsubscribe = subscribeToResponses(session.id, (fresh) => {
      if (isMounted && Array.isArray(fresh)) setResponses(fresh);
    });
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [session.id]);

  const respondedCount = responses.length;
  const pendingCount = Math.max(0, session.group_size - respondedCount);
  const progressPct = session.group_size > 0 ? Math.min(100, Math.round((respondedCount / session.group_size) * 100)) : 0;
  const vibeTally = summarizeVibes(responses);

  const handleProceed = () => {
    setProceeded(true);
    onProceed?.();
  };

  return (
    <div className="hub-screen">
      <div className="hub-header">
        <span className="hub-header-icon">
          <Users2 size={16} className="icon-white" />
        </span>
        <div className="hub-header-copy">
          <h3 className="hub-title">Live responses</h3>
          <p className="hub-subtitle">{respondedCount} of {session.group_size} friends have chimed in</p>
        </div>
      </div>

      <div className="hub-progress-track">
        <motion.div
          className="hub-progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>

      <div className="hub-avatar-row">
        {Array.from({ length: Math.min(respondedCount, 8) }).map((_, i) => (
          <motion.span
            key={`in-${i}`}
            className="hub-avatar hub-avatar--responded"
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 14 }}
          >
            <FunAvatarFace index={i} />
            <span className="hub-avatar-badge">
              <Check size={9} strokeWidth={3} />
            </span>
          </motion.span>
        ))}
        {Array.from({ length: Math.min(pendingCount, 8) }).map((_, i) => (
          <span key={`out-${i}`} className="hub-avatar hub-avatar--pending">
            <FunAvatarFace index={respondedCount + i} muted />
          </span>
        ))}
      </div>

      {pendingCount > 0 ? (
        <div className="hub-status-row">
          <span className="hub-wait-spinner" />
          <div className="hub-status-copy">
            <span className="hub-status-text">
              Waiting on {pendingCount} more {pendingCount === 1 ? 'friend' : 'friends'} to respond…
            </span>
            <span className="hub-status-hint">This can take a while, feel free to come back later.</span>
          </div>
        </div>
      ) : (
        <div className="hub-status-row hub-status-row--done">
          <PartyPopper size={15} />
          <span className="hub-status-text">Everyone's in — nice!</span>
        </div>
      )}

      {vibeTally.length > 0 && (
        <div className="hub-vibe-pills">
          {vibeTally.map(({ vibe, count, label, emoji }) => (
            <span key={vibe} className="hub-vibe-pill">
              <span className="hub-vibe-pill-emoji">{emoji}</span>
              {label}
              <span className="hub-vibe-pill-count">×{count}</span>
            </span>
          ))}
        </div>
      )}

      <GradientSweepButton
        type="button"
        className="hub-proceed-btn"
        onClick={handleProceed}
        disabled={proceeded}
        whileTap={proceeded ? undefined : { scale: 0.98 }}
      >
        Alright, let's cook this trip
      </GradientSweepButton>
    </div>
  );
};

export default LiveAggregationHub;
