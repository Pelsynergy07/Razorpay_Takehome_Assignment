import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import GradientSweepButton from '../../components/AIChatbot/GradientSweepButton';
import { blockVariants, BLOCK_STAGGER } from '../../components/AIChatbot/motionConfig';

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

// Fixed delay slots for each step's always-present fields — the field
// below always waits for the one above to finish. Fields that only appear
// after a user answers (e.g. the "Where to?" input) pop in on their own at
// delay 0 instead — the click that revealed them is already the cue, no
// need to make them wait too.
const STEP_FIELD_DELAY = (index) => index * BLOCK_STAGGER;

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

const SKELETON_DELAY_MS = 1500;

/**
 * Screen 1.2 — asked as two short, sequential turns (who + where, then
 * when + budget) instead of one long form with every field visible at
 * once. Only the current turn is on screen; answering it is what reveals
 * the next one.
 */
const IntentFormCard = ({ onSubmit, startDelay = 0 }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [step, setStep] = useState(1); // 1 | 2

  // The skeleton (and everything after it) waits for whatever bot text is
  // above this card to finish revealing, on top of its own minimum show time.
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), SKELETON_DELAY_MS + startDelay * 1000);
    return () => clearTimeout(t);
  }, [startDelay]);

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
    setStep(2);
  };

  const goBackToStep1 = () => setStep(1);

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
    <div className="intent-form-card">
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
              <span className={`intent-step-segment ${step >= 1 ? 'active' : ''}`} />
              <span className={`intent-step-segment ${step >= 2 ? 'active' : ''}`} />
            </div>
          </div>

          {step === 1 ? (
            <div className="intent-form-step">
              <motion.div className="intent-form-field" variants={blockVariants} custom={STEP_FIELD_DELAY(0)} initial="hidden" animate="visible">
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

              <motion.div className="intent-form-field" variants={blockVariants} custom={STEP_FIELD_DELAY(1)} initial="hidden" animate="visible">
                <label>Have you decided on the destination?</label>
                <div className="budget-pill-group">
                  <button
                    type="button"
                    className={`budget-pill ${knowsDestination === true ? 'active' : ''}`}
                    onClick={() => setKnowsDestination(true)}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    className={`budget-pill ${knowsDestination === false ? 'active' : ''}`}
                    onClick={() => { setKnowsDestination(false); setDestination(''); }}
                  >
                    No
                  </button>
                </div>
              </motion.div>

              {knowsDestination === true && (
                <motion.div className="intent-form-field" variants={blockVariants} custom={0} initial="hidden" animate="visible">
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

              <motion.div variants={blockVariants} custom={STEP_FIELD_DELAY(2)} initial="hidden" animate="visible">
                <GradientSweepButton
                  type="button"
                  className="intent-form-submit"
                  disabled={!canContinue}
                  onClick={goToStep2}
                >
                  Continue
                </GradientSweepButton>
              </motion.div>
            </div>
          ) : (
            <form className="intent-form-step" onSubmit={handleSubmit}>
              <motion.div className="intent-form-field" variants={blockVariants} custom={STEP_FIELD_DELAY(0)} initial="hidden" animate="visible">
                <label>Do you already know the dates of travel?</label>
                <div className="budget-pill-group">
                  <button
                    type="button"
                    className={`budget-pill ${knowsDates === true ? 'active' : ''}`}
                    onClick={() => setKnowsDates(true)}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    className={`budget-pill ${knowsDates === false ? 'active' : ''}`}
                    onClick={() => setKnowsDates(false)}
                  >
                    No
                  </button>
                </div>
              </motion.div>

              {knowsDates === true ? (
                <motion.div className="intent-form-row" variants={blockVariants} custom={0} initial="hidden" animate="visible">
                  <div className="intent-form-field">
                    <label htmlFor="startDate">Start date</label>
                    <input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="intent-form-field">
                    <label htmlFor="endDate">End date</label>
                    <input
                      id="endDate"
                      type="date"
                      min={startDate || undefined}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                    />
                  </div>
                </motion.div>
              ) : knowsDates === false ? (
                <motion.div className="intent-form-field" variants={blockVariants} custom={0} initial="hidden" animate="visible">
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

              <motion.div className="intent-form-field" variants={blockVariants} custom={STEP_FIELD_DELAY(1)} initial="hidden" animate="visible">
                <label>What's the budget looking like per head?</label>
                <div className="budget-pill-group">
                  {budgetOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`budget-pill ${!isCustomBudget && budget === opt.value ? 'active' : ''}`}
                      onClick={() => { setIsCustomBudget(false); setBudget(opt.value); }}
                    >
                      {opt.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    className={`budget-pill ${isCustomBudget ? 'active' : ''}`}
                    onClick={() => { setIsCustomBudget(true); setBudget(customBudget ? Number(customBudget) : null); }}
                  >
                    Add custom
                  </button>
                </div>
              </motion.div>

              {isCustomBudget && (
                <motion.div className="intent-form-field" variants={blockVariants} custom={0} initial="hidden" animate="visible">
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

              <motion.div variants={blockVariants} custom={STEP_FIELD_DELAY(2)} initial="hidden" animate="visible">
                <GradientSweepButton
                  type="submit"
                  className="intent-form-submit"
                  disabled={!canSubmit}
                >
                  Create trip session
                </GradientSweepButton>
              </motion.div>
            </form>
          )}
        </>
      )}
    </div>
  );
};

export default IntentFormCard;
