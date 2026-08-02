import React from 'react';
import { motion } from 'framer-motion';
import { Download, Share2 } from 'lucide-react';
import { toast } from 'sonner';

const toastStyle = {
  background: '#ffffff',
  color: '#003b95',
  border: '1.5px solid #008cff',
  fontWeight: 600,
  borderRadius: '8px',
};

/**
 * Screen 5.1 — final screen, nothing after this. Day-by-day itinerary with
 * key details (dates, transport mode) per day, book actions where
 * applicable, and download/share for the finished plan.
 */
const TripSummaryCard = ({ recommendation }) => {
  const { destination, dates, estimatedCost, heroImage, weather, itinerary = [] } = recommendation;
  const [weatherTemp, weatherAqi] = (weather || '').split('|').map((s) => s.trim());

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
    <div className="itinerary-screen">
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
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="itinerary-day-marker">
              <span className="itinerary-day-dot" />
              {idx < itinerary.length - 1 && <span className="itinerary-day-line" />}
            </div>

            <div className="itinerary-day-card">
              <h3 className="itinerary-day-title">Day {d.day}: {d.title} {d.emoji}</h3>
              <p className="itinerary-day-desc">{d.description}</p>

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
    </div>
  );
};

export default TripSummaryCard;
