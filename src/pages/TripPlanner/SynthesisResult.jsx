import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  AlertTriangle,
} from 'lucide-react';
import {
  blockVariants,
  BLOCK_STAGGER,
  BLOCK_Y,
  EASE,
  sequenceDelays,
  peerContainerVariants,
  peerItemVariants,
} from '../../components/AIChatbot/motionConfig';
import { mockInventory } from '../../lib/mockInventory';
import { buildRecommendationFromInventoryItem } from '../../lib/synthesizeRecommendation';

// The Edit -> options-swap transition reads better a bit slower than the
// standard block entrance (BLOCK_DURATION) — it's a bigger jump in content.
const SWAP_VIEW_DURATION = 1.15;

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
const SynthesisResult = ({ recommendation, onUpdate, onApprove, onExtendRound, startDelay = 0, scrollContainerRef }) => {
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
  // leave the scroll.
  const savedScrollTopRef = useRef(null);
  const swapBackRef = useRef(null);

  useEffect(() => {
    if (swapView) {
      requestAnimationFrame(() => {
        swapBackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    } else if (savedScrollTopRef.current != null && scrollContainerRef?.current) {
      const savedTop = savedScrollTopRef.current;
      savedScrollTopRef.current = null;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = savedTop;
        });
      });
    }
  }, [swapView, scrollContainerRef]);

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
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
      const rec = buildRecommendationFromInventoryItem(item, {
        scenario: 'risk_override_resolved',
        whyItFits: isFlaggedChoice
          ? [
              `Most of the signal pointed to ${item.destination} — going with it despite the flagged risk.`,
              `${item.hotel} fits your group's budget at ₹${item.costPerPerson.toLocaleString('en-IN')} per person.`,
            ]
          : [
              `Picked to avoid the flagged risk on ${flaggedPick.destination}.`,
              `${item.hotel} in ${item.destination} fits your group's budget at ₹${item.costPerPerson.toLocaleString('en-IN')} per person.`,
            ],
        riskFlag: isFlaggedChoice ? item.riskFlag : null,
        extraEvidence: isFlaggedChoice && item.riskEvidence ? [item.riskEvidence] : [],
      });
      setRecState(rec);
      onUpdate?.(rec);
    };

    return (
      <div className="risk-choice-panel">
        <h3 className="honest-state-title">Most of the group leaned toward {flaggedPick.destination}</h3>
        <div className="risk-flag">
          <AlertTriangle size={15} />
          <span>{flaggedPick.riskFlag}</span>
        </div>

        {flaggedPick.riskEvidence && (
          <div className="community-proof-card">
            <div className="proof-card-header">
              <span className="proof-platform-tag">{flaggedPick.riskEvidence.platform}</span>
              <span className="proof-author">{flaggedPick.riskEvidence.author}</span>
            </div>
            <p className="proof-quote">{flaggedPick.riskEvidence.quote}</p>
          </div>
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

  const handleOpenSwap = (categoryKey, title, options) => {
    savedScrollTopRef.current = scrollContainerRef?.current?.scrollTop ?? null;
    setSwapView({ categoryKey, title, options });
  };

  const handleCloseSwap = () => setSwapView(null);

  const handleSelectOption = (optionId) => {
    if (!swapView) return;
    const { categoryKey } = swapView;
    setRecState((prev) => {
      const updatedList = prev[categoryKey].map((opt) => ({ ...opt, selected: opt.id === optionId }));
      const updated = { ...prev, [categoryKey]: updatedList };
      if (categoryKey === 'dateOptions') {
        updated.dates = updatedList.find((opt) => opt.id === optionId)?.title ?? prev.dates;
      }
      onUpdate?.(updated);
      return updated;
    });
    handleCloseSwap();
  };

  // hero, confidence, 6 accordions, then the approve button.
  const [heroDelay, confidenceDelay, datesDelay, transportDelay, stayDelay, activitiesDelay, resolvedDelay, evidenceDelay] =
    sequenceDelays(Array(8).fill(BLOCK_STAGGER), startDelay);
  const approveDelay = startDelay + 8 * BLOCK_STAGGER;

  if (swapView) {
    return (
      <motion.div
        className="synthesis-swap-view"
        initial={{ opacity: 0, y: BLOCK_Y }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: SWAP_VIEW_DURATION, ease: EASE }}
      >
        <button type="button" ref={swapBackRef} className="synthesis-swap-back" onClick={handleCloseSwap}>
          <ArrowLeft size={16} /> Back
        </button>

        <div className="synthesis-swap-heading">
          <h3 className="synthesis-swap-title">Change {swapView.title}</h3>
          <p className="synthesis-swap-subtitle">Select an alternative option considered by Myra</p>
        </div>

        <motion.div className="synthesis-swap-list" variants={peerContainerVariants(0.15)} initial="hidden" animate="visible">
          {swapView.options.map((opt) => {
            const isSelected = opt.selected;
            return (
              <motion.button
                key={opt.id}
                type="button"
                variants={peerItemVariants}
                className={`synthesis-swap-option ${isSelected ? 'selected' : ''}`}
                onClick={() => handleSelectOption(opt.id)}
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
                    <span className={`synthesis-swap-select-hint ${isSelected ? 'selected' : ''}`}>
                      {isSelected ? 'Selected' : 'Select option'}
                    </span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="synthesis-revamped-dashboard">
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
            <span className="hero-meta-pill">{activeDate.title}</span>
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
    </div>
  );
};

export default SynthesisResult;
