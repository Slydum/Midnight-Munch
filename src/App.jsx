import { useState } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage.jsx';
import PlanPage from './pages/PlanPage.jsx';
import CookingBuddyPage from './pages/CookingBuddyPage.jsx';
import GroceriesPage from './pages/GroceriesPage.jsx';
import LibraryPage from './pages/LibraryPage.jsx';
import FridgePage from './pages/FridgePage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
import { applyTheme, getSavedTheme } from './styles/theme.js';
import { isRemote } from './lib/supabase.js';
import { useOnline } from './lib/useData.js';

const NAV = [
  { to: '/', label: 'Today', icon: '◷', end: true },
  { to: '/plan', label: 'Meal plan', icon: '▦' },
  { to: '/cook', label: 'Cooking', icon: '♨' },
  { to: '/groceries', label: 'Market list', icon: '⌑' },
  { to: '/library', label: 'Recipes', icon: '▤' },
  { to: '/fridge', label: 'Pantry', icon: '◫' },
  { to: '/history', label: 'History', icon: '↺' },
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
    <div className="app-shell">
      <header className="app-header">
        <NavLink to="/" className="brand-lockup" aria-label="Midnight Munch home">
          <span className="brand-mark">m.</span>
          <span className="brand-copy"><strong>midnight munch</strong><small>THE HOUSEHOLD KITCHEN</small></span>
        </NavLink>
        <div className="header-right">
          <span className={online ? 'connection-state' : 'connection-state offline'}><i />{online ? 'All changes saved' : 'Offline mode'}</span>
          <button className="theme-toggle" onClick={toggleTheme} title="Toggle light/dark mode" aria-label="Toggle theme">{theme === 'dark' ? '☼' : '◐'}</button>
        </div>
      </header>

      <div className="app-body">
        <aside className="side-rail">
          <span className="rail-label">YOUR KITCHEN</span>
          {NAV.map((n) => <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `rail-link${isActive ? ' active' : ''}`}><span className="rail-icon">{n.icon}</span><span>{n.label}</span></NavLink>)}
          <div className="rail-foot"><span className="rail-label">HOUSEHOLD SPACE</span><p>Made for everyday meals, shared lists and calmer evenings.</p></div>
        </aside>

        <main className="main-content">
          {!online && <div className="status-banner">You're offline. Changes are saved on this device and will sync when you're back online.</div>}
          {!isRemote && <div className="status-banner demo">You're in local mode. Connect Supabase to share updates between devices.</div>}
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/plan" element={<PlanPage />} />
            <Route path="/cook" element={<CookingBuddyPage />} />
            <Route path="/groceries" element={<GroceriesPage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/fridge" element={<FridgePage />} />
            <Route path="/history" element={<HistoryPage />} />
          </Routes>
        </main>
      </div>

      <nav className="mobile-nav" aria-label="Main navigation">
        {NAV.slice(0,5).map((n) => <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => isActive ? 'active' : ''}><span>{n.icon}</span><small>{n.label === 'Meal plan' ? 'Plan' : n.label === 'Market list' ? 'Market' : n.label}</small></NavLink>)}
      </nav>
    </div>
  );
}
