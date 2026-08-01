import React, { useState } from 'react';
import { Menu, ChevronDown, X } from 'lucide-react';
import Logo from './Logo';
import SpriteIcon from './SpriteIcon';
import myBizIcon from '../assets/mybiz-icon.png';
import mmtMobileLogo from '../assets/mmt-logo.svg';
import { NAV_ICONS, FLAG_ICON } from '../styles/spriteIcons.js';
import { colors } from '../styles/tokens.js';
import './Header.css';

const Header = () => {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      {/* Desktop Transparent Header */}
      <header className="header-desktop-transparent">
        <div className="header-inner container">
          {/* Logo */}
          <a href="/" className="header-logo" aria-label="MakeMyTrip Home">
            <Logo size={32} />
          </a>

          {/* Nav Items */}
          <nav className="header-nav-transparent">
            {/* List Your Property */}
            <a href="#" className="header-nav-link">
              <div className="nav-icon-circle">
                <SpriteIcon icon={NAV_ICONS.listYourProperty} />
              </div>
              <div className="nav-text">
                <span className="nav-title">List Your Property</span>
                <span className="nav-sub">Grow your business!</span>
              </div>
            </a>

            <span className="nav-divider" aria-hidden="true" />

            {/* myBiz */}
            <a href="#" className="header-nav-link mybiz-link">
              <img src={myBizIcon} alt="myBiz" className="mybiz-icon" />
              <div className="nav-text">
                <span className="nav-title">Introducing myBiz</span>
                <span className="nav-sub">Business Travel Solution</span>
              </div>
            </a>

            <span className="nav-divider" aria-hidden="true" />

            {/* My Trips */}
            <a href="#" className="header-nav-link">
              <div className="nav-icon-circle">
                <SpriteIcon icon={NAV_ICONS.myTrips} />
              </div>
              <div className="nav-text">
                <span className="nav-title">My Trips</span>
                <span className="nav-sub">Manage your bookings</span>
              </div>
            </a>

            <span className="nav-divider" aria-hidden="true" />

            {/* Wishlist */}
            <a href="#" className="header-nav-link">
              <div className="nav-icon-circle">
                <SpriteIcon icon={NAV_ICONS.wishlist} />
              </div>
              <div className="nav-text">
                <span className="nav-title">Wishlist</span>
                <span className="nav-sub">Save favourites</span>
              </div>
            </a>
          </nav>

          {/* Right Actions */}
          <div className="header-right-actions">
            {/* Account Avatar */}
            <button className="mmt-avatar-btn" onClick={() => setShowLogin(true)} aria-label="Account">
              <span className="mmt-avatar-circle">PK</span>
              <ChevronDown size={12} className="login-chevron" />
            </button>

            {/* Country / Currency Pill */}
            <button className="mmt-lang-btn">
              <SpriteIcon icon={FLAG_ICON} className="flag-icon" />
              <span className="lang-text">
                <span className="lang-currency">INR</span>
                <span className="lang-pipe">|</span>
                <span className="lang-locale">English</span>
              </span>
              <ChevronDown size={12} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="header-mobile">
        <div className="header-mobile-inner">
          <button className="hamburger-btn" aria-label="Menu">
            <Menu size={24} color={colors.textSecondary} />
          </button>
          <a href="/" className="header-logo mobile-logo" aria-label="MakeMyTrip Home">
            <img src={mmtMobileLogo} alt="MakeMyTrip" className="mobile-logo-img" />
          </a>
          <div className="header-mobile-right">
            <a href="#" className="mycash-btn">
              <span className="mycash-label">
                <span className="mycash-badge">my</span>
                <span className="mycash-suffix">Cash</span>
              </span>
            </a>
            <button className="mobile-avatar-btn">
              <span className="avatar-circle">P</span>
              <span className="avatar-name">Pranav</span>
            </button>
          </div>
        </div>
      </header>

      {/* Login Modal */}
      {showLogin && (
        <>
          <div className="overlay-backdrop" onClick={() => setShowLogin(false)} />
          <div className="login-modal">
            <div className="login-modal-header">
              <div>
                <h3>Login or Create Account</h3>
                <p>Get access to exclusive deals and manage your trips</p>
              </div>
              <button className="login-close" onClick={() => setShowLogin(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="login-modal-body">
              <div className="login-input-group">
                <label>Email or Mobile Number</label>
                <input type="text" placeholder="Enter email or mobile number" />
              </div>
              <button className="login-continue-btn">Continue</button>
              <div className="login-divider">
                <span>or login/signup with</span>
              </div>
              <div className="social-login-btns">
                <button className="social-btn google-btn">
                  <span>G</span> Google
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Header;
