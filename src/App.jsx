import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SearchCard from './components/SearchCard/SearchCard';
import MobileHome from './components/Mobile/MobileHome';
import MobileBottomNav from './components/Mobile/MobileBottomNav';
import AIChatbotWidget from './components/AIChatbot/AIChatbotWidget';
import FlightResultsModal from './components/SearchResults/FlightResultsModal';
import OfferSection from './components/Promos/OfferSection';
import Footer from './components/Footer';
import './App.css';

import InterviewerOnboardingModal from './components/InterviewerOnboarding/InterviewerOnboardingModal';
import ChatbotGuideTooltip from './components/InterviewerOnboarding/ChatbotGuideTooltip';

function App() {
  const [showFlightResults, setShowFlightResults] = useState(false);
  const [searchData, setSearchData] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [showMyraChat, setShowMyraChat] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(true);
  const [showGuideTooltip, setShowGuideTooltip] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSearch = (data) => {
    setSearchData(data);
    setShowFlightResults(true);
  };

  const handleMyraClick = () => {
    setShowMyraChat(true);
    setShowGuideTooltip(false);
  };

  const handleMyraClose = () => {
    setShowMyraChat(false);
  };

  const handleStartDemo = () => {
    setShowOnboardingModal(false);
    setShowGuideTooltip(true);
  };

  return (
    <div className="app">
      {/* Header */}
      <Header onOpenInterviewerModal={() => setShowOnboardingModal(true)} />

      {/* Desktop Hero Section */}
      <div className="hero-section">
        <div className="hero-bg">
          <div className="hero-overlay" />
        </div>
        <div className="hero-content-padding" />
        <SearchCard onSearch={handleSearch} />
      </div>

      {/* Mobile Home */}
      <MobileHome />

      {/* Desktop Offers Section */}
      <OfferSection />

      {/* Desktop Explore More Section */}
      <section className="explore-section">
        <div className="container">
          <h2 className="explore-title">Why MakeMyTrip?</h2>
          <div className="explore-grid">
            <div className="explore-card">
              <div className="explore-icon">🏆</div>
              <h3>Best Prices</h3>
              <p>Get the best prices on flights, hotels, and holiday packages with exclusive deals and discounts.</p>
            </div>
            <div className="explore-card">
              <div className="explore-icon">🛡️</div>
              <h3>Safe & Secure</h3>
              <p>Your transactions are protected with industry-leading security measures and encryption.</p>
            </div>
            <div className="explore-card">
              <div className="explore-icon">💬</div>
              <h3>24/7 Support</h3>
              <p>Round-the-clock customer support to help you with bookings, changes, and queries.</p>
            </div>
            <div className="explore-card">
              <div className="explore-icon">🤖</div>
              <h3>AI-Powered</h3>
              <p>MyRA AI assistant helps you find the best deals, plan trips, and get personalized recommendations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Mobile Bottom Nav */}
      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onMyraClick={handleMyraClick}
      />

      {/* AI Chatbot */}
      <AIChatbotWidget
        isOpen={showMyraChat}
        onClose={handleMyraClose}
        isMobile={isMobile}
      />

      {/* Interviewer Onboarding Context Modal */}
      <InterviewerOnboardingModal
        isOpen={showOnboardingModal}
        onClose={() => setShowOnboardingModal(false)}
        onStartDemo={handleStartDemo}
      />

      {/* Guided Tooltip Beacon pointing to Chatbot */}
      <ChatbotGuideTooltip
        isVisible={showGuideTooltip && !showMyraChat}
        onOpenChat={handleMyraClick}
        onDismiss={() => setShowGuideTooltip(false)}
      />

      {/* Flight Results Modal */}
      {showFlightResults && (
        <FlightResultsModal
          searchData={searchData}
          onClose={() => setShowFlightResults(false)}
        />
      )}
    </div>
  );
}

export default App;
