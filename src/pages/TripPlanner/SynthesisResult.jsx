import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { getAlternatives } from '../../lib/synthesizeRecommendation';

/**
 * Screens 4.2 (synthesis result) + 4.3 (edit/swap) — swapping an
 * alternative just updates local recommendation state, no re-run.
 */
const SynthesisResult = ({ recommendation, onUpdate, onApprove }) => {
  const [expanded, setExpanded] = useState(false);
  const [showAlternatives, setShowAlternatives] = useState(false);

  const { destination, dates, estimatedCost, whyItFits, attributions, evidenceSources, riskFlag, confidenceLevel } = recommendation;
  const showConfidenceNote = confidenceLevel === 'moderate' || confidenceLevel === 'low';

  const handleSwap = (alt) => {
    onUpdate({
      destination: alt.destination,
      dates: alt.dates,
      estimatedCost: alt.costPerPerson,
      evidenceSources: [{ text: alt.evidence, source: alt.hotel }],
    });
    setShowAlternatives(false);
  };

  return (
    <div className="synthesis-result">
      {showConfidenceNote && (
        <div className={`confidence-note confidence-note--${confidenceLevel}`}>
          {confidenceLevel === 'low' ? 'Low' : 'Moderate'} confidence recommendation — see details below before deciding.
        </div>
      )}

      <button type="button" className="synthesis-destination" onClick={() => setShowAlternatives((s) => !s)}>
        <span className="synthesis-destination-name">{destination}</span>
        <span className="synthesis-destination-meta">{dates} · ₹{estimatedCost.toLocaleString('en-IN')} / person</span>
        <span className="synthesis-edit-hint">Tap to see alternatives</span>
      </button>

      <AnimatePresence>
        {showAlternatives && (
          <motion.div
            className="synthesis-alternatives"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            {getAlternatives(recommendation).map((alt) => (
              <button key={alt.id} type="button" className="synthesis-alt-card" onClick={() => handleSwap(alt)}>
                <span className="synthesis-alt-name">{alt.destination} — {alt.hotel}</span>
                <span className="synthesis-alt-meta">₹{alt.costPerPerson.toLocaleString('en-IN')} / person</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <p className="bot-text-line synthesis-why">{whyItFits}</p>

      <button type="button" className="btn-tertiary synthesis-details-toggle" onClick={() => setExpanded((e) => !e)}>
        {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        {expanded ? 'Hide details' : 'Show attribution & evidence'}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            className="synthesis-details"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            {attributions.length > 0 && (
              <div className="attribution-pill-row">
                {attributions.map((a, i) => (
                  <span key={i} className="attribution-pill">
                    <strong>{a.sourceParticipant}:</strong> {a.text}
                  </span>
                ))}
              </div>
            )}
            <div className="evidence-list">
              {evidenceSources.map((e, i) => (
                <p key={i} className="evidence-item">{e.text} <span>— {e.source}</span></p>
              ))}
            </div>
            {riskFlag && (
              <div className="risk-flag">
                <AlertTriangle size={15} />
                {riskFlag}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button type="button" className="btn-secondary synthesis-approve-btn" onClick={onApprove} whileTap={{ scale: 0.98 }}>
        Approve
      </motion.button>
    </div>
  );
};

export default SynthesisResult;
