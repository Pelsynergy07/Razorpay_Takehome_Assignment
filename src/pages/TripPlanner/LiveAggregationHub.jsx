import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, PartyPopper } from 'lucide-react';
import { getResponses, subscribeToResponses } from '../../lib/tripApi';
import GradientSweepButton from '../../components/AIChatbot/GradientSweepButton';
import {
  blockVariants,
  BLOCK_STAGGER,
  peerContainerVariants,
  peerItemVariants,
  sequenceDelays,
} from '../../components/AIChatbot/motionConfig';

const getTimeLeftLabel = (createdAt) => {
  if (!createdAt) return '3h left';
  const start = new Date(createdAt).getTime();
  if (isNaN(start)) return '3h left';
  const expiresAt = start + 3 * 60 * 60 * 1000;
  const diffMs = expiresAt - Date.now();
  if (diffMs <= 0) return 'Expired';
  const totalMins = Math.floor(diffMs / 60000);
  const hrs = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m left`;
  if (hrs > 0) return `${hrs}h left`;
  return `${mins}m left`;
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
 *
 * Entrance: header, progress bar, avatar row, and status row reveal top to
 * bottom, each waiting for the one above it to finish before it starts —
 * then the CTA at the very end.
 */
const LiveAggregationHub = ({ session, onProceed, onEmptyProceedAttempt, onPartialProceedAttempt, startDelay = 0, initialResponses = [] }) => {
  // Seeded from whatever the caller already knew (e.g. the self-ack watcher
  // that saw the organizer's own response land) so the very first paint
  // shows the right count instead of 0 while this component's own fetch
  // below is still in flight.
  const [responses, setResponses] = useState(initialResponses);
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
  const timeLeftLabel = getTimeLeftLabel(session?.created_at);

  const handleProceed = () => {
    if (respondedCount === 0) {
      onEmptyProceedAttempt?.();
      return;
    }
    if (pendingCount > 0) {
      onPartialProceedAttempt?.(respondedCount, session.group_size);
      return;
    }
    setProceeded(true);
    onProceed?.();
  };

  const blockCount = 4; // header, progress, avatars, status
  const [headerDelay, progressDelay, avatarDelay, statusDelay] = sequenceDelays(
    Array(blockCount).fill(BLOCK_STAGGER),
    startDelay,
  );
  const buttonDelay = startDelay + blockCount * BLOCK_STAGGER;

  return (
    <div className="hub-screen">
      <motion.div className="hub-header" variants={blockVariants} custom={headerDelay} initial="hidden" animate="visible">
        <div className="hub-header-copy">
          <h3 className="hub-title">Live responses</h3>
          <p className="hub-subtitle">{respondedCount} of {session.group_size} friends have chimed in</p>
        </div>
        <span className="hub-expiry-badge">
          {timeLeftLabel}
        </span>
      </motion.div>

      <motion.div className="hub-progress-track" variants={blockVariants} custom={progressDelay} initial="hidden" animate="visible">
        <div className="hub-progress-fill" style={{ width: `${progressPct}%` }} />
      </motion.div>

      <motion.div className="hub-avatar-row" variants={peerContainerVariants(avatarDelay)} initial="hidden" animate="visible">
        {Array.from({ length: Math.min(respondedCount, 8) }).map((_, i) => (
          <motion.span key={`in-${i}`} className="hub-avatar hub-avatar--responded" variants={peerItemVariants}>
            <FunAvatarFace index={i} />
            <span className="hub-avatar-badge">
              <Check size={9} strokeWidth={3} />
            </span>
          </motion.span>
        ))}
        {Array.from({ length: Math.min(pendingCount, 8) }).map((_, i) => (
          <motion.span key={`out-${i}`} className="hub-avatar hub-avatar--pending" variants={peerItemVariants}>
            <FunAvatarFace index={respondedCount + i} muted />
          </motion.span>
        ))}
      </motion.div>

      {respondedCount === 0 ? (
        <motion.div className="hub-status-row" variants={blockVariants} custom={statusDelay} initial="hidden" animate="visible">
          <span className="hub-wait-spinner" />
          <div className="hub-status-copy">
            <span className="hub-status-text">No one's responded yet</span>
            <span className="hub-status-hint">Feel free to come back later — the link stays active for 3 hours.</span>
          </div>
        </motion.div>
      ) : pendingCount > 0 ? (
        <motion.div className="hub-status-row" variants={blockVariants} custom={statusDelay} initial="hidden" animate="visible">
          <span className="hub-wait-spinner" />
          <div className="hub-status-copy">
            <span className="hub-status-text">
              Waiting on {pendingCount} more {pendingCount === 1 ? 'friend' : 'friends'} to respond…
            </span>
            <span className="hub-status-hint">Link will be active for 3 hours — feel free to come back later.</span>
          </div>
        </motion.div>
      ) : (
        <motion.div className="hub-status-row hub-status-row--done" variants={blockVariants} custom={statusDelay} initial="hidden" animate="visible">
          <PartyPopper size={15} />
          <span className="hub-status-text">Everyone's in — nice!</span>
        </motion.div>
      )}

      <GradientSweepButton
        type="button"
        className="hub-proceed-btn"
        onClick={handleProceed}
        disabled={proceeded}
        startDelay={buttonDelay}
      >
        Alright, let's cook this trip
      </GradientSweepButton>
    </div>
  );
};

export default LiveAggregationHub;
