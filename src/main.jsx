import React from 'react';
import { createRoot } from 'react-dom/client';
// HashRouter: works on any static host (GitHub Pages included) without
// server-side rewrites for deep links.
import { HashRouter } from 'react-router-dom';
import App from './App.jsx';
import { applyTheme, getSavedTheme } from './styles/theme.js';
import './styles/global.css';

applyTheme(getSavedTheme());

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);
