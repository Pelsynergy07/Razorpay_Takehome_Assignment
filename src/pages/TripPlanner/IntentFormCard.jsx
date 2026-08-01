import React, { useState } from 'react';
import { motion } from 'framer-motion';

const budgetOptions = [
  { label: '₹5,000', value: 5000 },
  { label: '₹10,000', value: 10000 },
  { label: '₹15,000', value: 15000 },
  { label: '₹15,000+', value: 20000 },
];

/**
 * Screen 1.2 — base intent form. Rendered inline as a bot turn, not a
 * separate page: group size + trip length share a row, budget is a
 * single-select pill group (not a raw number input).
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
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="intent-form-row">
        <div className="intent-form-field">
          <label htmlFor="groupSize">Group size</label>
          <input
            id="groupSize"
            type="number"
            min="2"
            max="30"
            value={groupSize}
            onChange={(e) => setGroupSize(e.target.value)}
            required
          />
        </div>
        <div className="intent-form-field">
          <label htmlFor="numberOfDays">Number of days</label>
          <input
            id="numberOfDays"
            type="number"
            min="1"
            max="30"
            value={numberOfDays}
            onChange={(e) => setNumberOfDays(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="intent-form-field">
        <label>Budget per person</label>
        <div className="budget-pill-group">
          {budgetOptions.map((opt) => (
            <motion.button
              key={opt.value}
              type="button"
              className={`budget-pill ${budget === opt.value ? 'active' : ''}`}
              onClick={() => setBudget(opt.value)}
              whileTap={{ scale: 0.94 }}
            >
              {opt.label}
            </motion.button>
          ))}
        </div>
      </div>

      <motion.button
        type="submit"
        className="btn-secondary intent-form-submit"
        disabled={!canSubmit}
        whileTap={canSubmit ? { scale: 0.98 } : undefined}
      >
        Create trip session
      </motion.button>
    </motion.form>
  );
};

export default IntentFormCard;
