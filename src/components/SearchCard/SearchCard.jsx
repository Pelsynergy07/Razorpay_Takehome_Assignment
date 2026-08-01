import React, { useState } from 'react';
import { ArrowLeftRight, ChevronDown, Users, Search, Ticket, Check, Shield } from 'lucide-react';
import CitySelectorModal from './CitySelectorModal';
import SpriteIcon from '../SpriteIcon';
import { CATEGORY_ICONS } from '../../styles/spriteIcons.js';
import { colors } from '../../styles/tokens.js';
import './SearchCard.css';

const categories = [
  { id: 'flights', label: 'Flights', icon: 'flights' },
  { id: 'hotels', label: 'Hotels', icon: 'hotels' },
  { id: 'homestays', label: 'Villas &\nHomestays', icon: 'homestays' },
  { id: 'holidays', label: 'Holiday\nPackages', icon: 'holidays' },
  { id: 'trains', label: 'Trains', icon: 'trains' },
  { id: 'buses', label: 'Buses', icon: 'buses' },
  { id: 'cabs', label: 'Cabs', icon: 'cabs' },
  { id: 'tours', label: 'Tours &\nAttractions', icon: 'tours' },
  { id: 'visa', label: 'Visa', icon: 'visa' },
  { id: 'cruise', label: 'Cruise', icon: 'cruise', isNew: true },
  { id: 'forex', label: 'Forex Card\n& Currency', icon: 'forex' },
  { id: 'insurance', label: 'Travel\nInsurance', icon: 'insurance' },
];

const specialFares = [
  { id: 'regular', label: 'Regular', sublabel: 'Regular fares' },
  { id: 'student', label: 'Student', sublabel: 'Extra discounts/baggage' },
  { id: 'armed', label: 'Armed Forces', sublabel: 'Up to ₹ 600 off' },
  { id: 'gst', label: 'Have a GST number ?', sublabel: 'Upto 10% Extra Savings !', isNew: true },
  { id: 'senior', label: 'Senior Citizen', sublabel: 'Up to ₹ 600 off' },
  { id: 'doctor', label: 'Doctor and Nurses', sublabel: 'Up to ₹ 600 off' },
];

const popularCities = [
  { code: 'DEL', name: 'Delhi', airport: 'DEL, Delhi Airport India', full: 'Indira Gandhi International Airport' },
  { code: 'BLR', name: 'Bengaluru', airport: 'BLR, Bengaluru International A...', full: 'Kempegowda International Airport' },
  { code: 'BOM', name: 'Mumbai', airport: 'BOM, Chhatrapati Shivaji Intl', full: 'Chhatrapati Shivaji Maharaj International Airport' },
  { code: 'MAA', name: 'Chennai', airport: 'MAA, Chennai International', full: 'Chennai International Airport' },
  { code: 'CCU', name: 'Kolkata', airport: 'CCU, Netaji Subhas Chandra', full: 'Netaji Subhash Chandra Bose International Airport' },
  { code: 'HYD', name: 'Hyderabad', airport: 'HYD, Rajiv Gandhi International', full: 'Rajiv Gandhi International Airport' },
  { code: 'GOI', name: 'Goa', airport: 'GOI, Dabolim Airport', full: 'Goa International Airport' },
  { code: 'DXB', name: 'Dubai', airport: 'DXB, Dubai International', full: 'Dubai International Airport' },
];

