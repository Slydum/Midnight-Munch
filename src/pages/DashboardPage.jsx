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

  return (
    <>
      <h1 style={{ margin: '8px 0 14px', fontSize: '1.4rem' }}>Tonight's lineup</h1>

      <MantraCard settings={settings} onSave={save} />

      <div className="card" style={{ marginTop: 12 }}>
        <div className="row-between">
          <span className="card-title">Today · {today}</span>
          <Link to="/plan"><button className="btn btn-ghost btn-sm">Full week →</button></Link>
        </div>
        {!todaySlots && (
          <p className="muted">
            No plan yet for this week. <Link to="/plan">Generate one</Link> — it takes one tap.
          </p>
        )}
        {todaySlots && SLOTS.map((slot) => {
          const s = todaySlots[slot];
          const meal = s?.meal_id ? mealsById[s.meal_id] : null;
          return (
            <div key={slot} className="row-between" style={{ padding: '6px 0' }}>
              <span className="muted">{SLOT_LABELS[slot]}</span>
              <span style={{ fontWeight: 600 }}>
                {meal ? `${meal.plant_based ? '🌱 ' : ''}${meal.name}${s.leftover ? ' ♻' : ''}` : '—'}
              </span>
            </div>
          );
        })}
      </div>

      <div className="grid grid-2" style={{ marginTop: 12 }}>
        <BudgetTracker plan={currentPlan} mealsById={mealsById} settings={settings}
          onSaveSettings={save} pastPlans={pastPlans} />
        <NutritionFlags plan={currentPlan} mealsById={mealsById} />
      </div>

      {leftovers.length > 0 && (
        <div className="card" style={{ marginTop: 12 }}>
          <div className="card-title">♻ In the fridge, ready to reheat</div>
          {leftovers.map((l) => (
            <p key={l.id} className="muted">
              {mealsById[l.meal_id]?.name || 'Unknown meal'} — {l.servings_left} serving{l.servings_left > 1 ? 's' : ''} left
              (made {l.made_on})
            </p>
          ))}
        </div>
      )}
    </>
  );
}
