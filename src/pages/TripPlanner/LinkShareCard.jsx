import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import GradientSweepButton from '../../components/AIChatbot/GradientSweepButton';
import { toastStyle } from './toastStyle';
import { blockVariants, BLOCK_STAGGER } from '../../components/AIChatbot/motionConfig';

/**
 * Screen 2.1 — shareable link card with sonner toast notification and
 * AI-moment gradient sweep button.
 */
const LinkShareCard = ({ joinUrl, onEnterHub, startDelay = 0 }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    toast('Link copied, drop it in the group chat 🔗', {
      duration: 3000,
      style: toastStyle,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="link-share-card">
      <motion.div variants={blockVariants} custom={startDelay} initial="hidden" animate="visible">
        <span className="link-share-label">Shareable link</span>
        <div className="link-share-row">
          <span className="link-share-url">{joinUrl}</span>
          <button
            type="button"
            className="link-share-copy-btn"
            onClick={handleCopy}
            aria-label="Copy link"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
      </motion.div>
      <GradientSweepButton
        type="button"
        className="link-share-hub-btn"
        onClick={onEnterHub}
        startDelay={startDelay + BLOCK_STAGGER}
      >
        Peek at the live responses
        <ArrowRight size={16} />
      </GradientSweepButton>
    </div>
  );
};

export default LinkShareCard;
