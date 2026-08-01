import React from 'react';
import Logo from './Logo';
import SpriteIcon from './SpriteIcon';
import { FOOTER_SOCIAL_ICONS } from '../styles/spriteIcons.js';
import './Footer.css';

const footerSections = [
  {
    title: 'Product Offering',
    links: ['Flights', 'International Flights', 'Charter Flights', 'Hotels', 'International Hotels', 'Homestays and Villas', 'Activities', 'Holiday Packages', 'Luxe Selections', 'Trains', 'Bus', 'Cabs', 'Travel Insurance', 'Gift Cards', 'Gift Box', 'Trip Money', 'Trip Ideas', 'Travel Blog', 'Explore'],
  },
  {
    title: 'MakeMyTrip',
    links: ['About Us', 'Investor Relations', 'Careers', 'MMT Foundation', 'CSR Policy', 'myPartner - Travel Agent Portal', 'Foreign Exchange', 'List your hotel', 'Partners', 'Advertise with Us'],
  },
  {
    title: 'About the Site',
    links: ['Customer Support', 'Payment Security', 'Privacy Policy', 'User Agreement', 'Terms of Service', 'Responsible Disclosure', 'More Offices', 'Make A Payment'],
  },
  {
    title: 'Top Hotels in India',
    links: ['Treebo Hotels', 'FabHotels', 'OYO Hotels', 'Hotels in Delhi', 'Hotels in Mumbai', 'Hotels in Goa', 'Hotels in Jaipur', 'Hotels in Manali', 'Hotels in Shimla', 'Hotels in Ooty'],
  },
];

const Footer = () => {
  return (
    <footer className="mmt-footer">
      <div className="container">
        {/* Footer Logo */}
        <div className="footer-top">
          <a href="/" className="footer-logo">
            <Logo size={28} />
          </a>
        </div>

        {/* Footer Grid */}
        <div className="footer-grid">
          {footerSections.map((section, index) => (
            <div key={index} className="footer-section">
              <h4 className="footer-section-title">{section.title}</h4>
              <ul className="footer-links">
                {section.links.map((link, i) => (
                  <li key={i}><a href="#">{link}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Social & Download */}
        <div className="footer-bottom">
          <div className="footer-social">
            <span className="footer-social-label">Follow us</span>
            <div className="social-icons">
              <a href="#" className="social-icon" aria-label="Facebook"><SpriteIcon icon={FOOTER_SOCIAL_ICONS.facebook} /></a>
              <a href="#" className="social-icon" aria-label="Twitter"><SpriteIcon icon={FOOTER_SOCIAL_ICONS.twitter} /></a>
              <a href="#" className="social-icon" aria-label="Instagram"><SpriteIcon icon={FOOTER_SOCIAL_ICONS.instagram} /></a>
              <a href="#" className="social-icon" aria-label="LinkedIn"><SpriteIcon icon={FOOTER_SOCIAL_ICONS.linkedin} /></a>
              <a href="#" className="social-icon" aria-label="YouTube">▶</a>
            </div>
          </div>
          <div className="footer-download">
            <span className="footer-download-label">Download our App</span>
            <div className="download-badges">
              <a href="#" className="download-badge">
                <span className="badge-icon">🍎</span>
                <div className="badge-text">
                  <span className="badge-small">Download on the</span>
                  <span className="badge-big">App Store</span>
                </div>
              </a>
              <a href="#" className="download-badge">
                <span className="badge-icon">▶️</span>
                <div className="badge-text">
                  <span className="badge-small">GET IT ON</span>
                  <span className="badge-big">Google Play</span>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="footer-copyright">
          <p>© 2026 MakeMyTrip Clone. Built for design study purposes only. Not affiliated with MakeMyTrip Pvt. Ltd.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
