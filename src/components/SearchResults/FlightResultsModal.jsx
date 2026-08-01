import React, { useState } from 'react';
import { X, Plane, Clock, ArrowRight, Filter, ChevronDown, ArrowUpDown } from 'lucide-react';
import './FlightResultsModal.css';

const mockFlights = [
  { id: 1, airline: 'IndiGo', code: '6E 2154', logo: '🔵', depart: '06:25', arrive: '09:10', from: 'DEL', to: 'BLR', duration: '2h 45m', stops: 'Non Stop', price: 4562, originalPrice: 5200 },
  { id: 2, airline: 'Air India', code: 'AI 812', logo: '🟠', depart: '08:00', arrive: '10:55', from: 'DEL', to: 'BLR', duration: '2h 55m', stops: 'Non Stop', price: 5120, originalPrice: 5800 },
  { id: 3, airline: 'Vistara', code: 'UK 823', logo: '🟣', depart: '11:30', arrive: '14:20', from: 'DEL', to: 'BLR', duration: '2h 50m', stops: 'Non Stop', price: 5890, originalPrice: 6500 },
  { id: 4, airline: 'Akasa Air', code: 'QP 1347', logo: '🟡', depart: '15:45', arrive: '18:50', from: 'DEL', to: 'BLR', duration: '3h 05m', stops: '1 Stop', price: 3899, originalPrice: 4500 },
  { id: 5, airline: 'SpiceJet', code: 'SG 723', logo: '🔴', depart: '19:15', arrive: '22:00', from: 'DEL', to: 'BLR', duration: '2h 45m', stops: 'Non Stop', price: 4200, originalPrice: 4800 },
  { id: 6, airline: 'IndiGo', code: '6E 6312', logo: '🔵', depart: '21:40', arrive: '00:30+1', from: 'DEL', to: 'BLR', duration: '2h 50m', stops: 'Non Stop', price: 3750, originalPrice: 4200 },
  { id: 7, airline: 'Air India', code: 'AI 505', logo: '🟠', depart: '05:10', arrive: '08:15', from: 'DEL', to: 'BLR', duration: '3h 05m', stops: '1 Stop via HYD', price: 3450, originalPrice: 4100 },
  { id: 8, airline: 'Vistara', code: 'UK 817', logo: '🟣', depart: '14:00', arrive: '16:45', from: 'DEL', to: 'BLR', duration: '2h 45m', stops: 'Non Stop', price: 6200, originalPrice: 7000 },
];

const FlightResultsModal = ({ searchData, onClose }) => {
  const [sortBy, setSortBy] = useState('price');
  const [showFilters, setShowFilters] = useState(false);

  const sortedFlights = [...mockFlights].sort((a, b) => {
    if (sortBy === 'price') return a.price - b.price;
    if (sortBy === 'duration') return a.duration.localeCompare(b.duration);
    if (sortBy === 'departure') return a.depart.localeCompare(b.depart);
    return 0;
  });

  const fromCity = searchData?.from?.name || 'Delhi';
  const toCity = searchData?.to?.name || 'Bengaluru';
  const dateStr = searchData?.date ? searchData.date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'Sat, 2 Aug 2026';

  return (
    <>
      <div className="overlay-backdrop" onClick={onClose} />
      <div className="flight-results-modal">
        {/* Header */}
        <div className="fr-header">
          <div className="fr-header-info">
            <div className="fr-route">
              <span className="fr-city">{fromCity}</span>
              <ArrowRight size={16} />
              <span className="fr-city">{toCity}</span>
            </div>
            <span className="fr-date">{dateStr} · {searchData?.travellers?.adults || 1} Traveller · {searchData?.cabinClass || 'Economy'}</span>
          </div>
          <button className="fr-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Sort Bar */}
        <div className="fr-sort-bar">
          <button className="fr-filter-btn" onClick={() => setShowFilters(!showFilters)}>
            <Filter size={14} />
            Filters
          </button>
          <div className="fr-sort-options">
            {[
              { id: 'price', label: 'Cheapest' },
              { id: 'duration', label: 'Fastest' },
              { id: 'departure', label: 'Earliest' },
            ].map(opt => (
              <button
                key={opt.id}
                className={`fr-sort-btn ${sortBy === opt.id ? 'active' : ''}`}
                onClick={() => setSortBy(opt.id)}
              >
                <ArrowUpDown size={12} />
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Summary */}
        <div className="fr-summary">
          <span className="fr-count">{sortedFlights.length} flights found</span>
          <span className="fr-cheapest">Starting from <strong>₹{Math.min(...sortedFlights.map(f => f.price)).toLocaleString()}</strong></span>
        </div>

        {/* Flight List */}
        <div className="fr-list">
          {sortedFlights.map((flight) => (
            <div key={flight.id} className="fr-flight-card">
              <div className="fr-flight-main">
                <div className="fr-airline-col">
                  <span className="fr-airline-logo">{flight.logo}</span>
                  <div className="fr-airline-info">
                    <span className="fr-airline-name">{flight.airline}</span>
                    <span className="fr-flight-code">{flight.code}</span>
                  </div>
                </div>

                <div className="fr-schedule-col">
                  <div className="fr-time-block">
                    <span className="fr-time">{flight.depart}</span>
                    <span className="fr-airport">{flight.from}</span>
                  </div>
                  <div className="fr-duration-col">
                    <span className="fr-dur-text">{flight.duration}</span>
                    <div className="fr-dur-line">
                      <span className="fr-dur-dot" />
                      <span className="fr-dur-track" />
                      {flight.stops !== 'Non Stop' && <span className="fr-dur-stop-dot" />}
                      <span className="fr-dur-track" />
                      <span className="fr-dur-dot" />
                    </div>
                    <span className={`fr-stops-text ${flight.stops === 'Non Stop' ? 'nonstop' : 'has-stop'}`}>{flight.stops}</span>
                  </div>
                  <div className="fr-time-block">
                    <span className="fr-time">{flight.arrive}</span>
                    <span className="fr-airport">{flight.to}</span>
                  </div>
                </div>

                <div className="fr-price-col">
                  <span className="fr-original-price">₹{flight.originalPrice.toLocaleString()}</span>
                  <span className="fr-current-price">₹{flight.price.toLocaleString()}</span>
                  <span className="fr-per-adult">per adult</span>
                </div>

                <button className="fr-book-btn">Book Now</button>
              </div>

              <div className="fr-flight-footer">
                <button className="fr-details-link">Flight Details <ChevronDown size={12} /></button>
                <span className="fr-savings">Save ₹{(flight.originalPrice - flight.price).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default FlightResultsModal;
