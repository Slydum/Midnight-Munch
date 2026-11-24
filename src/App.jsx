import {useState} from 'react';
import {Routes,Route,NavLink,Navigate,useNavigate} from 'react-router-dom';
import DashboardPage from './pages/DashboardPage.jsx';
import PlanPage from './pages/PlanPage.jsx';
import CookingBuddyPage from './pages/CookingBuddyPage.jsx';
import GroceriesPage from './pages/GroceriesPage.jsx';
import LibraryPage from './pages/LibraryPage.jsx';
import FridgePage from './pages/FridgePage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
import HouseholdSetup from './pages/HouseholdSetup.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import {applyTheme,getSavedTheme} from './styles/theme.js';
import {useSettings} from './lib/useData.js';
const NAV=[{to:'/',label:'Today',icon:'◷',end:true},{to:'/plan',label:'Meal plan',icon:'▦'},{to:'/cook',label:'Cooking',icon:'♨'},{to:'/groceries',label:'Market list',icon:'⌑'},{to:'/library',label:'Recipes',icon:'▤'},{to:'/fridge',label:'Pantry',icon:'◫'},{to:'/history',label:'History',icon:'↺'}];
export default function App(){
 const [theme,setTheme]=useState(getSavedTheme());
 const {settings,save,loading}=useSettings();
 const navigate=useNavigate();
 const toggleTheme=()=>{const next=theme==='dark'?'light':'dark';applyTheme(next);setTheme(next);};
 if(loading)return <div className="setup-loading">Preparing your kitchen…</div>;
 if(!settings.onboarding_completed)return <HouseholdSetup settings={settings} onSave={save} onComplete={()=>navigate('/plan',{replace:true})}/>;
 return <div className="app-shell"><header className="app-header"><NavLink to="/" className="brand-lockup" aria-label="Midnight Munch home"><span className="brand-mark">m.</span><span className="brand-copy"><strong>midnight munch</strong><small>THE HOUSEHOLD KITCHEN</small></span></NavLink><div className="header-right"><NavLink to="/settings" className="settings-link">Household settings ↗</NavLink><span className="connection-state"><i/>Saved on this device</span><button className="theme-toggle" onClick={toggleTheme} title="Toggle light/dark mode" aria-label="Toggle theme">{theme==='dark'?'☼':'◐'}</button></div></header><div className="app-body"><aside className="side-rail"><span className="rail-label">YOUR KITCHEN</span>{NAV.map(n=><NavLink key={n.to} to={n.to} end={n.end} className={({isActive})=>`rail-link${isActive?' active':''}`}><span className="rail-icon">{n.icon}</span><span>{n.label}</span></NavLink>)}<div className="rail-foot"><span className="rail-label">HOUSEHOLD SPACE</span><p>Made for everyday meals, shared lists and calmer evenings.</p></div></aside><main className="main-content"><Routes><Route path="/" element={<DashboardPage/>}/><Route path="/plan" element={<PlanPage/>}/><Route path="/cook" element={<CookingBuddyPage/>}/><Route path="/groceries" element={<GroceriesPage/>}/><Route path="/library" element={<LibraryPage/>}/><Route path="/fridge" element={<FridgePage/>}/><Route path="/history" element={<HistoryPage/>}/><Route path="/settings" element={<SettingsPage settings={settings} onSave={save}/>}/><Route path="*" element={<Navigate to="/" replace/>}/></Routes></main></div><nav className="mobile-nav" aria-label="Main navigation">{NAV.slice(0,5).map(n=><NavLink key={n.to} to={n.to} end={n.end} className={({isActive})=>isActive?'active':''}><span>{n.icon}</span><small>{n.label==='Meal plan'?'Plan':n.label==='Market list'?'Market':n.label}</small></NavLink>)}</nav></div>;
}
