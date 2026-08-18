import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Edit3,
  Calendar,
  Navigation,
  Home,
  Compass,
  Scale,
  Trophy,
  CheckCircle2,
  Check,
  MessageSquareQuote,
  MessageSquarePlus,
  Sparkles,
} from 'lucide-react';
import {
  blockVariants,
  BLOCK_STAGGER,
  EASE,
  sequenceDelays,
  peerContainerVariants,
  peerItemVariants,
} from '../../components/AIChatbot/motionConfig';
import { mockInventory } from '../../lib/mockInventory';
import { buildRecommendationFromInventoryItem } from '../../lib/synthesizeRecommendation';

// Edit <-> dashboard navigation reads as a screen push/pop — both directions
// slide in from the right, not a vertical fade — so a shorter, snappier
// duration than a content-reveal block suits it better.
const SWAP_NAV_DURATION = 0.35;
const SWAP_NAV_OFFSET_X = 28;

// recState's swap category keys don't match openSections' keys 1:1
// (plural "transports"/"stays" vs. singular "transport"/"stay", and
// "dateOptions" vs. "dates") — this maps one to the other so opening a
// swap can mark the right accordion to stay open once the user is back.
const SWAP_CATEGORY_TO_SECTION = {
  dateOptions: 'dates',
  transports: 'transport',
  stays: 'stay',
  activities: 'activities',
};

// How long the small "checking how this affects your plan" beat sits before
// revealing its result — long enough to read as real work, short enough not
// to feel slow. Deliberately NOT the big mascot ProcessingScreen used for
// the main synthesis — this is a small, inline, single-line loader scoped
// to just the option being previewed.
const IMPACT_CHECK_DELAY = 2100;

// "Show more options" search beat — kept short and separate from
// IMPACT_CHECK_DELAY since it's swapping the whole options list, not
// previewing a single card.
const MORE_OPTIONS_SEARCH_DELAY = 1500;

/** Small inline loader — spinning sparkle + one line of text, no mascot/avatar. */
const SwapInlineLoader = ({ text }) => (
  <div className="swap-inline-loader">
    <motion.span
      className="swap-inline-loader-spinner"
      animate={{ rotate: 360 }}
      transition={{ duration: 1.1, ease: 'linear', repeat: Infinity }}
    >
      <Sparkles size={14} className="icon-blue" fill="currentColor" />
    </motion.span>
    <span className="swap-inline-loader-text">{text}</span>
  </div>
);

