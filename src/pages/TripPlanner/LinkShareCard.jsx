import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, ArrowRight } from 'lucide-react';

/**
 * Screen 2.1 — shareable link card. "Enter Live Aggregation Hub" is a stub
 * until Phase 4 is built and approved.
 */
const LinkShareCard = ({ joinUrl, onEnterHub }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      className="link-share-card"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <span className="link-share-label">Shareable link</span>
      <div className="link-share-row">
        <span className="link-share-url">{joinUrl}</span>
        <motion.button
          type="button"
          className="link-share-copy-btn"
          onClick={handleCopy}
          aria-label="Copy link"
          whileTap={{ scale: 0.9 }}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </motion.button>
      </div>
      <motion.button
        type="button"
        className="btn-secondary link-share-hub-btn"
        onClick={onEnterHub}
        whileTap={{ scale: 0.98 }}
      >
        Enter live aggregation hub
        <ArrowRight size={16} />
      </motion.button>
    </motion.div>
  );
};

export default LinkShareCard;
