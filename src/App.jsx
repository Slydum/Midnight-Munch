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
  { to: '/', label: 'Dashboard', end: true },
  { to: '/plan', label: 'Plan' },
  { to: '/groceries', label: 'Groceries' },
  { to: '/library', label: 'Library' },
  { to: '/fridge', label: 'Fridge Scan' },
  { to: '/history', label: 'History' },
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
      <nav className="nav">
        <div className="nav-inner">
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
        <div className="offline-banner" style={{ background: 'var(--color-accent)', color: 'var(--color-text)' }}>
          Demo mode (device-only storage). Set VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY to sync between both of you.
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
    </>
  );
}