// Free-text "show more options" search — scores the destination's curated
// pool (see `morePool` in synthesizeRecommendation.js) against the words
// typed, honest keyword matching rather than a real model call. Ties/no
// matches still return the top `count` pool entries rather than nothing, so
// the search never reads as broken.
const findMoreOptions = (pool, query, excludeIds = [], count = 3) => {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  return pool
    .filter((opt) => !excludeIds.includes(opt.id))
    .map((opt) => {
      const haystack = `${opt.title} ${opt.desc || ''} ${(opt.tags || []).join(' ')}`.toLowerCase();
      const score = words.reduce((s, w) => s + (haystack.includes(w) ? 1 : 0), 0);
      return { opt, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map((s) => s.opt);
};

// Parses "6:00 AM" / "9:40 PM" style strings (the only shape used in mock
// transport data) into minutes-since-midnight, so the impact preview can
// honestly say whether a new arrival time is earlier or later.
const parseClockMinutes = (label) => {
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec((label || '').trim());
  if (!m) return null;
  let hours = parseInt(m[1], 10) % 12;
  if (/pm/i.test(m[3])) hours += 12;
  return hours * 60 + parseInt(m[2], 10);
};

const joinWithAnd = (items) => (items.length > 1
  ? `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
  : items[0]);

// The one wired dependency this feature covers: swapping the "Getting
// there" transport changes Day 1's arrival time, which can push back
// whichever Day 1 activities are flagged time-sensitive in the mock
// itinerary data (see `timeSensitiveActivities` in synthesizeRecommendation.js).
// No other category (stay/activities/dates) has a wired ripple — those
// swaps only ever surface a cost delta, or honestly report no other change.
const buildImpactBullets = (recState, categoryKey, option) => {
  const currentActive = recState[categoryKey]?.find((o) => o.selected);
  if (!currentActive || currentActive.id === option.id) return [];
  const bullets = [];

  if (categoryKey === 'transports' && currentActive.arrivalTime && option.arrivalTime && currentActive.arrivalTime !== option.arrivalTime) {
    bullets.push({ text: `Arrival moves from ${currentActive.arrivalTime} to ${option.arrivalTime}` });

    const day1 = recState.itinerary?.[0];
    if (day1?.timeSensitiveActivities?.length) {
      const oldMin = parseClockMinutes(currentActive.arrivalTime);
      const newMin = parseClockMinutes(option.arrivalTime);
      const direction = newMin != null && oldMin != null && newMin > oldMin ? 'later' : 'earlier';
      bullets.push({ text: `Day 1's ${joinWithAnd(day1.timeSensitiveActivities)} may need to shift ${direction}` });
    }
  }

  if (typeof currentActive.cost === 'number' && typeof option.cost === 'number') {
    const delta = option.cost - currentActive.cost;
    if (delta !== 0) {
      bullets.push({ text: `Trip cost per person ${delta > 0 ? 'increases' : 'decreases'} by ₹${Math.abs(delta).toLocaleString('en-IN')}` });
    }

    // Budget check — swapping in a pricier option can push the whole
    // per-person total past what the group actually asked for. Called out
    // as its own emphasized bullet rather than folded into the cost-delta
    // line above, since "went over budget" is a different order of concern
    // than a routine price difference.
    if (typeof recState.budgetPerPerson === 'number') {
      const activeTransport = recState.transports?.find((t) => t.selected);
      const activeStay = recState.stays?.find((s) => s.selected);
      const activeActivity = recState.activities?.find((a) => a.selected);
      const transportCost = categoryKey === 'transports' ? option.cost : activeTransport?.cost;
      const stayCost = categoryKey === 'stays' ? option.cost : activeStay?.cost;
      const activityCost = categoryKey === 'activities' ? option.cost : activeActivity?.cost;

      if ([transportCost, stayCost, activityCost].every((c) => typeof c === 'number')) {
        const newTotal = transportCost + stayCost + activityCost;
        const over = newTotal - recState.budgetPerPerson;
        if (over > 0) {
          bullets.push({ text: `Exceeds your ₹${recState.budgetPerPerson.toLocaleString('en-IN')} per-person budget by ₹${over.toLocaleString('en-IN')}`, warning: true });
        }
      }
    }
  }

  return bullets;
};

/**
 * Shared header row for every accordion card — icon + title/subtext on the
 * left, an optional Edit control in the middle, and the expand/collapse
 * chevron always last. Keeping the chevron in its own fixed slot (instead of
 * living inside the same button as the title, which pushed it around
 * depending on whether a category had an Edit button) is what keeps its
 * position consistent across all six accordions.
 */
const AccordionHeaderRow = ({ icon, heading, subtext, isOpen, onToggle, onEdit }) => (
  <div className="accordion-header-row">
    <button type="button" className="accordion-header-main" onClick={onToggle}>
      <span className="accordion-icon-chip">{icon}</span>
      <div className="accordion-title-text">
        <h3 className="accordion-heading">{heading}</h3>
        <span className="accordion-subtext">{subtext}</span>
      </div>
    </button>
    {onEdit && (
      <button type="button" className="accordion-edit-btn" onClick={onEdit}>
        <Edit3 size={14} /> Edit
      </button>
    )}
    <button
      type="button"
      className="accordion-chevron-btn"
      onClick={onToggle}
      aria-label={isOpen ? 'Collapse section' : 'Expand section'}
    >
      {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
    </button>
  </div>
);

/**
 * An accordion body only ever mounts either (a) already open at the initial
 * reveal (only "dates" does this) or (b) later, from a user click toggling
 * it open — in both cases a simple, independent fade-up on its own mount is
 * enough; it doesn't need to be threaded into the outer sequencing.
 */
const AccordionBody = ({ children }) => (
  <motion.div className="accordion-body" variants={blockVariants} custom={0} initial="hidden" animate="visible">
    {children}
  </motion.div>
);

/**
 * A "Reconciled Effort" / "Top Vibe Match" style tag that reveals its
 * attribution as a small tooltip floating over the tag itself (absolutely
 * positioned, doesn't push any layout) instead of expanding a paragraph
 * inline beneath it.
 */
const TagBadge = ({ label, isOpen, onToggle, tooltipText, asSpan = false }) => {
  const inner = asSpan ? (
    <span
      role="button"
      tabIndex={0}
      className="active-item-badge badge-clickable"
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      onKeyDown={(e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
    >
      {label}
    </span>
  ) : (
    <button type="button" className="active-item-badge badge-clickable" onClick={onToggle}>
      {label}
    </button>
  );

  return (
    <span className="badge-tooltip-wrap">
      {inner}
      {isOpen && (
        <motion.div
          className="badge-tooltip"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          {tooltipText}
        </motion.div>
      )}
    </span>
  );
};

/**
 * Screen 4.2 — synthesis result dashboard with 6 section accordions:
 * Dates, Getting there, Stay, Things to do, What we resolved, Evidence.
 * Editing a category opens a "swap" view in place of the dashboard (still
 * inside the same chat panel), rather than a separate modal.
 *
 * Entrance: hero, confidence card, each of the six accordions, then the
 * approve button — reveal top to bottom, each waiting for the one above it
 * to finish before it starts.
 */
const SynthesisResult = ({
  recommendation,
  onUpdate,
  onApprove,
  onExtendRound,
  onChooseRiskOption,
  startDelay = 0,
  scrollContainerRef,
  // "Show more options" is driven through the real chat input, not an
  // inline field in this screen — see AIChatbotWidget.jsx. `onMoreOptionsCategoryChange`
  // tells the parent which category is waiting for the user's next chat
  // message (or clears it with null); `moreOptionsActiveCategory` reflects
  // that same value back so the button can show it's waiting;
  // `moreOptionsQuery` is the parent handing back the submitted message
  // once it arrives.
  onMoreOptionsCategoryChange,
  moreOptionsActiveCategory,
  moreOptionsQuery,
}) => {
  const [recState, setRecState] = useState(recommendation);

  const [openSections, setOpenSections] = useState({
    dates: true,
    transport: false,
    stay: false,
    activities: false,
    resolved: false,
    evidence: false,
  });

  // Everyone-deferred edge case's "pick a destination myself" list — only
  // ever relevant while recState.scenario === 'all_deferred'.
  const [manualPickOpen, setManualPickOpen] = useState(false);

  // In-panel swap view — replaces the dashboard while active, instead of
  // a modal rendered outside the chat sheet.
  const [swapView, setSwapView] = useState(null); // { categoryKey, title, options } | null

  // Tapping an option in the swap view previews it (impact panel below that
  // option) rather than applying it immediately — nothing in recState
  // changes until "Confirm this change" is pressed. `computingImpact` is the
  // brief beat right after tapping, before the impact bullets are revealed.
  const [pendingSwap, setPendingSwap] = useState(null); // { categoryKey, option } | null
  const [computingImpact, setComputingImpact] = useState(false);

  // Only manages the "checking" timer itself — computingImpact is set to
  // true synchronously in handleTapOption (batched with setPendingSwap),
  // not reactively here. That matters: the no-impact auto-apply effect
  // further below also keys off computingImpact, and if it were set true
  // only from this effect (a render behind pendingSwap), that effect would
  // see a stale computingImpact=false on the very first render after a tap
  // and could fire prematurely, before the checking beat even started.
  useEffect(() => {
    if (!pendingSwap) return;
    const t = setTimeout(() => setComputingImpact(false), IMPACT_CHECK_DELAY);
    return () => clearTimeout(t);
  }, [pendingSwap]);

  // "Show more options" — a free-text search scoped to whichever category's
  // swap view is open, against that destination's curated `morePool` (see
  // synthesizeRecommendation.js). Only Rishikesh's transports category has
  // a populated pool right now. The query itself comes in from the real
  // chat input via the `moreOptionsQuery` prop (see the effect below) —
  // this component only owns the search phase/results, not any input UI.
  const [moreSearchPhase, setMoreSearchPhase] = useState('idle'); // 'idle' | 'loading'
  const [moreQueryText, setMoreQueryText] = useState('');
  const [moreResults, setMoreResults] = useState(null); // null = showing the default options

  useEffect(() => {
    if (!moreOptionsQuery || !swapView || moreOptionsQuery.categoryKey !== swapView.categoryKey) return;
    setPendingSwap(null);
    setMoreQueryText(moreOptionsQuery.query);
    setMoreSearchPhase('loading');
    const t = setTimeout(() => {
      const pool = recState.morePool?.[swapView.categoryKey] || [];
      const excludeIds = swapView.options.map((o) => o.id);
      setMoreResults(pool.length ? findMoreOptions(pool, moreOptionsQuery.query, excludeIds, 3) : []);
      setMoreSearchPhase('idle');
    }, MORE_OPTIONS_SEARCH_DELAY);
    return () => clearTimeout(t);
    // Intentionally keyed only on the query object (a fresh { ..., nonce }
    // each time the user submits one via the chat bar) — swapView/recState
    // are read from the closure at the moment a new query arrives, which is
    // always current since this only fires in response to a genuinely new
    // submission, not general re-renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moreOptionsQuery]);

  // Tapping a "Reconciled Effort" / "Top Vibe Match" style badge reveals who
  // it's attributed to, instead of just being static, unexplained text.
  const [openBadge, setOpenBadge] = useState(null); // 'transport' | 'activities' | null
  const [openSwapBadgeId, setOpenSwapBadgeId] = useState(null);
  const votedByNames = recState.attributions && recState.attributions.length > 0
    ? recState.attributions.map((a) => a.sourceParticipant).join(', ')
    : null;

  // The dashboard's entrance animation (hero, confidence card, accordions)
  // should only ever play once — not every time the user backs out of an
  // Edit swap view and the dashboard remounts.
  const hasShownDashboardRef = useRef(false);
  useEffect(() => {
    hasShownDashboardRef.current = true;
  }, []);
  const entranceInitial = hasShownDashboardRef.current ? false : 'hidden';

  // Scroll position captured right before opening an Edit swap view, so
  // closing it (via Back or picking an option) can drop the user back
  // exactly where they were instead of wherever the swap view happened to
  // leave the scroll. Restored synchronously (useLayoutEffect, before
  // paint) rather than via requestAnimationFrame — the swap view's own
  // useLayoutEffect below forces the outer container to scrollTop 0 while
  // it's open, and a deferred (rAF-based) restore let that land on screen
  // for a frame first, reading as "scrolls to top, then jumps back down"
  // instead of a clean cut straight to the dashboard where Edit was tapped.
  const savedScrollTopRef = useRef(null);

  useLayoutEffect(() => {
    if (!swapView && savedScrollTopRef.current != null && scrollContainerRef?.current) {
      scrollContainerRef.current.scrollTop = savedScrollTopRef.current;
      savedScrollTopRef.current = null;
    }
  }, [swapView, scrollContainerRef]);

  // The swap view is a position:absolute overlay anchored to the messages
  // container's own coordinate space (see .synthesis-swap-view), not a
  // block in the normal scroll flow — so if the conversation had been
  // scrolled partway down before Edit was tapped, the overlay would
  // otherwise render off the top of the visible viewport until the user
  // scrolled back up themselves. Snapping scrollTop to 0 synchronously
  // (useLayoutEffect, before paint) keeps it always in view the instant it
  // opens, and its own internal scroll takes over from there — the
  // surrounding chat is never reachable while it's open.
  useLayoutEffect(() => {
    if (swapView && scrollContainerRef?.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [swapView, scrollContainerRef]);

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Moved above the scenario early-returns (rather than living next to
  // renderOptionCard/the swap-view JSX below) because the auto-apply effect
  // right after it is a hook, and hooks must run unconditionally on every
  // render — these handlers don't touch anything (activeTransport etc.)
  // that's only computed after those early returns, so relocating them here
  // is free.
  const resetSwapUiState = () => {
    setPendingSwap(null);
    setComputingImpact(false);
    setMoreSearchPhase('idle');
    setMoreQueryText('');
    setMoreResults(null);
    onMoreOptionsCategoryChange?.(null);
  };

  const handleOpenSwap = (categoryKey, title, options) => {
    savedScrollTopRef.current = scrollContainerRef?.current?.scrollTop ?? null;
    resetSwapUiState();
    setSwapView({ categoryKey, title, options });
    // Whatever accordion was just edited stays open on the way back —
    // dropping the user back on a collapsed section they just changed
    // would hide the very update they came from Edit to make.
    const openSectionsKey = SWAP_CATEGORY_TO_SECTION[categoryKey];
    if (openSectionsKey) {
      setOpenSections((prev) => ({ ...prev, [openSectionsKey]: true }));
    }
  };

  // Back always just returns to the dashboard, unchanged from before this
  // feature — any not-yet-confirmed preview is discarded silently, no
  // ripple text, no loading state.
  const handleCloseSwap = () => {
    resetSwapUiState();
    setSwapView(null);
  };

  // Tapping an option previews it, kicking off the brief "checking how this
  // affects your plan" beat — pendingSwap and computingImpact are set
  // together here (batched into one render) rather than computingImpact
  // being set reactively off pendingSwap, so they're never inconsistent on
  // the render right after a tap (see the no-impact auto-apply effect
  // above, which depends on that consistency). Tapping the currently-active
  // option, or re-tapping the option already being previewed, backs out of
  // the preview instead of applying anything.
  const handleTapOption = (opt) => {
    if (!swapView) return;
    const currentActive = swapView.options.find((o) => o.selected);
    if (currentActive?.id === opt.id || pendingSwap?.option.id === opt.id) {
      setPendingSwap(null);
      setComputingImpact(false);
      return;
    }
    setPendingSwap({ categoryKey: swapView.categoryKey, option: opt });
    setComputingImpact(true);
  };

  // Applies the swap — the loading beat already happened right after the
  // option was tapped (computingImpact above), not here. Includes the one
  // wired downstream effect (transport -> Day 1 arrival + timing note).
  // Options that came from a "show more options" search aren't already in
  // recState[categoryKey], so they're appended rather than matched by id.
  const handleConfirmChange = () => {
    if (!pendingSwap) return;
    const { categoryKey, option } = pendingSwap;

    // Built from `recState` directly (not the setRecState functional-updater
    // form) so `updated` exists as a plain value here — onUpdate?.(updated)
    // needs to run as its own state update on the parent, not from inside
    // this component's own updater callback, which fires during React's
    // render phase and would try to update the parent mid-render.
    const prev = recState;
    const prevActive = prev[categoryKey].find((o) => o.selected);
    const alreadyKnown = prev[categoryKey].some((o) => o.id === option.id);
    const updatedList = alreadyKnown
      ? prev[categoryKey].map((opt) => ({ ...opt, selected: opt.id === option.id }))
      : [...prev[categoryKey].map((opt) => ({ ...opt, selected: false })), { ...option, selected: true }];
    const updated = { ...prev, [categoryKey]: updatedList };

    if (categoryKey === 'dateOptions') {
      updated.dates = updatedList.find((opt) => opt.id === option.id)?.title ?? prev.dates;
    }

    if (categoryKey === 'transports' && prev.itinerary?.length) {
      const arrivalChanged = prevActive?.arrivalTime && option.arrivalTime && prevActive.arrivalTime !== option.arrivalTime;
      updated.itinerary = prev.itinerary.map((day, idx) => {
        if (idx !== 0) return day;
        const nextDay = { ...day, transportMode: option.title };
        if (arrivalChanged && day.timeSensitiveActivities?.length) {
          const oldMin = parseClockMinutes(prevActive.arrivalTime);
          const newMin = parseClockMinutes(option.arrivalTime);
          const direction = newMin != null && oldMin != null && newMin > oldMin ? 'later' : 'earlier';
          nextDay.timingNote = `Arrival now ${option.arrivalTime} — the ${joinWithAnd(day.timeSensitiveActivities)} shifted ${direction} to match.`;
        } else {
          delete nextDay.timingNote;
        }
        return nextDay;
      });
    }

    setRecState(updated);
    onUpdate?.(updated);
    resetSwapUiState();
    setSwapView(null);
  };

  // ── EDGE CASE — everyone deferred ("you decide for me") ──────────────
  // Every response received chose defer, so there's no real preference
  // data to honestly synthesize a pick from. Renders a dedicated honest
  // state instead of the normal dashboard — the organizer either picks
  // from the inventory themselves or waits for more responses.
  if (recState.scenario === 'all_deferred') {
    const handleManualPick = (item) => {
      const budgetLabel = (recState.budgetPerPerson || item.costPerPerson).toLocaleString('en-IN');
      const rec = buildRecommendationFromInventoryItem(item, {
        scenario: 'manual_pick',
        whyItFits: [
          `You picked ${item.destination} (${item.hotel}) yourself since no one had a strong preference.`,
          `Fits within your ₹${budgetLabel} per-person budget.`,
        ],
        budgetPerPerson: recState.budgetPerPerson,
      });
      setRecState(rec);
      onUpdate?.(rec);
    };

    return (
      <div className="honest-state-card">
        <span className="honest-state-icon">🤷</span>
        <h3 className="honest-state-title">Everyone left this up to you</h3>
        <p className="honest-state-text">
          {recState.respondedCount} of {recState.groupSize} friends replied, and everyone chose "you decide for me" — no strong preferences came in. Rather than guess, here's what you can do:
        </p>

        {!manualPickOpen ? (
          <div className="honest-state-actions">
            <button type="button" className="btn-secondary" onClick={() => setManualPickOpen(true)}>
              Pick a destination myself
            </button>
            <button type="button" className="btn-tertiary" onClick={() => onExtendRound?.()}>
              Give it more time
            </button>
          </div>
        ) : (
          <div className="synthesis-swap-list honest-state-picker">
            {mockInventory.map((item) => (
              <button key={item.id} type="button" className="synthesis-swap-option" onClick={() => handleManualPick(item)}>
                <div className="synthesis-swap-option-body">
                  <div className="synthesis-swap-option-top">
                    <h4 className="synthesis-swap-option-title">{item.destination} — {item.hotel}</h4>
                  </div>
                  <span className="synthesis-swap-option-type">{item.vibe} • {item.pace}</span>
                  <p className="active-item-desc">{item.evidence}</p>
                  <div className="synthesis-swap-option-footer">
                    <span className="active-item-price">₹{item.costPerPerson.toLocaleString('en-IN')} / person</span>
                    <span className="synthesis-swap-select-hint">Select</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── EDGE CASE — real-world risk overrides a popular pick ──────────────
  // The organizer's named destination matches a riskFlag-carrying mock
  // inventory entry. Instead of quietly folding this into the budget or
  // polarized-split cases, the organizer sees the flagged pick and a
  // safer alternative side by side, with the risk evidence surfaced the
  // same way real-world evidence is elsewhere in this flow, and picks
  // either one before a dashboard is assembled.
  if (recState.scenario === 'risk_override_pending') {
    const { flaggedPick, saferAlternative } = recState;

    const handleChooseRisk = (item, isFlaggedChoice) => {
      onChooseRiskOption?.(item, isFlaggedChoice, flaggedPick);
    };

    return (
      <div className="risk-choice-panel">
        <h3 className="honest-state-title">Most leaned toward {flaggedPick.destination}, but I found a risk during your travel window</h3>
        <div className="risk-flag">
          <span>{flaggedPick.riskFlag}</span>
        </div>

        {flaggedPick.riskEvidence && (
          <p className="risk-evidence-text">
            {flaggedPick.riskEvidence.quote}
            <span className="risk-evidence-source"> — {flaggedPick.riskEvidence.platform}</span>
          </p>
        )}

        <div className="risk-choice-options">
          <button type="button" className="synthesis-swap-option risk-choice-option" onClick={() => handleChooseRisk(flaggedPick, true)}>
            <div className="synthesis-swap-option-body">
              <div className="synthesis-swap-option-top">
                <h4 className="synthesis-swap-option-title">{flaggedPick.destination} — {flaggedPick.hotel}</h4>
              </div>
              <span className="synthesis-swap-option-type">Popular pick • has the flagged risk</span>
              <p className="active-item-desc">{flaggedPick.evidence}</p>
              <div className="synthesis-swap-option-footer">
                <span className="active-item-price">₹{flaggedPick.costPerPerson.toLocaleString('en-IN')} / person</span>
                <span className="synthesis-swap-select-hint">Select anyway</span>
              </div>
            </div>
          </button>
          <button type="button" className="synthesis-swap-option risk-choice-option" onClick={() => handleChooseRisk(saferAlternative, false)}>
            <div className="synthesis-swap-option-body">
              <div className="synthesis-swap-option-top">
                <h4 className="synthesis-swap-option-title">{saferAlternative.destination} — {saferAlternative.hotel}</h4>
              </div>
              <span className="synthesis-swap-option-type">Safer alternative • avoids the risk</span>
              <p className="active-item-desc">{saferAlternative.evidence}</p>
              <div className="synthesis-swap-option-footer">
                <span className="active-item-price">₹{saferAlternative.costPerPerson.toLocaleString('en-IN')} / person</span>
                <span className="synthesis-swap-select-hint">Select instead</span>
              </div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  const activeDate = recState.dateOptions?.find((d) => d.selected) || recState.dateOptions?.[0] || { title: recState.dates, desc: '' };
  const activeTransport = recState.transports.find((t) => t.selected) || recState.transports[0];
  const activeStay = recState.stays.find((s) => s.selected) || recState.stays[0];
  const activeActivity = recState.activities.find((a) => a.selected) || recState.activities[0];

  const totalCost = activeTransport.cost + activeStay.cost + activeActivity.cost;

  // hero, confidence, 6 accordions, then the approve button.
  const [heroDelay, confidenceDelay, datesDelay, transportDelay, stayDelay, activitiesDelay, resolvedDelay, evidenceDelay] =
    sequenceDelays(Array(8).fill(BLOCK_STAGGER), startDelay);
  const approveDelay = startDelay + 8 * BLOCK_STAGGER;

  // Renders one option card — used for both the main swap list and any
  // "show more options" search results, so both go through the exact same
  // preview -> impact-check -> confirm flow.
  const renderOptionCard = (opt) => {
    const isSelected = !!opt.selected;
    const isPending = pendingSwap?.option.id === opt.id;
    const isChecking = isPending && computingImpact;
    const impactBullets = isPending && !computingImpact ? buildImpactBullets(recState, swapView.categoryKey, opt) : [];

    return (
      <React.Fragment key={opt.id}>
        <motion.button
          type="button"
          variants={peerItemVariants}
          className={`synthesis-swap-option ${isSelected ? 'selected' : ''} ${isPending ? 'pending' : ''}`}
          onClick={() => handleTapOption(opt)}
        >
          {opt.image && (
            <img src={opt.image} alt={opt.title} className="synthesis-swap-option-img" />
          )}
          <div className="synthesis-swap-option-body">
            <div className="synthesis-swap-option-top">
              <h4 className="synthesis-swap-option-title">{opt.title}</h4>
              {isSelected && (
                <span className="synthesis-swap-active-pill">
                  <Check size={12} /> Active
                </span>
              )}
            </div>
            {!isSelected && isPending && (
              <span className="synthesis-swap-pending-pill">Previewing — confirm below</span>
            )}
            {opt.badge && (
              <TagBadge
                label={opt.badge}
                asSpan
                isOpen={openSwapBadgeId === opt.id}
                onToggle={() => setOpenSwapBadgeId((id) => (id === opt.id ? null : opt.id))}
                tooltipText={votedByNames ? `Voted by ${votedByNames}` : 'No individual votes recorded for this trip yet.'}
              />
            )}
            {opt.type && <span className="synthesis-swap-option-type">{opt.type} • {opt.rating}</span>}
            {opt.desc && <p className="active-item-desc">{opt.desc}</p>}
            {opt.arrivalTime && <p className="active-item-desc">Arrives {opt.arrivalTime}</p>}
            {opt.items && (
              <ul className="activity-list-items">
                {opt.items.map((item, idx) => (
                  <li key={idx}>• {item}</li>
                ))}
              </ul>
            )}
            <div className="synthesis-swap-option-footer">
              {typeof opt.cost === 'number' && (
                <span className="active-item-price">₹{opt.cost.toLocaleString('en-IN')} / person</span>
              )}
              {!isPending && (
                <span className={`synthesis-swap-select-hint ${isSelected ? 'selected' : ''}`}>
                  {isSelected ? 'Selected' : 'Select option'}
                </span>
              )}
            </div>
          </div>
        </motion.button>

        {isPending && (
          <motion.div
            className="swap-impact-preview"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            {isChecking ? (
              <SwapInlineLoader text="Checking how this affects your plan…" />
            ) : (
              <>
                <span className="swap-impact-header">Here's what changes</span>
                {impactBullets.length > 0 ? (
                  <ul className="swap-impact-list">
                    {impactBullets.map((bullet, idx) => (
                      <li key={idx} className={bullet.warning ? 'swap-impact-warning' : undefined}>{bullet.text}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="swap-impact-honest">No other changes needed, everything else in your plan stays the same.</p>
                )}
                <button type="button" className="btn-secondary swap-impact-confirm-btn" onClick={handleConfirmChange}>
                  Confirm this change
                </button>
              </>
            )}
          </motion.div>
        )}
      </React.Fragment>
    );
  };

  if (swapView) {
    const morePoolSize = recState.morePool?.[swapView.categoryKey]?.length ?? 0;
    const awaitingMoreOptionsQuery = moreOptionsActiveCategory === swapView.categoryKey;
    const showingMoreResults = moreResults != null;

    return (
      <motion.div
        className="synthesis-swap-view"
        initial={{ opacity: 0, x: SWAP_NAV_OFFSET_X }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: SWAP_NAV_DURATION, ease: EASE }}
      >
        <div className="synthesis-swap-sticky-header">
          <button type="button" className="synthesis-swap-back" onClick={handleCloseSwap}>
            <ArrowLeft size={16} /> Back
          </button>

          <div className="synthesis-swap-heading">
            <h3 className="synthesis-swap-title">Change {swapView.title}</h3>
            <p className="synthesis-swap-subtitle">Select an alternative option considered by Myra</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {moreSearchPhase === 'loading' ? (
            <motion.div
              key="more-loading"
              className="swap-more-options-loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <SwapInlineLoader text={`Finding options for "${moreQueryText}"…`} />
            </motion.div>
          ) : (
            <motion.div
              key={showingMoreResults ? 'more-results' : 'default-options'}
              className="synthesis-swap-list"
              variants={peerContainerVariants(0.1)}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
            >
              {showingMoreResults && moreResults.length === 0 ? (
                <p className="swap-more-options-empty">
                  {morePoolSize > 0
                    ? "Didn't find a close match — try different words in the chat bar below."
                    : 'No more options to search for this category in this demo yet.'}
                </p>
              ) : (
                (showingMoreResults ? moreResults : swapView.options).map(renderOptionCard)
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {onMoreOptionsCategoryChange && (
          <button
            type="button"
            className="btn-secondary swap-more-options-btn"
            disabled={awaitingMoreOptionsQuery || moreSearchPhase === 'loading'}
            onClick={() => onMoreOptionsCategoryChange(swapView.categoryKey)}
          >
            <MessageSquarePlus size={14} />
            {awaitingMoreOptionsQuery ? 'Type what you want in the chat bar below…' : 'Show more options'}
          </button>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      className="synthesis-revamped-dashboard"
      initial={hasShownDashboardRef.current ? { opacity: 0, x: SWAP_NAV_OFFSET_X } : false}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: SWAP_NAV_DURATION, ease: EASE }}
    >
      {/* ── HERO HEADER ────────────────────────── */}
      <motion.div className="synthesis-hero-banner" variants={blockVariants} custom={heroDelay} initial={entranceInitial} animate="visible">
        <img src={recState.heroImage} alt={recState.destination} className="synthesis-hero-img" />
        <div className="synthesis-hero-overlay" />
        <div className="synthesis-hero-content">
          <div className="synthesis-hero-badge">
            <Trophy size={13} /> Group's winning pick
          </div>
          <h1 className="synthesis-hero-title">{recState.destination}</h1>
          <div className="synthesis-hero-meta">
            <span className="hero-meta-pill">
              {activeDate.title}
              <span className="hero-meta-pill-note"> · Proposed</span>
            </span>
            <span className="hero-meta-pill font-bold">₹{totalCost.toLocaleString('en-IN')} / person</span>
            {recState.weather && <span className="hero-meta-pill">{recState.weather}</span>}
          </div>
        </div>
      </motion.div>

      {/* ── CONFIDENCE SUMMARY ──────────────────── */}
      <motion.div className="synthesis-confidence-card" variants={blockVariants} custom={confidenceDelay} initial={entranceInitial} animate="visible">
        <div className="confidence-badge-row">
          <span className="confidence-tag">
            <span className="accordion-icon-chip"><CheckCircle2 size={16} /></span>
            Synthesis
          </span>
        </div>

        {recState.whyItFits && recState.whyItFits.length > 0 && (
          <ul className="confidence-reasoning-list">
            {recState.whyItFits.map((point, idx) => (
              <li key={idx}>{point}</li>
            ))}
          </ul>
        )}
      </motion.div>

      {/* ── SECTION ACCORDIONS ────────────────── */}
      <div className="synthesis-accordions-group">

        {/* DATES */}
        <motion.div className="accordion-card" variants={blockVariants} custom={datesDelay} initial={entranceInitial} animate="visible">
          <AccordionHeaderRow
            icon={<Calendar size={16} />}
            heading="Dates"
            subtext={activeDate.title}
            isOpen={openSections.dates}
            onToggle={() => toggleSection('dates')}
            onEdit={recState.dateOptions ? () => handleOpenSwap('dateOptions', 'dates', recState.dateOptions) : null}
          />

          {openSections.dates && (
            <AccordionBody>
              <div className="dates-reasoning-box">
                <span className="dates-reasoning-tag">{activeDate.badge || 'Synthesis insight'}</span>
                <p className="dates-reasoning-text">{activeDate.desc}</p>
              </div>
            </AccordionBody>
          )}
        </motion.div>

        {/* GETTING THERE */}
        <motion.div className="accordion-card" variants={blockVariants} custom={transportDelay} initial={entranceInitial} animate="visible">
          <AccordionHeaderRow
            icon={<Navigation size={16} />}
            heading="Getting there"
            subtext={`${activeTransport.title} • ₹${activeTransport.cost.toLocaleString('en-IN')}`}
            isOpen={openSections.transport}
            onToggle={() => toggleSection('transport')}
            onEdit={() => handleOpenSwap('transports', 'getting there', recState.transports)}
          />

          {openSections.transport && (
            <AccordionBody>
              <div className="active-item-preview">
                <div className="active-item-top">
                  <TagBadge
                    label={activeTransport.badge}
                    isOpen={openBadge === 'transport'}
                    onToggle={() => setOpenBadge((b) => (b === 'transport' ? null : 'transport'))}
                    tooltipText={votedByNames ? `Voted by ${votedByNames}` : 'No individual votes recorded for this trip yet.'}
                  />
                  <span className="active-item-price">₹{activeTransport.cost.toLocaleString('en-IN')} / person</span>
                </div>
                <h4 className="active-item-title">{activeTransport.title}</h4>
                <p className="active-item-desc">{activeTransport.desc} ({activeTransport.duration})</p>
                {activeTransport.arrivalTime && <p className="active-item-desc">Arrives {activeTransport.arrivalTime}</p>}
              </div>
            </AccordionBody>
          )}
        </motion.div>

        {/* STAY */}
        <motion.div className="accordion-card" variants={blockVariants} custom={stayDelay} initial={entranceInitial} animate="visible">
          <AccordionHeaderRow
            icon={<Home size={16} />}
            heading="Stay"
            subtext={`${activeStay.title} • ₹${activeStay.cost.toLocaleString('en-IN')}`}
            isOpen={openSections.stay}
            onToggle={() => toggleSection('stay')}
            onEdit={() => handleOpenSwap('stays', 'stay', recState.stays)}
          />

          {openSections.stay && (
            <AccordionBody>
              <div className="active-item-preview flex-row">
                {activeStay.image && (
                  <img src={activeStay.image} alt={activeStay.title} className="active-item-img" />
                )}
                <div className="active-item-details">
                  <div className="active-item-top">
                    <span className="active-item-badge">{activeStay.type} • {activeStay.rating}</span>
                  </div>
                  <h4 className="active-item-title">{activeStay.title}</h4>
                  <p className="active-item-desc">{activeStay.desc}</p>
                  <span className="active-item-price">₹{activeStay.cost.toLocaleString('en-IN')} / person</span>
                </div>
              </div>
            </AccordionBody>
          )}
        </motion.div>

        {/* THINGS TO DO */}
        <motion.div className="accordion-card" variants={blockVariants} custom={activitiesDelay} initial={entranceInitial} animate="visible">
          <AccordionHeaderRow
            icon={<Compass size={16} />}
            heading="Things to do"
            subtext={activeActivity.title}
            isOpen={openSections.activities}
            onToggle={() => toggleSection('activities')}
            onEdit={() => handleOpenSwap('activities', 'things to do', recState.activities)}
          />

          {openSections.activities && (
            <AccordionBody>
              <div className="active-item-preview">
                <div className="active-item-top">
                  <TagBadge
                    label={activeActivity.badge}
                    isOpen={openBadge === 'activities'}
                    onToggle={() => setOpenBadge((b) => (b === 'activities' ? null : 'activities'))}
                    tooltipText={votedByNames ? `Voted by ${votedByNames}` : 'No individual votes recorded for this trip yet.'}
                  />
                  <span className="active-item-price">₹{activeActivity.cost.toLocaleString('en-IN')} / person</span>
                </div>
                <h4 className="active-item-title">{activeActivity.title}</h4>
                {activeActivity.items && (
                  <ul className="activity-list-items">
                    {activeActivity.items.map((it, idx) => (
                      <li key={idx}>✓ {it}</li>
                    ))}
                  </ul>
                )}
              </div>
            </AccordionBody>
          )}
        </motion.div>

        {/* WHAT WE RESOLVED */}
        <motion.div className="accordion-card" variants={blockVariants} custom={resolvedDelay} initial={entranceInitial} animate="visible">
          <AccordionHeaderRow
            icon={<Scale size={16} />}
            heading="What we resolved"
            subtext="Conflict handling & synthesis summary"
            isOpen={openSections.resolved}
            onToggle={() => toggleSection('resolved')}
          />

          {openSections.resolved && (
            <AccordionBody>
              <div className="resolved-summary-box">
                <ul className="resolved-summary-list">
                  {recState.resolvedSummary.map((item, idx) => (
                    <li key={idx}><strong>{item.label}:</strong> {item.detail}</li>
                  ))}
                </ul>

                {recState.attributions && recState.attributions.length > 0 && (
                  <div className="resolved-attributions">
                    <span className="attribution-label">Participant inputs</span>
                    <div className="attribution-pills">
                      {recState.attributions.map((attr, idx) => (
                        <span key={idx} className="attribution-pill">
                          <strong>{attr.sourceParticipant}:</strong> {attr.text}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </AccordionBody>
          )}
        </motion.div>

        {/* REAL-WORLD EVIDENCE & COMMUNITY PROOF */}
        <motion.div className="accordion-card" variants={blockVariants} custom={evidenceDelay} initial={entranceInitial} animate="visible">
          <AccordionHeaderRow
            icon={<MessageSquareQuote size={16} />}
            heading="Real-world evidence & reviews"
            subtext="420+ verified traveler reviews"
            isOpen={openSections.evidence}
            onToggle={() => toggleSection('evidence')}
          />

          {openSections.evidence && (
            <AccordionBody>
              {recState.evidenceSources && recState.evidenceSources.length > 0 && (
                <div className="community-proof-list">
                  {recState.evidenceSources.map((ev, idx) => (
                    <div key={idx} className="community-proof-card">
                      <div className="proof-card-header">
                        <span className="proof-platform-tag">{ev.platform}</span>
                        <span className="proof-author">{ev.author}</span>
                      </div>
                      <p className="proof-quote">{ev.quote}</p>
                    </div>
                  ))}
                </div>
              )}
            </AccordionBody>
          )}
        </motion.div>

      </div>

      {/* ── FOOTER APPROVAL ────────────────────────── */}
      <motion.div className="synthesis-footer-action" variants={blockVariants} custom={approveDelay} initial={entranceInitial} animate="visible">
        <button
          type="button"
          className="btn-secondary approve-itinerary-btn"
          onClick={onApprove}
        >
          Approve itinerary
        </button>
      </motion.div>
    </motion.div>
  );
};

export default SynthesisResult;
