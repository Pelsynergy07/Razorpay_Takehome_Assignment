import React from 'react';
import { motion } from 'framer-motion';
import { Download, Share2, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { toastStyle } from './toastStyle';
import {
  EASE,
  BLOCK_STAGGER,
  blockVariants,
  wordVariants,
  wordContainerVariants,
} from '../../components/AIChatbot/motionConfig';

const DOT_DURATION = 0.35;
const LINE_GROW_DURATION = 0.6; // the connecting line's own top-to-bottom grow animation

const dotVariants = {
  hidden: { scale: 0 },
  visible: (delay = 0) => ({ scale: 1, transition: { duration: DOT_DURATION, ease: EASE, delay } }),
};

const lineVariants = {
  hidden: { scaleY: 0 },
  visible: (delay = 0) => ({ scaleY: 1, transition: { duration: LINE_GROW_DURATION, ease: EASE, delay } }),
};

/** One line of prose revealed word-by-word, bottom-to-top. */
const AnimatedWords = ({ text, delay = 0 }) => (
  <motion.span variants={wordContainerVariants(delay)} initial="hidden" animate="visible" style={{ display: 'inline' }}>
    {text.split(/\s+/).filter(Boolean).map((word, i) => (
      <motion.span key={i} variants={wordVariants} style={{ display: 'inline-block', marginRight: '0.25em' }}>
        {word}
      </motion.span>
    ))}
  </motion.span>
);

/**
 * Screen 5.1 — the "final" screen, though not necessarily the true end:
 * the organizer can still catch a mistake here and loop back to editing via
 * `onEdit`. Day-by-day itinerary with key details (dates, transport mode)
 * per day, book actions where applicable, and download/share/edit for the
 * finished plan.
 *
 * Entrance: hero, then each day in order — dot, title (word-by-word),
 * description (word-by-word), then activities/chips/image/actions
 * together, with the connecting line growing into the next day. Each of
 * these overlaps with a short stagger rather than waiting for the previous
 * one to completely finish. Footer actions come last.
 */
const TripSummaryCard = ({ recommendation, startDelay = 0, onEdit }) => {
  const { destination, dates, estimatedCost, heroImage, weather, itinerary = [] } = recommendation;
  const [weatherTemp, weatherAqi] = (weather || '').split('|').map((s) => s.trim());
  const generatedOn = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  const handleBook = (label) => {
    toast(`${label} isn't wired up in this demo. Clicking on this button will open the booking flow of MMT`, {
      duration: 3000,
      style: toastStyle,
    });
  };

  const handleShare = async () => {
    const lines = [
      `${destination} — ${dates}`,
      `₹${estimatedCost.toLocaleString('en-IN')} per person`,
      '',
      ...itinerary.map((d) => `Day ${d.day}: ${d.title}`),
    ];
    await navigator.clipboard.writeText(lines.join('\n'));
    toast('Itinerary copied — share it in the group chat.', { duration: 3000, style: toastStyle });
  };

  const handleDownloadPdf = () => window.print();

  // Compute each day's own timeline (dot -> title -> description -> trailing
  // meta), then chain the days themselves — each stage starts a short beat
  // after the one before it, overlapping instead of waiting for it to finish.
  const titleFor = (d) => `Day ${d.day}: ${d.title} ${d.emoji || ''}`.trim();

  let cursor = startDelay + BLOCK_STAGGER; // hero takes the first slot
  const dayTimings = itinerary.map((d) => {
    const dayStart = cursor;
    const dotDelay = dayStart;
    const titleDelay = dotDelay + BLOCK_STAGGER;
    const descDelay = titleDelay + BLOCK_STAGGER;
    const trailingDelay = descDelay + BLOCK_STAGGER;
    const lineDelay = trailingDelay + BLOCK_STAGGER;
    // The next day's dot waits for the connecting line to fully finish
    // growing top-to-bottom before it appears, instead of overlapping with
    // it — otherwise the line reads as barely visible/instant.
    cursor = lineDelay + LINE_GROW_DURATION;
    return { dotDelay, titleDelay, descDelay, trailingDelay, lineDelay };
  });
  const footerDelay = cursor;

  return (
    <div className="itinerary-screen">
      {/* Print-only letterhead — invisible on screen, shown only when this
          card is printed/"Downloaded as PDF" so the output reads as a real
          travel document instead of a UI screenshot. */}
      <div className="itinerary-print-header">
        <span className="itinerary-print-header-brand">MakeMyTrip</span>
        <span className="itinerary-print-header-tag">Trip itinerary · Prepared by Myra</span>
      </div>

      <motion.div className="itinerary-hero" variants={blockVariants} custom={startDelay} initial="hidden" animate="visible">
        <img src={heroImage} alt={destination} className="itinerary-hero-img" />
        <div className="itinerary-hero-overlay" />
        <div className="itinerary-hero-content">
          <h1 className="itinerary-hero-title">Your itinerary for {destination}</h1>
          <div className="itinerary-hero-meta">
            {weatherTemp && <span className="hero-meta-pill">{weatherTemp}</span>}
            {weatherAqi && <span className="hero-weather-badge">{weatherAqi}</span>}
          </div>
          <div className="itinerary-hero-destname">{destination}</div>
        </div>
      </motion.div>

      <div className="itinerary-timeline">
        {itinerary.map((d, idx) => {
          const t = dayTimings[idx];
          return (
            <div key={d.day} className="itinerary-day">
              <div className="itinerary-day-marker">
                <motion.span className="itinerary-day-dot" variants={dotVariants} custom={t.dotDelay} initial="hidden" animate="visible" />
                {idx < itinerary.length - 1 && (
                  <motion.span className="itinerary-day-line" variants={lineVariants} custom={t.lineDelay} initial="hidden" animate="visible" />
                )}
              </div>

              <div className="itinerary-day-card">
                <h3 className="itinerary-day-title">
                  <AnimatedWords text={titleFor(d)} delay={t.titleDelay} />
                </h3>
                {d.description && (
                  <p className="itinerary-day-desc">
                    <AnimatedWords text={d.description} delay={t.descDelay} />
                  </p>
                )}

                <motion.div variants={blockVariants} custom={t.trailingDelay} initial="hidden" animate="visible">
                  {d.activities && d.activities.length > 0 && (
                    <ul className="activity-list-items itinerary-day-activities">
                      {d.activities.map((item, i) => (
                        <li key={i}>✓ {item}</li>
                      ))}
                    </ul>
                  )}

                  {d.timingNote && <p className="itinerary-day-timing-note">{d.timingNote}</p>}

                  <div className="itinerary-day-details">
                    <span className="itinerary-day-detail-chip">{d.dateLabel}</span>
                    {d.transportMode && <span className="itinerary-day-detail-chip">{d.transportMode}</span>}
                  </div>

                  {d.image && (
                    <div className="itinerary-day-image-wrap">
                      <img src={d.image} alt={d.title} className="itinerary-day-image" />
                      {d.rating && <span className="itinerary-day-rating">{d.rating}</span>}
                    </div>
                  )}

                  {d.bookable && d.bookable.length > 0 && (
                    <div className="itinerary-day-actions">
                      {d.bookable.includes('transport') && (
                        <button type="button" className="btn-secondary itinerary-book-btn" onClick={() => handleBook('Booking transport')}>
                          Book transport
                        </button>
                      )}
                      {d.bookable.includes('stay') && (
                        <button type="button" className="btn-secondary itinerary-book-btn" onClick={() => handleBook('Booking stay')}>
                          Book stay
                        </button>
                      )}
                      {d.bookable.includes('activity') && (
                        <button type="button" className="btn-secondary itinerary-book-btn" onClick={() => handleBook('Booking activity')}>
                          Book activity
                        </button>
                      )}
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          );
        })}
      </div>

      <motion.div className="itinerary-footer-actions" variants={blockVariants} custom={footerDelay} initial="hidden" animate="visible">
        <button type="button" className="btn-secondary itinerary-footer-btn" onClick={handleDownloadPdf}>
          <Download size={16} /> Download PDF
        </button>
        <button type="button" className="btn-secondary itinerary-footer-btn" onClick={handleShare}>
          <Share2 size={16} /> Share
        </button>
        {onEdit && (
          <button type="button" className="btn-secondary itinerary-footer-btn" onClick={onEdit}>
            <Pencil size={16} /> Edit
          </button>
        )}
      </motion.div>

      {/* Print-only footer, mirrors the letterhead above. */}
      <div className="itinerary-print-footer">
        {destination} · {dates} · ₹{estimatedCost.toLocaleString('en-IN')} per person — generated {generatedOn}
      </div>
    </div>
  );
};

export default TripSummaryCard;
