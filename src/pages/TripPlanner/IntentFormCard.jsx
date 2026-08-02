import React, { useState } from 'react';
import { motion } from 'framer-motion';
import GradientSweepButton from '../../components/AIChatbot/GradientSweepButton';

const budgetOptions = [
  { label: '₹5,000', value: 5000 },
  { label: '₹10,000', value: 10000 },
  { label: '₹15,000', value: 15000 },
  { label: '₹15,000+', value: 20000 },
];

const formatDateRange = (startIso, endIso) => {
  const opts = { month: 'short', day: 'numeric' };
  const start = new Date(`${startIso}T00:00:00`).toLocaleDateString('en-US', opts);
  const end = new Date(`${endIso}T00:00:00`).toLocaleDateString('en-US', opts);
  return `${start} - ${end}`;
};

const formContainerVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.24,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.03,
      delayChildren: 0.05,
    },
  },
};

const formItemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

/**
 * Screen 1.2 — base intent form with staggered, subtle input field entry.
 */
const IntentFormCard = ({ onSubmit }) => {
  const [groupSize, setGroupSize] = useState('5');
  const [knowsDates, setKnowsDates] = useState(null); // null | true | false
  const [numberOfDays, setNumberOfDays] = useState('4');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState(null);

  const hasDateAnswer = knowsDates === true ? Boolean(startDate && endDate) : Boolean(numberOfDays);
  const canSubmit = groupSize && knowsDates !== null && hasDateAnswer && budget !== null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({
      groupSize: Number(groupSize),
      dateWindow: knowsDates
        ? formatDateRange(startDate, endDate)
        : `${numberOfDays} day${Number(numberOfDays) === 1 ? '' : 's'}`,
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
        <label>Do you already know the dates of travel?</label>
        <div className="budget-pill-group">
          <motion.button
            type="button"
            className={`budget-pill ${knowsDates === true ? 'active' : ''}`}
            onClick={() => setKnowsDates(true)}
            whileTap={{ scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            Yes
          </motion.button>
          <motion.button
            type="button"
            className={`budget-pill ${knowsDates === false ? 'active' : ''}`}
            onClick={() => setKnowsDates(false)}
            whileTap={{ scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            No
          </motion.button>
        </div>
      </motion.div>

      {knowsDates === true ? (
        <div className="intent-form-row">
          <motion.div className="intent-form-field" variants={formItemVariants}>
            <label htmlFor="startDate">Start date</label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </motion.div>
          <motion.div className="intent-form-field" variants={formItemVariants}>
            <label htmlFor="endDate">End date</label>
            <input
              id="endDate"
              type="date"
              min={startDate || undefined}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </motion.div>
        </div>
      ) : knowsDates === false ? (
        <motion.div className="intent-form-field" variants={formItemVariants}>
          <label htmlFor="numberOfDays">How many days?</label>
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
      ) : null}

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
