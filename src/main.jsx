import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import App from './App.jsx';
import DesignSystem from './pages/DesignSystem.jsx';
import OrganizerEntry from './pages/TripPlanner/OrganizerEntry.jsx';
import ParticipantEntry from './pages/TripPlanner/ParticipantEntry.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Toaster position="top-center" expand={false} />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/design-system" element={<DesignSystem />} />
        <Route path="/plan" element={<OrganizerEntry />} />
        <Route path="/join/:sessionId" element={<ParticipantEntry />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
