import { Link } from 'react-router-dom';
import MantraCard from '../components/dashboard/MantraCard.jsx';
import BudgetTracker from '../components/budget/BudgetTracker.jsx';
import NutritionFlags from '../components/nutrition/NutritionFlags.jsx';
import { useMeals, usePlans, useSettings, useLeftovers } from '../lib/useData.js';
import { SLOTS, SLOT_LABELS, isoDate } from '../lib/mealGenerator.js';

export default function DashboardPage() {
  const { mealsById } = useMeals();
  const { currentPlan, pastPlans } = usePlans();
  const { settings, save } = useSettings();
  const { leftovers } = useLeftovers();
  const today = isoDate(new Date());
  const todaySlots = currentPlan?.slots?.[today];
  const mealCount = todaySlots ? SLOTS.filter(slot => todaySlots[slot]?.meal_id).length : 0;

  return (
    <section className="today-page">
      <div className="page-kicker"><span>YOUR DAILY EDITION</span><span>{new Date().toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'})}</span></div>
      <div className="welcome-grid">
        <div className="welcome-copy">
          <p className="eyebrow">A LITTLE MORE ORDER, A LITTLE LESS WHAT'S FOR DINNER</p>
          <h1>Your kitchen,<br/><em>in good rhythm.</em></h1>
          <p className="welcome-description">Plan the week, keep the groceries together, and make room for meals worth looking forward to.</p>
          <div className="welcome-actions"><Link className="primary-link" to="/plan">Open this week's plan <span>↗</span></Link><Link className="text-link" to="/library">Browse recipes</Link></div>
        </div>
        <div className="welcome-note">
          <span className="note-label">TODAY AT A GLANCE</span>
          <div className="note-number">{String(mealCount).padStart(2,'0')}<small>/ 03</small></div>
          <p>meals planned for today</p>
          <div className="note-rule"/>
          <span className="note-date">{today}</span>
        </div>
      </div>

      <div className="section-heading"><div><span className="eyebrow">THE DAILY TABLE</span><h2>Today's lineup</h2></div><Link to="/plan" className="subtle-link">See full week ↗</Link></div>
      <section className="today-meals card">
        {!todaySlots && <div className="empty-plan"><div className="empty-icon">✳</div><div><strong>No meals on the table yet.</strong><p>Build a plan for the week and let dinner stop being a daily mystery.</p></div><Link to="/plan" className="primary-link">Create a meal plan ↗</Link></div>}
        {todaySlots && SLOTS.map((slot,index) => {
          const s = todaySlots[slot];
          const meal = s?.meal_id ? mealsById[s.meal_id] : null;
          return <div className="today-meal-row" key={slot}><span className="meal-index">0{index+1}</span><span className="meal-time">{SLOT_LABELS[slot]}</span><strong>{meal ? `${meal.plant_based ? '🌱 ' : ''}${meal.name}${s.leftover ? ' · leftovers' : ''}` : 'Nothing planned'}</strong><span className="meal-status">{meal ? 'ON THE MENU' : 'OPEN SLOT'}</span></div>;
        })}
      </section>

      <div className="section-heading compact"><div><span className="eyebrow">KEEPING THINGS IN CHECK</span><h2>The household overview</h2></div></div>
      <div className="overview-grid">
        <div className="overview-card"><BudgetTracker plan={currentPlan} mealsById={mealsById} settings={settings} onSaveSettings={save} pastPlans={pastPlans}/></div>
        <div className="overview-card"><NutritionFlags plan={currentPlan} mealsById={mealsById}/></div>
      </div>

      {leftovers.length > 0 && <section className="leftover-strip"><span className="leftover-symbol">↻</span><div><span className="eyebrow">USE WHAT YOU HAVE</span><strong>Ready for another round</strong><p>{leftovers.map(l => `${mealsById[l.meal_id]?.name || 'Saved meal'} · ${l.servings_left} serving(s)`).join('  /  ')}</p></div><Link to="/fridge">View pantry ↗</Link></section>}
      <div className="mantra-wrap"><MantraCard settings={settings} onSave={save}/></div>
    </section>
  );
}
