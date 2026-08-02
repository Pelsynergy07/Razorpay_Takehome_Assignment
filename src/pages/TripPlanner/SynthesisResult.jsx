import React, { useState } from 'react';
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
  Sparkles,
  CheckCircle2,
  Check,
  MessageSquareQuote,
  Info,
} from 'lucide-react';

const viewTransition = { duration: 0.4, ease: [0.16, 1, 0.3, 1] };

/**
 * Screen 4.2 — synthesis result dashboard with 5 section accordions:
 * Dates, Getting there, Stay, Things to do, What we resolved. Editing a
 * category opens a "swap" view in place of the dashboard (still inside
 * the same chat panel), rather than a separate modal.
 */
const SynthesisResult = ({ recommendation, onUpdate, onApprove }) => {
  const [recState, setRecState] = useState(recommendation);

  const [openSections, setOpenSections] = useState({
    dates: true,
    transport: true,
    stay: true,
    activities: true,
    resolved: true,
    evidence: true,
  });

  // In-panel swap view — replaces the dashboard while active, instead of
  // a modal rendered outside the chat sheet.
  const [swapView, setSwapView] = useState(null); // { categoryKey, title, options } | null

  // Tiny "why" source icon on the confidence card — reasoning stays
  // collapsed by default, tap to reveal.
  const [showReasoning, setShowReasoning] = useState(false);

  // Tapping a "Reconciled Effort" / "Top Vibe Match" style badge reveals who
  // it's attributed to, instead of just being static, unexplained text.
  const [openBadge, setOpenBadge] = useState(null); // 'transport' | 'activities' | null
  const [openSwapBadgeId, setOpenSwapBadgeId] = useState(null);
  const votedByNames = recState.attributions && recState.attributions.length > 0
    ? recState.attributions.map((a) => a.sourceParticipant).join(', ')
    : null;

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const activeTransport = recState.transports.find((t) => t.selected) || recState.transports[0];
  const activeStay = recState.stays.find((s) => s.selected) || recState.stays[0];
  const activeActivity = recState.activities.find((a) => a.selected) || recState.activities[0];

  const totalCost = activeTransport.cost + activeStay.cost + activeActivity.cost;

  const handleOpenSwap = (categoryKey, title, options) => {
    setSwapView({ categoryKey, title, options });
  };

  const handleCloseSwap = () => setSwapView(null);

  const handleSelectOption = (optionId) => {
    if (!swapView) return;
    const { categoryKey } = swapView;
    setRecState((prev) => {
      const updated = {
        ...prev,
        [categoryKey]: prev[categoryKey].map((opt) => ({ ...opt, selected: opt.id === optionId })),
      };
      onUpdate?.(updated);
      return updated;
    });
    handleCloseSwap();
  };

  return (
    <AnimatePresence mode="wait">
      {swapView ? (
        <motion.div
          key="swap"
          className="synthesis-swap-view"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 24 }}
          transition={viewTransition}
        >
          <button type="button" className="synthesis-swap-back" onClick={handleCloseSwap}>
            <ArrowLeft size={16} /> Back
          </button>

          <div className="synthesis-swap-heading">
            <h3 className="synthesis-swap-title">Change {swapView.title}</h3>
            <p className="synthesis-swap-subtitle">Select an alternative option considered by Myra</p>
          </div>

          <div className="synthesis-swap-list">
            {swapView.options.map((opt) => {
              const isSelected = opt.selected;
              return (
                <button
                  key={opt.id}
                  type="button"
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
                      <span
                        role="button"
                        tabIndex={0}
                        className="active-item-badge badge-clickable"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenSwapBadgeId((id) => (id === opt.id ? null : opt.id));
                        }}
                      >
                        {opt.badge}
                      </span>
                    )}
                    <AnimatePresence>
                      {openSwapBadgeId === opt.id && (
                        <motion.p
                          className="voted-by-text"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          style={{ overflow: 'hidden' }}
                        >
                          {votedByNames ? `Voted by ${votedByNames}` : 'No individual votes recorded for this trip yet.'}
                        </motion.p>
                      )}
                    </AnimatePresence>
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
                      <span className="active-item-price">₹{opt.cost.toLocaleString('en-IN')} / person</span>
                      <span className={`synthesis-swap-select-hint ${isSelected ? 'selected' : ''}`}>
                        {isSelected ? 'Selected' : 'Select option'}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="main"
          className="synthesis-revamped-dashboard"
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={viewTransition}
        >
          {/* ── HERO HEADER ────────────────────────── */}
          <div className="synthesis-hero-banner">
            <img src={recState.heroImage} alt={recState.destination} className="synthesis-hero-img" />
            <div className="synthesis-hero-overlay" />
            <div className="synthesis-hero-content">
              <div className="synthesis-hero-badge">
                <Sparkles size={13} /> Recommended trip
              </div>
              <h1 className="synthesis-hero-title">{recState.destination}</h1>
              <div className="synthesis-hero-meta">
                <span className="hero-meta-pill">{recState.dates}</span>
                <span className="hero-meta-pill font-bold">₹{totalCost.toLocaleString('en-IN')} / person</span>
                {recState.weather && <span className="hero-weather-badge">{recState.weather}</span>}
              </div>
            </div>
          </div>

          {/* ── CONFIDENCE SUMMARY ──────────────────── */}
          <div className="synthesis-confidence-card">
            <div className="confidence-badge-row">
              <span className="confidence-tag">
                <span className="accordion-icon-chip"><CheckCircle2 size={16} /></span>
                {recState.confidenceLevel === 'high' ? 'High consensus' : 'Moderate consensus'}
              </span>
              <button
                type="button"
                className="confidence-source-btn"
                onClick={() => setShowReasoning((s) => !s)}
                aria-label="Why this recommendation"
              >
                <Info size={13} />
              </button>
            </div>

            <AnimatePresence>
              {showReasoning && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  style={{ overflow: 'hidden' }}
                >
                  <p className="confidence-reasoning">{recState.whyItFits}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── SECTION ACCORDIONS ────────────────── */}
          <div className="synthesis-accordions-group">

            {/* DATES */}
            <div className="accordion-card">
              <button type="button" className="accordion-header" onClick={() => toggleSection('dates')}>
                <div className="accordion-title-group">
                  <span className="accordion-icon-chip"><Calendar size={16} /></span>
                  <div>
                    <h3 className="accordion-heading">Dates</h3>
                    <span className="accordion-subtext">{recState.dates}</span>
                  </div>
                </div>
                {openSections.dates ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>

              <AnimatePresence>
                {openSections.dates && (
                  <motion.div
                    className="accordion-body"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <div className="dates-reasoning-box">
                      <span className="dates-reasoning-tag">Synthesis insight</span>
                      <p className="dates-reasoning-text">"{recState.datesReasoning}"</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* GETTING THERE */}
            <div className="accordion-card">
              <div className="accordion-header-row">
                <button type="button" className="accordion-header flex-1" onClick={() => toggleSection('transport')}>
                  <div className="accordion-title-group">
                    <span className="accordion-icon-chip"><Navigation size={16} /></span>
                    <div>
                      <h3 className="accordion-heading">Getting there</h3>
                      <span className="accordion-subtext">{activeTransport.title} • ₹{activeTransport.cost.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  {openSections.transport ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                <button
                  type="button"
                  className="accordion-edit-btn"
                  onClick={() => handleOpenSwap('transports', 'getting there', recState.transports)}
                >
                  <Edit3 size={14} /> Edit
                </button>
              </div>

              <AnimatePresence>
                {openSections.transport && (
                  <motion.div
                    className="accordion-body"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <div className="active-item-preview">
                      <div className="active-item-top">
                        <button
                          type="button"
                          className="active-item-badge badge-clickable"
                          onClick={() => setOpenBadge((b) => (b === 'transport' ? null : 'transport'))}
                        >
                          {activeTransport.badge}
                        </button>
                        <span className="active-item-price">₹{activeTransport.cost.toLocaleString('en-IN')} / person</span>
                      </div>
                      <AnimatePresence>
                        {openBadge === 'transport' && (
                          <motion.p
                            className="voted-by-text"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            style={{ overflow: 'hidden' }}
                          >
                            {votedByNames ? `Voted by ${votedByNames}` : 'No individual votes recorded for this trip yet.'}
                          </motion.p>
                        )}
                      </AnimatePresence>
                      <h4 className="active-item-title">{activeTransport.title}</h4>
                      <p className="active-item-desc">{activeTransport.desc} ({activeTransport.duration})</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* STAY */}
            <div className="accordion-card">
              <div className="accordion-header-row">
                <button type="button" className="accordion-header flex-1" onClick={() => toggleSection('stay')}>
                  <div className="accordion-title-group">
                    <span className="accordion-icon-chip"><Home size={16} /></span>
                    <div>
                      <h3 className="accordion-heading">Stay</h3>
                      <span className="accordion-subtext">{activeStay.title} • ₹{activeStay.cost.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  {openSections.stay ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                <button
                  type="button"
                  className="accordion-edit-btn"
                  onClick={() => handleOpenSwap('stays', 'stay', recState.stays)}
                >
                  <Edit3 size={14} /> Edit
                </button>
              </div>

              <AnimatePresence>
                {openSections.stay && (
                  <motion.div
                    className="accordion-body"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
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
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* THINGS TO DO */}
            <div className="accordion-card">
              <div className="accordion-header-row">
                <button type="button" className="accordion-header flex-1" onClick={() => toggleSection('activities')}>
                  <div className="accordion-title-group">
                    <span className="accordion-icon-chip"><Compass size={16} /></span>
                    <div>
                      <h3 className="accordion-heading">Things to do</h3>
                      <span className="accordion-subtext">{activeActivity.title}</span>
                    </div>
                  </div>
                  {openSections.activities ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                <button
                  type="button"
                  className="accordion-edit-btn"
                  onClick={() => handleOpenSwap('activities', 'things to do', recState.activities)}
                >
                  <Edit3 size={14} /> Edit
                </button>
              </div>

              <AnimatePresence>
                {openSections.activities && (
                  <motion.div
                    className="accordion-body"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <div className="active-item-preview">
                      <div className="active-item-top">
                        <button
                          type="button"
                          className="active-item-badge badge-clickable"
                          onClick={() => setOpenBadge((b) => (b === 'activities' ? null : 'activities'))}
                        >
                          {activeActivity.badge}
                        </button>
                        <span className="active-item-price">₹{activeActivity.cost.toLocaleString('en-IN')} / person</span>
                      </div>
                      <AnimatePresence>
                        {openBadge === 'activities' && (
                          <motion.p
                            className="voted-by-text"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            style={{ overflow: 'hidden' }}
                          >
                            {votedByNames ? `Voted by ${votedByNames}` : 'No individual votes recorded for this trip yet.'}
                          </motion.p>
                        )}
                      </AnimatePresence>
                      <h4 className="active-item-title">{activeActivity.title}</h4>
                      {activeActivity.items && (
                        <ul className="activity-list-items">
                          {activeActivity.items.map((it, idx) => (
                            <li key={idx}>✓ {it}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* WHAT WE RESOLVED */}
            <div className="accordion-card">
              <button type="button" className="accordion-header" onClick={() => toggleSection('resolved')}>
                <div className="accordion-title-group">
                  <span className="accordion-icon-chip"><Scale size={16} /></span>
                  <div>
                    <h3 className="accordion-heading">What we resolved</h3>
                    <span className="accordion-subtext">Conflict handling & synthesis summary</span>
                  </div>
                </div>
                {openSections.resolved ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>

              <AnimatePresence>
                {openSections.resolved && (
                  <motion.div
                    className="accordion-body"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <div className="resolved-summary-box">
                      <p className="resolved-summary-text">{recState.resolvedSummary}</p>

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
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* REAL-WORLD EVIDENCE & COMMUNITY PROOF */}
            <div className="accordion-card">
              <button type="button" className="accordion-header" onClick={() => toggleSection('evidence')}>
                <div className="accordion-title-group">
                  <span className="accordion-icon-chip"><MessageSquareQuote size={16} /></span>
                  <div>
                    <h3 className="accordion-heading">Real-world evidence & reviews</h3>
                    <span className="accordion-subtext">420+ verified traveler reviews</span>
                  </div>
                </div>
                {openSections.evidence ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>

              <AnimatePresence>
                {openSections.evidence && (
                  <motion.div
                    className="accordion-body"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
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
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

          {/* ── FOOTER APPROVAL ────────────────────────── */}
          <div className="synthesis-footer-action">
            <motion.button
              type="button"
              className="btn-secondary approve-itinerary-btn"
              onClick={onApprove}
              whileTap={{ scale: 0.98 }}
            >
              Approve itinerary
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SynthesisResult;
