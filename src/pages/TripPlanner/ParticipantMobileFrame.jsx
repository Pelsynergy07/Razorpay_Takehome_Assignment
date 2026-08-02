import React from 'react';
import { Lock, RefreshCw, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Mobile device mockup wrapper for desktop demo representation.
 * Renders an app browser frame on desktop, expands naturally on mobile.
 */
const ParticipantMobileFrame = ({ children, joinUrl = 'myra.makemytrip.com' }) => {
  const navigate = useNavigate();

  return (
    <div className="participant-demo-canvas">
      <div className="participant-phone-frame">
        {/* Phone Notch & Status Bar */}
        <div className="phone-notch-bar">
          <div className="phone-camera-notch" />
        </div>

        {/* Mobile Browser Address Bar */}
        <div className="phone-browser-bar">
          <div className="phone-browser-url-pill">
            <Lock size={12} className="url-lock-icon" />
            <span className="phone-url-text">{joinUrl}</span>
          </div>
          <button type="button" className="phone-browser-close" onClick={() => navigate('/')} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        {/* Screen Content Viewport */}
        <div className="phone-screen-content">{children}</div>

        {/* Bottom Indicator Bar */}
        <div className="phone-home-indicator" />
      </div>
    </div>
  );
};

export default ParticipantMobileFrame;
