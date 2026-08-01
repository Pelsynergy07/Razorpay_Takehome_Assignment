import React, { useState } from 'react';
import { Mountain, Waves, Heart, Camera } from 'lucide-react';
import SpriteIcon from '../SpriteIcon';
import { MOBILE_PRIMARY_ICONS, MOBILE_SECONDARY_ICONS } from '../../styles/spriteIcons.js';
import './MobileHome.css';

const primaryCategories = [
  { id: 'flights', label: 'Flights', icon: 'flights' },
  { id: 'hotels', label: 'Hotels', icon: 'hotels' },
  { id: 'trains', label: 'Trains', icon: 'trains' },
  { id: 'holidays', label: 'Holiday Packages', icon: 'holidays' },
];

const secondaryCategories = [
  { id: 'airport-cabs', label: 'Airport Cabs', icon: 'airport-cabs' },
  { id: 'homestays', label: 'Villas & Homestays', icon: 'homestays' },
  { id: 'bus', label: 'Bus', icon: 'bus' },
  { id: 'outstation', label: 'Outstation Cabs', icon: 'outstation' },
  { id: 'tours', label: 'Tours & Attractions', icon: 'tours' },
  { id: 'forex', label: 'Forex Card & Currency', icon: 'forex' },
  { id: 'visa', label: 'Visa', icon: 'visa' },
  { id: 'insurance', label: 'Travel Insurance', icon: 'insurance' },
  { id: 'pnr', label: 'Train PNR Status', icon: 'pnr' },
  { id: 'gifts', label: 'Gift Cards', icon: 'gifts' },
];

// Mirrors the reference PWA's "Curated Offers" tab set
const offerTabs = ['Trending', 'Flights', 'Hotels', 'Villas & Apts', 'Cabs', 'Holidays', 'Bus', 'Activities', 'Forex'];

const offerCards = [
  { id: 1, title: 'Flat 15% OFF', sub: 'Domestic Flights', gradient: 'linear-gradient(160deg, var(--mmt-navy) 0%, var(--mmt-navy-light) 100%)' },
  { id: 2, title: 'Weekend Getaways', sub: 'From ₹4,999', gradient: 'var(--gradient-btn-primary)' },
  { id: 3, title: 'MakeMyTrip Assured', sub: 'Verified stays', gradient: 'linear-gradient(160deg, #003b95 0%, #008cff 100%)' },
  { id: 4, title: 'Last Minute Deals', sub: 'Book & fly today', gradient: 'linear-gradient(160deg, var(--mmt-red-dark) 0%, var(--mmt-red) 100%)' },
];

const tripIdeas = [
  { id: 1, title: 'Themed Recommendations', sub: 'Escape to the mountains', icon: Mountain },
  { id: 2, title: 'Explore Destinations', sub: 'Relax on the beach', icon: Waves },
  { id: 3, title: 'Explore by interest', sub: 'Honeymoon Hotspots', icon: Heart },
];

const MobileHome = () => {
  const [activeOfferTab, setActiveOfferTab] = useState('Trending');

  return (
    <div className="mobile-home">
      {/* Primary Category Cards */}
      <div className="primary-categories">
        {primaryCategories.map((cat) => (
          <button key={cat.id} className="primary-card">
            <div className="primary-icon-wrapper">
              <SpriteIcon icon={MOBILE_PRIMARY_ICONS[cat.icon]} />
            </div>
            <span className="primary-label">{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Secondary Category Grid */}
      <div className="secondary-grid-panel">
        <div className="secondary-grid">
          {secondaryCategories.map((cat) => (
            <button key={cat.id} className="secondary-item">
              <div className="secondary-icon-wrapper">
                <SpriteIcon icon={MOBILE_SECONDARY_ICONS[cat.icon]} />
              </div>
              <span className="secondary-label">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Curated Offers */}
      <section className="mobile-section">
        <div className="mobile-section-heading">
          <h2>Curated Offers</h2>
          <a href="#" className="view-all-link">View All</a>
        </div>
        <div className="offer-tabs-scroll">
          {offerTabs.map((tab) => (
            <button
              key={tab}
              className={`offer-tab-chip ${activeOfferTab === tab ? 'active' : ''}`}
              onClick={() => setActiveOfferTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="offer-cards-scroll">
          {offerCards.map((offer) => (
            <div key={offer.id} className="offer-card" style={{ background: offer.gradient }}>
              <span className="offer-card-title">{offer.title}</span>
              <span className="offer-card-sub">{offer.sub}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Where2Go */}
      <section className="mobile-section">
        <div className="mobile-section-heading">
          <h2>Where2Go</h2>
          <a href="#" className="view-all-link">View All</a>
        </div>
        <div className="trip-ideas-scroll">
          {tripIdeas.map((idea) => {
            const Icon = idea.icon;
            return (
              <div key={idea.id} className="trip-idea-card">
                <div className="trip-idea-stack-back-2" />
                <div className="trip-idea-stack-back-1" />
                <div className="trip-idea-main">
                  <div className="trip-idea-icon-wrap">
                    <Icon size={32} strokeWidth={1.5} className="icon-blue" />
                  </div>
                  <p className="trip-idea-sub">{idea.sub}</p>
                  <span className="trip-idea-title">{idea.title}</span>
                </div>
              </div>
            );
          })}
          <div className="trip-idea-share-card">
            <Camera size={22} strokeWidth={1.5} />
            <p>Share your travel stories</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MobileHome;
