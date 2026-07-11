import { useState } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage.jsx';
import PlanPage from './pages/PlanPage.jsx';
import GroceriesPage from './pages/GroceriesPage.jsx';
import LibraryPage from './pages/LibraryPage.jsx';
import FridgePage from './pages/FridgePage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
import { applyTheme, getSavedTheme } from './styles/theme.js';
import { isRemote } from './lib/supabase.js';
import { useOnline } from './lib/useData.js';

const NAV = [
  { to: '/', label: 'Home', icon: '🏠', end: true },
  { to: '/plan', label: 'Plan', icon: '🍽️' },
  { to: '/groceries', label: 'Market', icon: '🧺' },
  { to: '/library', label: 'Library', icon: '📖' },
  { to: '/fridge', label: 'Fridge', icon: '📷' },
  { to: '/history', label: 'History', icon: '🕘' },
];

export default function App() {
  const [theme, setTheme] = useState(getSavedTheme());
  const online = useOnline();

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    setTheme(next);
  };

  return (
    <>
      <nav className="topbar">
        <div className="topbar-inner">
          <span className="nav-brand">🌙 Midnight Munch</span>
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              {n.label}
            </NavLink>
          ))}
          <span className="nav-spacer" />
          <button className="theme-toggle" onClick={toggleTheme} title="Toggle light/dark mode">
            {theme === 'dark' ? '☀️' : '🌘'}
          </button>
        </div>
      </nav>

      {!online && (
        <div className="offline-banner">
          Offline — changes are saved on this device and will sync when signal returns.
        </div>
      )}
      {!isRemote && (
        <div className="notice-banner">
          Demo mode — data stays on this device until Supabase is connected (see README).
        </div>
      )}

      <main className="container">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/plan" element={<PlanPage />} />
          <Route path="/groceries" element={<GroceriesPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/fridge" element={<FridgePage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Routes>
      </main>

      {/* App-style bottom tabs on phones; hidden on desktop */}
      <nav className="tabbar">
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => (isActive ? 'active' : '')}>
            <span className="tab-icon">{n.icon}</span>
            {n.label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
