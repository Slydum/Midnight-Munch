import Badge from '../components/shared/Badge.jsx';
import { useMeals, usePlans } from '../lib/useData.js';
import { planCost, nutritionStatus, NUTRITION_TAGS } from '../lib/mealGenerator.js';

// Simple log of past weeks: what was eaten, what it cost, how nutrition
// averaged out — for spotting patterns, not planning.
export default function HistoryPage() {
  const { mealsById } = useMeals();
  const { pastPlans } = usePlans();

  return (
    <>
      <h1 style={{ margin: '8px 0 14px', fontSize: '1.4rem' }}>Past weeks</h1>
      {pastPlans.length === 0 && (
        <p className="muted">Nothing here yet — finished weeks will show up automatically.</p>
      )}
      {pastPlans.map((plan) => {
        const spent = planCost(plan, mealsById);
        const ceiling = Number(plan.budget_ceiling || 0);
        const status = nutritionStatus(plan, mealsById);
        const mealNames = [
          ...new Set(
            Object.values(plan.slots || {})
              .flatMap((day) => Object.values(day))
              .map((s) => (s?.meal_id ? mealsById[s.meal_id]?.name : null))
              .filter(Boolean)
          ),
        ];
        return (
          <div className="card" key={plan.id}>
            <div className="row-between">
              <span className="card-title">Week of {plan.week_start}</span>
              <span style={{ fontWeight: 700, color: ceiling && spent > ceiling ? 'var(--color-warn)' : 'inherit' }}>
                ₱{spent.toFixed(0)}{ceiling ? ` / ₱${ceiling.toFixed(0)}` : ''}
              </span>
            </div>
            <div className="row" style={{ marginBottom: 8 }}>
              {NUTRITION_TAGS.map((tag) => (
                <Badge key={tag} kind={status[tag].onTrack ? 'ok' : 'low'}>
                  {tag}: {status[tag].onTrack ? 'on track' : 'low'}
                </Badge>
              ))}
            </div>
            <p className="muted">{mealNames.join(' · ') || 'No meals recorded'}</p>
          </div>
        );
      })}
    </>
  );
}
