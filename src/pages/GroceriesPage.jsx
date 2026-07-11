import GroceryList from '../components/grocerylist/GroceryList.jsx';
import { useMeals, usePlans, useOnline } from '../lib/useData.js';

export default function GroceriesPage() {
  const { mealsById } = useMeals();
  const { currentPlan, savePlan } = usePlans();
  const online = useOnline();

  const toggle = (key) => {
    const checks = { ...(currentPlan.grocery_checks || {}) };
    checks[key] = !checks[key];
    savePlan({ ...currentPlan, grocery_checks: checks });
  };

  return (
    <>
      <div className="row-between" style={{ margin: '8px 0 14px' }}>
        <h1 style={{ fontSize: '1.4rem' }}>Market list</h1>
        {!online && <span className="badge badge-low">offline — will sync</span>}
      </div>
      <GroceryList plan={currentPlan} mealsById={mealsById} onToggle={toggle} />
    </>
  );
}
