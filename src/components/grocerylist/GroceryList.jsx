import { buildGroceryList, groupBySection, formatQty, MARKET_SECTIONS } from '../../lib/groceryBuilder.js';

// Consolidated market list from the live plan. Checked state lives on the
// week_plans row (grocery_checks map) so both users see the same list
// mid-trip; the data layer queues writes while offline and syncs later.
export default function GroceryList({ plan, mealsById, onToggle }) {
  if (!plan) return <p className="muted">Generate this week's plan first — the list builds itself from it.</p>;

  const items = buildGroceryList(plan, mealsById);
  const groups = groupBySection(items);
  const checks = plan.grocery_checks || {};
  const done = items.filter((i) => checks[i.key]).length;

  return (
    <>
      <p className="muted" style={{ marginBottom: 12 }}>
        {done}/{items.length} picked up · list updates automatically when the plan changes · works offline at the market
      </p>
      {MARKET_SECTIONS.map((section) => {
        const rows = groups[section];
        if (!rows.length) return null;
        return (
          <div className="card" key={section}>
            <div className="card-title">{section}</div>
            {rows.map((item) => {
              const checked = Boolean(checks[item.key]);
              return (
                <label className={`grocery-item${checked ? ' checked' : ''}`} key={item.key}>
                  <input type="checkbox" checked={checked} onChange={() => onToggle(item.key)} />
                  <span className="g-name" style={{ flex: 1 }}>
                    {item.name}
                    <span className="muted"> — {formatQty(item.qty)} {item.unit}</span>
                  </span>
                  <span className="muted" title={`Used in: ${item.meals.join(', ')}`}>
                    {item.meals.length} meal{item.meals.length > 1 ? 's' : ''}
                  </span>
                </label>
              );
            })}
          </div>
        );
      })}
    </>
  );
}
