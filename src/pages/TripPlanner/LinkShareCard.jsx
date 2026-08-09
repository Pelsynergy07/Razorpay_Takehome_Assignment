import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import GradientSweepButton from '../../components/AIChatbot/GradientSweepButton';
import { toastStyle } from './toastStyle';
import { blockVariants, BLOCK_STAGGER } from '../../components/AIChatbot/motionConfig';

/**
 * Screen 2.1 — shareable link card with sonner toast notification and
 * AI-moment gradient sweep button. Also opens the organizer's own copy of
 * the participant form (same /join page, ?self=1 marker so it prefills
 * their name) in a new tab — their submission comes back to this chat via
 * tripApi's cross-tab response subscription, no embedding needed.
 */
const LinkShareCard = ({ joinUrl, startDelay = 0 }) => {
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

  const handleFillOwnPreferences = () => {
    if (!joinUrl) return;
    const selfUrl = `${joinUrl}${joinUrl.includes('?') ? '&' : '?'}self=1`;
    window.open(selfUrl, '_blank', 'noopener,noreferrer');
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

      <motion.div
        className="link-share-self-prompt"
        variants={blockVariants}
        custom={startDelay + BLOCK_STAGGER}
        initial="hidden"
        animate="visible"
      >
        <span className="link-share-self-text">You're part of this trip too!</span>
        <GradientSweepButton
          type="button"
          className="link-share-hub-btn"
          onClick={handleFillOwnPreferences}
          startDelay={startDelay + BLOCK_STAGGER}
        >
          Fill in your preferences
          <ArrowRight size={16} />
        </GradientSweepButton>
      </motion.div>
    </div>
  );
};

export default LinkShareCard;
