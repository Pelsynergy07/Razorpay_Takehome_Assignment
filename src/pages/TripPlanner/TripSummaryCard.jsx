import React from 'react';
import { motion } from 'framer-motion';
import { Download, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { toastStyle } from './toastStyle';

// Days reveal one at a time — like Myra is still writing the plan — rather
// than all popping in near-simultaneously. Each day's own fade-in is quick;
// what actually paces this out is a deliberate ~1s hold between days (the
// connecting line grows during that hold, arriving right as the next day
// starts) rather than a slow animation.
const DAY_START_DELAY = 0.3;
const DAY_STAGGER = 1.05;
const dayDelay = (idx) => DAY_START_DELAY + idx * DAY_STAGGER;

/**
 * Screen 5.1 — final screen, nothing after this. Day-by-day itinerary with
 * key details (dates, transport mode) per day, book actions where
 * applicable, and download/share for the finished plan.
 */
const TripSummaryCard = ({ recommendation }) => {
  const { destination, dates, estimatedCost, heroImage, weather, itinerary = [] } = recommendation;
  const [weatherTemp, weatherAqi] = (weather || '').split('|').map((s) => s.trim());
  const generatedOn = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  const handleBook = (label) => {
    toast(`${label} isn't wired up in this demo — this is where real booking would happen.`, {
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

  return (
    <motion.div
      className="itinerary-screen"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      {/* Print-only letterhead — invisible on screen, shown only when this
          card is printed/"Downloaded as PDF" so the output reads as a real
          travel document instead of a UI screenshot. */}
      <div className="itinerary-print-header">
        <span className="itinerary-print-header-brand">MakeMyTrip</span>
        <span className="itinerary-print-header-tag">Trip itinerary · Prepared by Myra</span>
      </div>

      <div className="itinerary-hero">
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
      </div>

      <div className="itinerary-timeline">
        {itinerary.map((d, idx) => (
          <motion.div
            key={d.day}
            className="itinerary-day"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: dayDelay(idx), ease: 'easeInOut' }}
          >
            <div className="itinerary-day-marker">
              <motion.span
                className="itinerary-day-dot"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.35, delay: dayDelay(idx), ease: 'easeInOut' }}
              />
              {idx < itinerary.length - 1 && (
                <motion.span
                  className="itinerary-day-line"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: DAY_STAGGER - 0.25, delay: dayDelay(idx) + 0.25, ease: 'easeInOut' }}
                />
              )}
            </div>

            <div className="itinerary-day-card">
              <h3 className="itinerary-day-title">Day {d.day}: {d.title} {d.emoji}</h3>
              <p className="itinerary-day-desc">{d.description}</p>

              {d.activities && d.activities.length > 0 && (
                <ul className="activity-list-items itinerary-day-activities">
                  {d.activities.map((item, i) => (
                    <li key={i}>✓ {item}</li>
                  ))}
                </ul>
              )}

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
            </div>
          </motion.div>
        ))}
      </div>

      <div className="itinerary-footer-actions">
        <button type="button" className="btn-secondary itinerary-footer-btn" onClick={handleDownloadPdf}>
          <Download size={16} /> Download PDF
        </button>
        <button type="button" className="btn-secondary itinerary-footer-btn" onClick={handleShare}>
          <Share2 size={16} /> Share
        </button>
      </div>

      {/* Print-only footer, mirrors the letterhead above. */}
      <div className="itinerary-print-footer">
        {destination} · {dates} · ₹{estimatedCost.toLocaleString('en-IN')} per person — generated {generatedOn}
      </div>
    </motion.div>
  );
};

export default TripSummaryCard;
