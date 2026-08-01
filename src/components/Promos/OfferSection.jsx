import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Tag, Plane, Hotel, Palmtree } from 'lucide-react';
import './OfferSection.css';

const offerCategories = [
  { id: 'all', label: 'All Offers', icon: Tag },
  { id: 'flights', label: 'Flights', icon: Plane },
  { id: 'hotels', label: 'Hotels', icon: Hotel },
  { id: 'holidays', label: 'Holidays', icon: Palmtree },
];

const offers = [
  {
    id: 1,
    category: 'flights',
    title: 'Flat 15% OFF on Domestic Flights',
    subtitle: 'Use code FLYMMT. Min booking ₹3,000. Max discount ₹2,000.',
    code: 'FLYMMT',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    validTill: 'Valid till 31 Aug 2026',
  },
  {
    id: 2,
    category: 'hotels',
    title: 'Up to 40% OFF on Hotel Bookings',
    subtitle: 'Grab the best deals on 5-star hotels across India.',
    code: 'STAYMMT',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    validTill: 'Valid till 15 Sep 2026',
  },
  {
    id: 3,
    category: 'flights',
    title: 'International Flights from ₹12,999',
    subtitle: 'Book now for Bangkok, Dubai, Singapore & more.',
    code: 'INTFLY',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    validTill: 'Valid till 20 Aug 2026',
  },
  {
    id: 4,
    category: 'holidays',
    title: 'Goa Packages Starting ₹8,499',
    subtitle: '3N/4D packages with flights & hotels included.',
    code: 'GOAMMT',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    validTill: 'Valid till 30 Sep 2026',
  },
  {
    id: 5,
    category: 'hotels',
    title: 'ICICI Bank: Extra 12% OFF',
    subtitle: 'On hotels booked with ICICI credit cards. Min ₹5,000.',
    code: 'ICICIHTL',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    validTill: 'Valid till 31 Aug 2026',
  },
  {
    id: 6,
    category: 'flights',
    title: 'SBI Cards: Flat ₹1,500 OFF',
    subtitle: 'On domestic flights. Min booking ₹6,000.',
    code: 'SBIMMT',
    gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    validTill: 'Valid till 25 Aug 2026',
  },
];

const OfferSection = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const scrollRef = useRef(null);

  const filtered = activeCategory === 'all'
    ? offers
    : offers.filter(o => o.category === activeCategory);

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 320, behavior: 'smooth' });
    }
  };

  return (
    <section className="offer-section">
      <div className="container">
        <div className="offer-header">
          <h2 className="offer-title">Offers</h2>
          <div className="offer-category-tabs">
            {offerCategories.map(cat => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  className={`offer-cat-btn ${activeCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  <Icon size={14} />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="offer-carousel-wrapper">
          <button className="offer-scroll-btn left" onClick={() => scroll(-1)}>
            <ChevronLeft size={20} />
          </button>
          <div className="offer-carousel" ref={scrollRef}>
            {filtered.map(offer => (
              <div key={offer.id} className="offer-card" style={{ background: offer.gradient }}>
                <div className="offer-card-content">
                  <h3 className="offer-card-title">{offer.title}</h3>
                  <p className="offer-card-subtitle">{offer.subtitle}</p>
                  <div className="offer-card-bottom">
                    <div className="offer-code-badge">
                      <span className="offer-code-label">Use code:</span>
                      <span className="offer-code-value">{offer.code}</span>
                    </div>
                    <span className="offer-valid">{offer.validTill}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="offer-scroll-btn right" onClick={() => scroll(1)}>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default OfferSection;
