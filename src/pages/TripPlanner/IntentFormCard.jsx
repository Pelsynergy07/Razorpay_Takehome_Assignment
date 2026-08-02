import React, { useState } from 'react';
import { motion } from 'framer-motion';
import GradientSweepButton from '../../components/AIChatbot/GradientSweepButton';

const budgetOptions = [
  { label: '₹5,000', value: 5000 },
  { label: '₹10,000', value: 10000 },
  { label: '₹15,000', value: 15000 },
  { label: '₹15,000+', value: 20000 },
];

const formContainerVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.08,
      delayChildren: 0.12,
    },
  },
};

const formItemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

/**
 * Screen 1.2 — base intent form with staggered, subtle input field entry.
 */
const IntentFormCard = ({ onSubmit }) => {
  const [groupSize, setGroupSize] = useState('5');
  const [numberOfDays, setNumberOfDays] = useState('4');
  const [budget, setBudget] = useState(null);

  const canSubmit = groupSize && numberOfDays && budget !== null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({
      groupSize: Number(groupSize),
      dateWindow: `${numberOfDays} day${Number(numberOfDays) === 1 ? '' : 's'}`,
      budgetPerPerson: budget,
    });
  };

  return (
    <motion.form
      className="intent-form-card"
      onSubmit={handleSubmit}
      variants={formContainerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="intent-form-row">
        <motion.div className="intent-form-field" variants={formItemVariants}>
          <label htmlFor="groupSize">How many of you?</label>
          <input
            id="groupSize"
            type="number"
            min="2"
            max="30"
            value={groupSize}
            onChange={(e) => setGroupSize(e.target.value)}
            required
          />
        </motion.div>
        <motion.div className="intent-form-field" variants={formItemVariants}>
          <label htmlFor="numberOfDays">When are you thinking?</label>
          <input
            id="numberOfDays"
            type="number"
            min="1"
            max="30"
            value={numberOfDays}
            onChange={(e) => setNumberOfDays(e.target.value)}
            placeholder="No. of days"
            required
          />
        </motion.div>
      </div>

      <motion.div className="intent-form-field" variants={formItemVariants}>
        <label>What's the budget looking like per head?</label>
        <div className="budget-pill-group">
          {budgetOptions.map((opt) => (
            <motion.button
              key={opt.value}
              type="button"
              className={`budget-pill ${budget === opt.value ? 'active' : ''}`}
              onClick={() => setBudget(opt.value)}
              whileTap={{ scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              {opt.label}
            </motion.button>
          ))}
        </div>
      </motion.div>

      <motion.div variants={formItemVariants}>
        <GradientSweepButton
          type="submit"
          className="intent-form-submit"
          disabled={!canSubmit}
        >
          Create trip session
        </GradientSweepButton>
      </motion.div>
    </motion.form>
  );
};

export default IntentFormCard;
