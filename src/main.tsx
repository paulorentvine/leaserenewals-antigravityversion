import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/trellis-tokens.css';
import './index.css';

/**
 * Application Entry Point.
 */
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
