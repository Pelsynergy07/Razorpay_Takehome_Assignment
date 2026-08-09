import React, { useState, useRef, useEffect } from 'react';
import { Search, X, MapPin, TrendingUp } from 'lucide-react';
import './CitySelectorModal.css';

const CitySelectorModal = ({ title, cities, selectedCity, onSelect, onClose }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const filtered = cities.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.code.toLowerCase().includes(query.toLowerCase()) ||
    c.airport.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <div className="overlay-backdrop" onClick={onClose} />
      <div className="city-modal">
        <div className="city-modal-header">
          <span className="city-modal-title">{title}</span>
          <button className="city-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="city-search-box">
          <Search size={18} className="city-search-icon" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search by city or airport"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="city-search-input"
          />
          {query && (
            <button className="city-search-clear" onClick={() => setQuery('')}>
              <X size={16} />
            </button>
          )}
        </div>

        {!query && (
          <div className="city-section-label">
            <TrendingUp size={14} />
            <span>Popular Cities</span>
          </div>
        )}

        <div className="city-list">
          {filtered.map((city) => (
            <button
              key={city.code}
              className={`city-option ${selectedCity?.code === city.code ? 'selected' : ''}`}
              onClick={() => onSelect(city)}
            >
              <div className="city-option-icon">
                <MapPin size={16} />
              </div>
              <div className="city-option-info">
                <div className="city-option-top">
                  <span className="city-option-name">{city.name}</span>
                  <span className="city-option-code">{city.code}</span>
                </div>
                <span className="city-option-airport">{city.full}</span>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="city-no-results">
              <Search size={32} strokeWidth={1} />
              <p>No airports found for "{query}"</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CitySelectorModal;
