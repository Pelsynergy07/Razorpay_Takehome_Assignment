/**
 * Shared Framer Motion timing for the whole AI-chatbot flow, so every
 * entrance — bot text, buttons, cards, the live-response hub, the synthesis
 * dashboard, the final itinerary — feels like one deliberately-paced system
 * instead of a pile of one-off animations:
 *
 * - Always eased deceleration (never linear, never spring/bouncy).
 * - Everything enters bottom-to-top (opacity 0 -> 1, y offset -> 0).
 * - Elements reveal in top-to-bottom document order, but overlapping: the
 *   element below doesn't wait for the one above to fully finish — it
 *   starts a short beat later (BLOCK_STAGGER), so they're both in motion
 *   together for a moment while the one above still visibly settles first.
 */

// Cubic-bezier "ease-out" decelerate curve — starts quick, settles gently,
// zero overshoot/bounce.
export const EASE = [0.16, 1, 0.3, 1];

// Generic block entrance (a card, a button, an image, a row) — this is the
// unit of "one element" in the top-to-bottom sequencing rule.
export const BLOCK_DURATION = 0.45;
export const BLOCK_Y = 18;
export const blockTransition = (delay = 0) => ({ duration: BLOCK_DURATION, ease: EASE, delay });
export const blockVariants = {
  hidden: { opacity: 0, y: BLOCK_Y },
  visible: (delay = 0) => ({ opacity: 1, y: 0, transition: blockTransition(delay) }),
};

// How much later than the element above it a following element starts —
// deliberately much shorter than BLOCK_DURATION so the two overlap in
// flight, instead of the lower one waiting for the upper one to completely
// finish before it can begin.
export const BLOCK_STAGGER = 0.18;

// Word-by-word bot text reveal. (Trimmed 20% off both duration and stagger
// so text finishes revealing faster without losing the cascading feel.)
export const WORD_DURATION = 0.32;
export const WORD_STAGGER = 0.028;
export const WORD_Y = 14;

export const wordVariants = {
  hidden: { opacity: 0, y: WORD_Y },
  visible: { opacity: 1, y: 0, transition: { duration: WORD_DURATION, ease: EASE } },
};

export const wordContainerVariants = (delay = 0) => ({
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: WORD_STAGGER, delayChildren: delay },
  },
});

// Light stagger for a row of same-level peers (avatars, pills, evidence
// cards) — these are one visual "element" in the top-to-bottom rule, so
// they cascade quickly among themselves rather than each fully finishing
// before the next starts.
export const PEER_STAGGER = 0.06;
export const peerContainerVariants = (delay = 0) => ({
  hidden: { opacity: 1 },
  visible: { opacity: 1, transition: { staggerChildren: PEER_STAGGER, delayChildren: delay } },
});
export const peerItemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE } },
};

// Sequencer: given an ordered list of gaps (seconds) and a base start time,
// returns the start delay for each element — element N starts `gap[N-1]`
// after element N-1 started (not after it finishes), so consecutive
// elements overlap. Pass BLOCK_STAGGER for every gap in the common case.
export const sequenceDelays = (gaps, base = 0) => {
  const delays = [];
  let t = base;
  delays.push(t);
  for (let i = 0; i < gaps.length - 1; i += 1) {
    t += gaps[i];
    delays.push(t);
  }
  return delays;
};
