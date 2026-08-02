import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Copy } from 'lucide-react';

/**
 * Screen 5.1 — final screen, nothing after this. Clean minimal summary
 * card with a copy-to-clipboard share action.
 */
const TripSummaryCard = ({ recommendation }) => {
  const [copied, setCopied] = useState(false);
  const { destination, dates, estimatedCost, whyItFits } = recommendation;
  const oneLineReason = whyItFits.split(/(?<=[.!])\s/)[0];

  const handleCopy = async () => {
    const summary = `${destination}\n${dates} · ₹${estimatedCost.toLocaleString('en-IN')} per person\n${oneLineReason}`;
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="trip-summary-screen">
      <motion.div
        className="trip-summary-card"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="trip-summary-check">
          <Check size={22} />
        </span>
        <h2 className="trip-summary-destination">{destination}</h2>
        <p className="trip-summary-meta">{dates} · ₹{estimatedCost.toLocaleString('en-IN')} per person</p>
        <p className="trip-summary-reason">{oneLineReason}</p>
      </motion.div>

      <motion.button type="button" className="btn-secondary trip-summary-share-btn" onClick={handleCopy} whileTap={{ scale: 0.98 }}>
        {copied ? <Check size={16} /> : <Copy size={16} />}
        {copied ? 'Copied!' : 'Copy / share'}
      </motion.button>
    </div>
  );
};

export default TripSummaryCard;
