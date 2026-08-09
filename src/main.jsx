import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import App from './App.jsx';
import DesignSystem from './pages/DesignSystem.jsx';
import OrganizerEntry from './pages/TripPlanner/OrganizerEntry.jsx';
import ParticipantEntry from './pages/TripPlanner/ParticipantEntry.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { clearAllConversations } from './lib/chatHistory.js';
import './index.css';

// Saved chat history is what lets "pick up where you left off" restore a
// past conversation's trip session — but that restore path depends on
// tripApi data (Supabase and/or localStorage) staying in sync with it,
// which doesn't always hold up on the hosted deployment and can land on a
// broken screen. Wiping it on every fresh page load means there's never a
// past conversation to restore into: the widget always starts clean, so
// that whole class of bug can't surface during a demo. Trip-planner
// sessions reached via a still-open chat in the same tab are unaffected —
// this only clears what a page reload would otherwise offer to resume.
clearAllConversations();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <Toaster position="top-center" expand={false} />
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/design-system" element={<DesignSystem />} />
          <Route path="/plan" element={<OrganizerEntry />} />
          <Route path="/join/:sessionId" element={<ParticipantEntry />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
