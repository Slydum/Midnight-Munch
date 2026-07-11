import WeekPlan from '../components/mealplan/WeekPlan.jsx';
import BudgetTracker from '../components/budget/BudgetTracker.jsx';
import NutritionFlags from '../components/nutrition/NutritionFlags.jsx';
import { useMeals, usePlans, useSettings, useLeftovers, useSavedWeeks } from '../lib/useData.js';
import { db } from '../lib/supabase.js';

export default function PlanPage() {
  const { meals, mealsById, loading } = useMeals();
  const { currentPlan, pastPlans, savePlan, weekStart } = usePlans();
  const { settings, save: saveSettings } = useSettings();
  const { leftovers, save: saveLeftover } = useLeftovers();
  const { savedWeeks, save: saveWeekTemplate } = useSavedWeeks();

  if (loading) return <p className="muted">Loading…</p>;

  return (
    <>
      <h1 style={{ margin: '8px 0 14px', fontSize: '1.4rem' }}>Week of {weekStart}</h1>

      {/* Live budget + nutrition re-check as the plan is tweaked */}
      <div className="grid grid-2" style={{ marginBottom: 12 }}>
        <BudgetTracker plan={currentPlan} mealsById={mealsById} settings={settings}
          onSaveSettings={saveSettings} pastPlans={pastPlans} />
        <NutritionFlags plan={currentPlan} mealsById={mealsById} />
      </div>

      <WeekPlan
        plan={currentPlan}
        weekStart={weekStart}
        meals={meals}
        mealsById={mealsById}
        settings={settings}
        pastPlans={pastPlans}
        leftovers={leftovers}
        savedWeeks={savedWeeks}
        onSavePlan={savePlan}
        onSaveWeekTemplate={saveWeekTemplate}
        onAddLeftover={(l) => saveLeftover(l)}
      />

      {leftovers.length > 0 && (
        <div className="card" style={{ marginTop: 12 }}>
          <div className="card-title">♻ Leftovers on hand</div>
          <p className="muted" style={{ marginBottom: 8 }}>
            Regenerating slots these fit will suggest reheating them first — they cost ₱0 in the plan.
          </p>
          {leftovers.map((l) => (
            <div key={l.id} className="row-between" style={{ padding: '4px 0' }}>
              <span>{mealsById[l.meal_id]?.name || '?'} · {l.servings_left} serving{l.servings_left > 1 ? 's' : ''}</span>
              <button className="btn btn-ghost btn-sm"
                onClick={() => db.upsert('leftovers', { ...l, servings_left: l.servings_left - 1 })}>
                Ate one
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
