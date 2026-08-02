import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import GradientSweepButton from '../../components/AIChatbot/GradientSweepButton';

const budgetOptions = [
  { label: '₹5,000', value: 5000 },
  { label: '₹10,000', value: 10000 },
  { label: '₹15,000', value: 15000 },
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
    transition: { duration: 0.24, ease: [0.16, 1, 0.3, 1] },
  },
};

const formItemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
  },
};

// Each step slides in from whichever direction it's travelling — forward
// steps enter from the right, going back enters from the left — so this
// reads as one guided conversation moving forward, not a form with jumping
// sections.
const stepVariants = {
  enter: (direction) => ({ opacity: 0, x: direction > 0 ? 28 : -28 }),
  center: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.26, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.03 },
  },
  exit: (direction) => ({
    opacity: 0,
    x: direction > 0 ? -28 : 28,
    transition: { duration: 0.16, ease: [0.16, 1, 0.3, 1] },
  }),
};

// Brief skeleton before the card's real content mounts, so it reads as
// content loading in rather than popping in instantly.
const IntentFormSkeleton = () => (
  <div className="intent-form-skeleton" aria-hidden="true">
    <div className="skeleton-bar skeleton-bar--label" />
    <div className="skeleton-bar skeleton-bar--input" />
    <div className="skeleton-bar skeleton-bar--label" />
    <div className="skeleton-pills">
      <div className="skeleton-pill" />
      <div className="skeleton-pill" />
    </div>
    <div className="skeleton-bar skeleton-bar--button" />
  </div>
);

const SKELETON_DELAY_MS = 400;

/**
 * Screen 1.2 — asked as two short, sequential turns (who + where, then
 * when + budget) instead of one long form with every field visible at
 * once. Only the current turn is on screen; answering it is what reveals
 * the next one.
 */
const IntentFormCard = ({ onSubmit }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [step, setStep] = useState(1); // 1 | 2
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), SKELETON_DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  const [groupSize, setGroupSize] = useState('5');
  const [knowsDestination, setKnowsDestination] = useState(null); // null | true | false
  const [destination, setDestination] = useState('');
  const [knowsDates, setKnowsDates] = useState(null); // null | true | false
  const [numberOfDays, setNumberOfDays] = useState('4');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState(null);
  const [isCustomBudget, setIsCustomBudget] = useState(false);
  const [customBudget, setCustomBudget] = useState('');

  const hasDestinationAnswer = knowsDestination === true ? Boolean(destination.trim()) : knowsDestination === false;
  const hasDateAnswer = knowsDates === true ? Boolean(startDate && endDate) : Boolean(numberOfDays);

  const canContinue = Boolean(groupSize) && hasDestinationAnswer;
  const canSubmit = knowsDates !== null && hasDateAnswer && budget !== null;

  const goToStep2 = () => {
    if (!canContinue) return;
    setDirection(1);
    setStep(2);
  };

  const goBackToStep1 = () => {
    setDirection(-1);
    setStep(1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({
      groupSize: Number(groupSize),
      destination: knowsDestination ? destination.trim() : null,
      dateWindow: knowsDates
        ? formatDateRange(startDate, endDate)
        : `${numberOfDays} day${Number(numberOfDays) === 1 ? '' : 's'}`,
      budgetPerPerson: budget,
    });
  };

  return (
    <motion.div
      className="intent-form-card"
      variants={formContainerVariants}
      initial="hidden"
      animate="visible"
    >
      {isLoading ? (
        <IntentFormSkeleton />
      ) : (
        <>
          <div className="intent-step-header">
            {step === 2 && (
              <button type="button" className="intent-step-back" onClick={goBackToStep1} aria-label="Back">
                <ArrowLeft size={16} />
              </button>
            )}
            <div className="intent-step-progress">
              <span className={`intent-step-dot ${step >= 1 ? 'active' : ''}`} />
              <span className={`intent-step-dot ${step >= 2 ? 'active' : ''}`} />
            </div>
          </div>

          <AnimatePresence mode="wait" custom={direction} initial={false}>
            {step === 1 ? (
          <motion.div
            key="step1"
            className="intent-form-step"
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
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
              <label>Have you decided on the destination?</label>
              <div className="budget-pill-group">
                <motion.button
                  type="button"
                  className={`budget-pill ${knowsDestination === true ? 'active' : ''}`}
                  onClick={() => setKnowsDestination(true)}
                  whileTap={{ scale: 0.94 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  Yes
                </motion.button>
                <motion.button
                  type="button"
                  className={`budget-pill ${knowsDestination === false ? 'active' : ''}`}
                  onClick={() => { setKnowsDestination(false); setDestination(''); }}
                  whileTap={{ scale: 0.94 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  No
                </motion.button>
              </div>
            </motion.div>

            {knowsDestination === true && (
              <motion.div className="intent-form-field" variants={formItemVariants}>
                <label htmlFor="destination">Where to?</label>
                <input
                  id="destination"
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Goa, Manali, Bali..."
                  required
                />
              </motion.div>
            )}

            <motion.div variants={formItemVariants}>
              <GradientSweepButton
                type="button"
                className="intent-form-submit"
                disabled={!canContinue}
                onClick={goToStep2}
              >
                Continue
              </GradientSweepButton>
            </motion.div>
          </motion.div>
        ) : (
          <motion.form
            key="step2"
            className="intent-form-step"
            onSubmit={handleSubmit}
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
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
                    className={`budget-pill ${!isCustomBudget && budget === opt.value ? 'active' : ''}`}
                    onClick={() => { setIsCustomBudget(false); setBudget(opt.value); }}
                    whileTap={{ scale: 0.94 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  >
                    {opt.label}
                  </motion.button>
                ))}
                <motion.button
                  type="button"
                  className={`budget-pill ${isCustomBudget ? 'active' : ''}`}
                  onClick={() => { setIsCustomBudget(true); setBudget(customBudget ? Number(customBudget) : null); }}
                  whileTap={{ scale: 0.94 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  Add custom
                </motion.button>
              </div>
            </motion.div>

            {isCustomBudget && (
              <motion.div className="intent-form-field" variants={formItemVariants}>
                <label htmlFor="customBudget">Enter amount per head</label>
                <input
                  id="customBudget"
                  type="number"
                  min="1"
                  value={customBudget}
                  onChange={(e) => {
                    setCustomBudget(e.target.value);
                    setBudget(e.target.value ? Number(e.target.value) : null);
                  }}
                  placeholder="e.g. 25000"
                  required
                />
              </motion.div>
            )}

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
            )}
          </AnimatePresence>
        </>
      )}
    </motion.div>
  );
};

export default IntentFormCard;
