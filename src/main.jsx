import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import DesignSystem from './pages/DesignSystem.jsx';
import './index.css';

const isDesignSystemRoute = window.location.pathname.replace(/\/+$/, '') === '/design-system';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isDesignSystemRoute ? <DesignSystem /> : <App />}
  </React.StrictMode>
);