const SearchCard = ({ onSearch }) => {
  const [activeCategory, setActiveCategory] = useState('flights');
  const [tripType, setTripType] = useState('oneWay');
  const [fromCity, setFromCity] = useState(popularCities[0]);
  const [toCity, setToCity] = useState(popularCities[1]);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [activeFare, setActiveFare] = useState('regular');
  const [isSwapping, setIsSwapping] = useState(false);
  const [travellers, setTravellers] = useState({ adults: 1, children: 0, infants: 0 });
  const [cabinClass, setCabinClass] = useState('Economy/Premium...');
  const [showTravellerModal, setShowTravellerModal] = useState(false);
  const [priceDrop, setPriceDrop] = useState(false);

  const handleSwap = (e) => {
    e.stopPropagation();
    setIsSwapping(true);
    setTimeout(() => {
      const temp = fromCity;
      setFromCity(toCity);
      setToCity(temp);
      setIsSwapping(false);
    }, 300);
  };

  const handleSearch = () => {
    if (onSearch) {
      onSearch({
        from: fromCity,
        to: toCity,
        date: new Date(2026, 7, 2),
        travellers,
        cabinClass,
        tripType,
      });
    }
  };

  return (
    <div className="search-card-outer">
      {/* 1. Floating Top Category Tabs Card */}
      <div className="floating-category-tabs-card">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              className={`cat-tab-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.isNew && <span className="cat-new-tag">new</span>}
              <SpriteIcon icon={CATEGORY_ICONS[cat.icon]} />
              <span className="cat-tab-label">{cat.label}</span>
              {isActive && <div className="cat-active-bar" />}
            </button>
          );
        })}
      </div>

      {/* 2. Main Search Card Body */}
      <div className="main-search-card">
        {activeCategory === 'flights' && (
          <>
            {/* Top Trip Type Row */}
            <div className="trip-type-header">
              <div className="trip-radios">
                <button
                  className={`trip-pill ${tripType === 'oneWay' ? 'active' : ''}`}
                  onClick={() => setTripType('oneWay')}
                >
                  <span className="radio-check">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  One Way
                </button>
                <button
                  className={`trip-pill ${tripType === 'roundTrip' ? 'active' : ''}`}
                  onClick={() => setTripType('roundTrip')}
                >
                  <span className="radio-circle-outline" />
                  Round Trip
                </button>
                <button
                  className={`trip-pill ${tripType === 'multiCity' ? 'active' : ''}`}
                  onClick={() => setTripType('multiCity')}
                >
                  <span className="radio-circle-outline" />
                  Multi City
                </button>
              </div>
              <span className="intl-flights-text">Book International and Domestic Flights</span>
            </div>

            {/* Inputs Grid Container */}
            <div className="search-grid-container">
              {/* FROM CELL with Nested Swap Button */}
              <div className="grid-cell from-cell" onClick={() => setShowFromPicker(true)}>
                <span className="cell-label">From</span>
                <span className="cell-title">{fromCity.name}</span>
                <span className="cell-sub">{fromCity.airport}</span>

                {/* Swap Icon positioned exactly on border line */}
                <button
                  className={`grid-swap-btn ${isSwapping ? 'spinning' : ''}`}
                  onClick={handleSwap}
                  aria-label="Swap cities"
                >
                  <ArrowLeftRight size={14} color={colors.blue} />
                </button>
              </div>

              {/* TO CELL */}
              <div className="grid-cell to-cell" onClick={() => setShowToPicker(true)}>
                <span className="cell-label">To</span>
                <span className="cell-title">{toCity.name}</span>
                <span className="cell-sub">{toCity.airport}</span>
              </div>

              {/* DEPARTURE */}
              <div className="grid-cell date-cell">
                <div className="cell-label-row">
                  <span className="cell-label">Departure</span>
                  <ChevronDown size={14} color={colors.blue} />
                </div>
                <div className="date-value-row">
                  <span className="date-number">2</span>
                  <div className="date-month-col">
                    <span className="date-month-year">Aug'26</span>
                    <span className="date-day-name">Sunday</span>
                  </div>
                </div>
              </div>

              {/* RETURN */}
              <div className="grid-cell date-cell return-cell">
                <div className="cell-label-row">
                  <span className="cell-label">Return</span>
                  <ChevronDown size={14} color={colors.blue} />
                </div>
                <span className="return-placeholder-text">
                  Tap to add a return date for bigger discounts
                </span>
              </div>

              {/* TRAVELLERS & CABIN CLASS */}
              <div className="grid-cell traveller-cabin-cell" onClick={() => setShowTravellerModal(!showTravellerModal)}>
                <div className="traveller-subcol">
                  <div className="cell-label-row">
                    <span className="cell-label">Travellers</span>
                    <ChevronDown size={14} color={colors.blue} />
                  </div>
                  <div className="trav-icons-row">
                    <Users size={16} color={colors.textSecondary} />
                    <span className="trav-num">1</span>
                    <span className="trav-icon-mini">👶</span>
                    <span className="trav-num">0</span>
                    <span className="trav-icon-mini">🍼</span>
                    <span className="trav-num">0</span>
                  </div>
                </div>

                <div className="cell-vertical-divider" />

                <div className="cabin-subcol">
                  <div className="cell-label-row">
                    <span className="cell-label">Cabin Class</span>
                    <ChevronDown size={14} color={colors.blue} />
                  </div>
                  <span className="cabin-class-title">{cabinClass}</span>
                </div>
              </div>
            </div>

            {/* Traveller Modal Popover */}
            {showTravellerModal && (
              <div className="traveller-modal">
                <div className="traveller-row">
                  <div>
                    <span className="trav-label">Adults</span>
                    <span className="trav-age">(12+ yrs)</span>
                  </div>
                  <div className="trav-counter">
                    <button onClick={() => setTravellers(t => ({...t, adults: Math.max(1, t.adults - 1)}))} className="trav-minus">−</button>
                    <span>{travellers.adults}</span>
                    <button onClick={() => setTravellers(t => ({...t, adults: Math.min(9, t.adults + 1)}))} className="trav-plus">+</button>
                  </div>
                </div>
                <div className="traveller-row">
                  <div>
                    <span className="trav-label">Children</span>
                    <span className="trav-age">(2-12 yrs)</span>
                  </div>
                  <div className="trav-counter">
                    <button onClick={() => setTravellers(t => ({...t, children: Math.max(0, t.children - 1)}))} className="trav-minus">−</button>
                    <span>{travellers.children}</span>
                    <button onClick={() => setTravellers(t => ({...t, children: Math.min(6, t.children + 1)}))} className="trav-plus">+</button>
                  </div>
                </div>
                <div className="cabin-class-selector">
                  <span className="cabin-title">Cabin Class</span>
                  <div className="cabin-options">
                    {['Economy/Premium...', 'Premium Economy', 'Business', 'First Class'].map(c => (
                      <button key={c} className={`cabin-opt ${cabinClass === c ? 'active' : ''}`} onClick={() => setCabinClass(c)}>{c}</button>
                    ))}
                  </div>
                </div>
                <button className="trav-apply-btn" onClick={() => setShowTravellerModal(false)}>APPLY</button>
              </div>
            )}

            {/* Special Fares & Quick Tools Section */}
            <div className="special-fares-row">
              <div className="special-fares-left">
                <span className="section-heading">Select a special fare</span>
                <div className="fare-chips-grid">
                  {specialFares.map((fare) => (
                    <button
                      key={fare.id}
                      className={`fare-chip-card ${activeFare === fare.id ? 'active' : ''}`}
                      onClick={() => setActiveFare(fare.id)}
                    >
                      <span className="fare-chip-title">
                        {fare.label}
                        {fare.isNew && <span className="gst-new-badge">new</span>}
                      </span>
                      <span className="fare-chip-sub">{fare.sublabel}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Tools Box */}
              <div className="quick-tools-right">
                <span className="section-heading">Quick Tools</span>
                <button className="quick-tool-card">
                  <Ticket size={20} color={colors.blue} />
                  <span className="quick-tool-name">Flight Tracker</span>
                </button>
              </div>
            </div>

            {/* Price Drop Protection Banner */}
            <div className="price-drop-banner">
              <label className="price-drop-label">
                <input type="checkbox" checked={priceDrop} onChange={(e) => setPriceDrop(e.target.checked)} />
                <span className="custom-check-box" />
                <span className="price-drop-desc">
                  <strong>Add Price Drop Protection</strong> If the price drops, we'll refund the difference. <a href="#">View Details</a>
                </span>
              </label>
              <div className="shield-icon-badge">
                <Shield size={30} color={colors.blue} fill={colors.blue} />
                <span className="shield-currency">₹</span>
              </div>
            </div>

            {/* Centered SEARCH Button Overlapping Bottom */}
            <div className="search-btn-container">
              <button className="search-cta-pill-btn" onClick={handleSearch}>
                SEARCH
              </button>
            </div>
          </>
        )}
      </div>

      {/* City Pickers */}
      {showFromPicker && (
        <CitySelectorModal
          title="From"
          cities={popularCities}
          selectedCity={fromCity}
          onSelect={(city) => { setFromCity(city); setShowFromPicker(false); }}
          onClose={() => setShowFromPicker(false)}
        />
      )}
      {showToPicker && (
        <CitySelectorModal
          title="To"
          cities={popularCities}
          selectedCity={toCity}
          onSelect={(city) => { setToCity(city); setShowToPicker(false); }}
          onClose={() => setShowToPicker(false)}
        />
      )}
    </div>
  );
};

export default SearchCard;
