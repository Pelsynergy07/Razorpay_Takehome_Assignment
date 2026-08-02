import React from 'react';
import SpriteIcon from '../SpriteIcon';
import MyraAvatar from '../AIChatbot/MyraAvatar';
import { BOTTOM_NAV_ICONS } from '../../styles/spriteIcons.js';
import './MobileBottomNav.css';

const MobileBottomNav = ({ activeTab, onTabChange, onMyraClick }) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'trips', label: 'My Trips', icon: 'myTrips' },
    { id: 'myra', isCenter: true },
    { id: 'offers', label: 'Offers', icon: 'offers' },
    { id: 'where2go', label: 'Where2Go', icon: 'where2go' },
  ];

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        if (tab.isCenter) {
          return (
            <button
              key={tab.id}
              className="bottom-tab center-tab"
              onClick={() => onMyraClick?.()}
              aria-label="Open Myra AI Assistant"
            >
              <div className="myra-bubble">
                <div className="myra-mascot-wrap">
                  <div className="myra-mascot">
                    <MyraAvatar size={68} />
                  </div>
                </div>
              </div>
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            className={`bottom-tab ${isActive ? 'active' : ''}`}
            onClick={() => onTabChange?.(tab.id)}
          >
            {isActive && <div className="active-indicator" />}
            <SpriteIcon icon={BOTTOM_NAV_ICONS[tab.icon]} />
            <span className="bottom-tab-label">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default MobileBottomNav;
