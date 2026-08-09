import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Check, ArrowRight, Sparkles, X } from 'lucide-react';
import ParticipantProgressStepper from './ParticipantProgressStepper';
import { participantCards } from './participantCards';
import { useParticipantFlow } from './useParticipantFlow';
import LocationCarousel from './LocationCarousel';
import MyraAvatar from '../../components/AIChatbot/MyraAvatar';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import './ParticipantFlow.css';

/**
 * The actual question-by-question flow (arrival → cards → note → thanks),
 * split out of ParticipantEntry as the single source of truth both the
 * organizer's own copy and every friend's copy render — same /join page
 * either way, no embedding, no separate UI.
 *
 * `isSelf` is true only when this session's own organizer opened their own
 * copy via the "Fill in your preferences" button (?self=1 on the URL) — the
 * only thing that changes is the name field on the arrival screen starts
 * prefilled instead of blank, since we already know who they are. A friend
 * opening the real shared link gets `isSelf` false and the form behaves
 * exactly as it always has.
 */
const ParticipantFormFlow = ({ sessionId, isSelf = false }) => {
  const flow = useParticipantFlow(sessionId, { initialName: isSelf ? 'Pranav' : '' });

  const currentCard = participantCards.find((c) => c.key === flow.step);

  // Slider raw value (0–100), mapped to a stop on commit
  const [sliderRaw, setSliderRaw] = useState(50);

  // "Who is Myra?" context modal, opened from the arrival badge
  const [showMyraModal, setShowMyraModal] = useState(false);
  const organizerLabel = flow.session?.organizer_name && flow.session.organizer_name !== 'Organizer'
    ? flow.session.organizer_name
    : 'your friend';

  useEffect(() => {
    if (flow.step === 'thanks') {
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#008cff', '#003b95', '#eb2226', '#ffb400', '#10b981'],
        disableForReducedMotion: true,
      });
    }
  }, [flow.step]);

  // Reset slider to default when the effort question appears
  useEffect(() => {
    if (currentCard?.type === 'rangeSlider') {
      setSliderRaw(currentCard.sliderDefault ?? 50);
    }
  }, [currentCard?.key]);

  const slideVariants = {
    initial: (dir) => ({ opacity: 0, x: dir === 'forward' ? 28 : -28 }),
    animate: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
    exit: (dir) => ({ opacity: 0, x: dir === 'forward' ? -28 : 28, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }),
  };

  /** Given a raw 0–100 value, find the closest stop */
  const resolveSliderStop = (raw, card) => {
    const stops = card.sliderStops;
    let closest = stops[0];
    let minDist = Infinity;
    stops.forEach((s) => {
      const d = Math.abs(raw - s.at);
      if (d < minDist) { minDist = d; closest = s; }
    });
    return closest;
  };

  const renderContent = () => {
    if (flow.step === 'not-found') {
      return (
        <div className="participant-view-wrapper" key="not-found">
          <div className="arrival-content">
            <h2 className="arrival-title">Link not found</h2>
            <p className="arrival-subtitle">This trip link may have expired or been mistyped. Check with your friend.</p>
          </div>
        </div>
      );
    }

    /* ── ARRIVAL ──────────────────────────────────────── */
    if (flow.step === 'arrival') {
      const canStart = flow.participantName.trim().length > 0;
      return (
        <motion.div
          key="arrival"
          className="participant-view-wrapper"
          custom={flow.direction}
          variants={slideVariants}
          initial="initial" animate="animate" exit="exit"
        >
          <div className="arrival-content">
            <button
              type="button"
              className="arrival-badge"
              onClick={() => setShowMyraModal(true)}
            >
              <Sparkles size={13} />
              Hey! I'm Myra from MakeMyTrip
            </button>

            <h1 className="arrival-title">
              The trip is finally being planned. Give us the vibe of what you're into.
            </h1>

            <div className="arrival-lottie-container">
              <DotLottieReact
                src="/dog.json"
                loop
                autoplay
              />
            </div>

            {/* Name input */}
            <div className="arrival-name-group">
              <input
                id="participant-name"
                type="text"
                className="arrival-name-input"
                placeholder="Your name"
                value={flow.participantName}
                onChange={(e) => flow.setParticipantName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && canStart && flow.startCards()}
                autoFocus
              />
              <button
                type="button"
                className="secondary-btn-brand"
                onClick={flow.startCards}
                disabled={!canStart}
                style={{ marginTop: '8px' }}
              >
                Let's go <ArrowRight size={16} />
              </button>
            </div>
          </div>

          <div className="arrival-actions">
            <div className="defer-prompt-wrapper">
              <span className="defer-prompt-text">these things beneath you? thats cool too.</span>
              <button type="button" className="ghost-btn-link-blue-caps" onClick={flow.deferAll}>
                JUST SURPRISE ME
              </button>
            </div>
          </div>
        </motion.div>
      );
    }

    /* ── QUESTION CARDS ───────────────────────────────── */
    if (currentCard) {
      const selectedValue = flow.answers[currentCard.field];

      return (
        <motion.div
          key={currentCard.key}
          className="participant-view-wrapper"
          custom={flow.direction}
          variants={slideVariants}
          initial="initial" animate="animate" exit="exit"
        >
          <div className="question-header">
            <h2 className="question-title">{currentCard.title}</h2>
            <p className="question-subtitle">{currentCard.subtitle}</p>
          </div>

          {/* Q1: Destination pick — 3D carousel */}
          {currentCard.type === 'carousel' && (
            <LocationCarousel
              options={currentCard.options}
              onSelect={(value) => flow.selectAndAdvance(currentCard.field, value)}
            />
          )}

          {/* Q2 & Q4: 2×2 Photo Cards — tap to advance */}
          {currentCard.type === 'cards' && (
            <div className="photo-cards-grid">
              {currentCard.options.map((opt) => {
                const isSelected = selectedValue === opt.value;
                return (
                  <div
                    key={opt.value}
                    className={`photo-card-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => flow.selectAndAdvance(currentCard.field, opt.value)}
                  >
                    <img src={opt.image} alt={opt.label} className="photo-card-bg" />
                    <div className="photo-card-gradient" />
                    <span className="photo-card-label">{opt.label}</span>
                    {isSelected && (
                      <div className="photo-card-check"><Check size={14} strokeWidth={3} /></div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Q3: Real drag range slider */}
          {currentCard.type === 'rangeSlider' && (() => {
            const stop = resolveSliderStop(sliderRaw, currentCard);
            return (
              <div className="range-slider-block">
                {/* Landscape image header */}
                <div className="range-slider-image-rail">
                  {currentCard.sliderStops.map((s, i) => (
                    <div
                      key={s.value}
                      className={`range-stop-image-cell ${stop.value === s.value ? 'active' : ''}`}
                    >
                      <img
                        src={
                          [
                            'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=400&q=80',
                            'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=400&q=80',
                            'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80',
                          ][i]
                        }
                        alt={s.label}
                        className="range-stop-image"
                      />
                      <div className="range-stop-image-overlay" />
                    </div>
                  ))}
                </div>

                {/* Active label */}
                <div className="range-active-label">
                  <span className="range-label-name">{stop.label}</span>
                  <span className="range-label-detail">{stop.detail}</span>
                </div>

                {/* The slider itself */}
                <div className="range-slider-track-wrap">
                  <span className="range-edge-label">Stay close</span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={sliderRaw}
                    className="range-input"
                    style={{ '--progress': `${sliderRaw}%` }}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setSliderRaw(v);
                      const s = resolveSliderStop(v, currentCard);
                      flow.selectOnly(currentCard.field, s.value);
                    }}
                  />
                  <span className="range-edge-label">Go far</span>
                </div>

                {/* Stop dots */}
                <div className="range-stop-dots">
                  {currentCard.sliderStops.map((s) => (
                    <span
                      key={s.value}
                      className={`range-stop-dot ${stop.value === s.value ? 'active' : ''}`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  className="secondary-btn-brand range-confirm-btn"
                  onClick={flow.goNext}
                >
                  Looks right <ArrowRight size={16} />
                </button>
              </div>
            );
          })()}
        </motion.div>
      );
    }

    /* ── OPEN NOTE ────────────────────────────────────── */
    if (flow.step === 'note') {
      return (
        <motion.div
          key="note"
          className="participant-view-wrapper"
          custom={flow.direction}
          variants={slideVariants}
          initial="initial" animate="animate" exit="exit"
        >
          <div className="open-note-container">
            <div className="question-header open-note-header-spacing">
              <h2 className="question-title">Anything else you wanna add before we lock this in?</h2>
            </div>
            <textarea
              className="open-note-textarea"
              placeholder="e.g. I refuse to wake up before 11 AM, or must include a legendary street food spot..."
              value={flow.answers.openNote || ''}
              onChange={(e) => flow.selectOnly('openNote', e.target.value)}
            />
          </div>

          <div className="arrival-actions">
            <button
              type="button"
              className="secondary-btn-brand"
              onClick={() => flow.finish(flow.answers.openNote || '')}
            >
              Send it <ArrowRight size={16} />
            </button>
            <button type="button" className="ghost-btn-link" onClick={() => flow.finish('')}>
              Skip
            </button>
          </div>
        </motion.div>
      );
    }

    /* ── THANKS ───────────────────────────────────────── */
    if (flow.step === 'thanks') {
      return (
        <motion.div
          key="thanks"
          className="participant-view-wrapper"
          custom="forward"
          variants={slideVariants}
          initial="initial" animate="animate"
        >
          <div className="thanks-container">
            <img
              src="/thank-you-sir.gif"
              alt="Thank you good sir"
              className="thanks-meme-image"
            />
            <h2 className="thanks-heading">Thank you, good sir!</h2>
            <p className="thanks-desc">
              {isSelf
                ? "The trip is finally happening! Sit back, the details are being sorted out."
                : "The trip is finally happening! Now go nag Pranav to finalise things fast."}
            </p>
          </div>
        </motion.div>
      );
    }

    return null;
  };

  return (
    <>
      {flow.questionIndex && (
        <ParticipantProgressStepper
          questionIndex={flow.questionIndex}
          totalQuestions={flow.totalQuestions}
          onStepClick={(targetIndex) => {
            if (targetIndex < flow.questionIndex - 1) flow.goToStep(targetIndex + 1);
          }}
        />
      )}
      <AnimatePresence mode="wait" custom={flow.direction}>
        {renderContent()}
      </AnimatePresence>

      <AnimatePresence>
        {showMyraModal && (
          <React.Fragment key="myra-modal">
            <motion.div
              className="myra-modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setShowMyraModal(false)}
            />
            <motion.div
              className="myra-modal-sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              role="dialog"
              aria-modal="true"
              aria-label="About Myra"
            >
              <button
                type="button"
                className="myra-modal-close"
                onClick={() => setShowMyraModal(false)}
                aria-label="Close"
              >
                <X size={16} />
              </button>

              <div className="myra-modal-avatar">
                <MyraAvatar size={56} />
              </div>

              <h2 className="myra-modal-title">Hi, I'm Myra 👋</h2>

              <p className="myra-modal-body">
                I'm MakeMyTrip's AI travel buddy. {organizerLabel} brought me in to help plan this trip,
                and my job is to get a quick feel for what <strong>you're</strong> into — vibe, pace,
                must-haves, the works.
              </p>
              <p className="myra-modal-body">
                Once everyone's answered a few fun, fast questions, I'll blend it all together and put
                together a plan that actually fits the whole group — not just one person's guess.
              </p>
              <p className="myra-modal-body myra-modal-body-muted">
                Takes under a minute. Promise. 💙
              </p>

              <button
                type="button"
                className="secondary-btn-brand"
                onClick={() => setShowMyraModal(false)}
              >
                Got it, let's go
              </button>
            </motion.div>
          </React.Fragment>
        )}
      </AnimatePresence>
    </>
  );
};

export default ParticipantFormFlow;
