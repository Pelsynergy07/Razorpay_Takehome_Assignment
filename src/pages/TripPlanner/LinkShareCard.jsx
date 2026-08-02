import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import GradientSweepButton from '../../components/AIChatbot/GradientSweepButton';

/**
 * Screen 2.1 — shareable link card with sonner toast notification,
 * copy button pulse animation, and AI-moment gradient sweep button.
 */
const LinkShareCard = ({ joinUrl, onEnterHub }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    toast('Link copied, drop it in the group chat 🔗', {
      duration: 3000,
      style: {
        background: '#ffffff',
        color: '#003b95',
        border: '1.5px solid #008cff',
        fontWeight: 600,
        borderRadius: '8px',
      },
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      className="link-share-card"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.68, ease: [0.16, 1, 0.3, 1] }}
    >
      <span className="link-share-label">Shareable link</span>
      <div className="link-share-row">
        <span className="link-share-url">{joinUrl}</span>
        <motion.button
          type="button"
          className="link-share-copy-btn"
          onClick={handleCopy}
          aria-label="Copy link"
          whileTap={{ scale: 0.85 }}
          animate={copied ? { scale: [1, 1.15, 1] } : { scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </motion.button>
      </div>
      <GradientSweepButton
        type="button"
        className="link-share-hub-btn"
        onClick={onEnterHub}
      >
        Enter live aggregation hub
        <ArrowRight size={16} />
      </GradientSweepButton>
    </motion.div>
  );
};

export default LinkShareCard;
