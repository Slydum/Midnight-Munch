// Build a consolidated grocery list from the current week's plan.
// Same ingredient across meals -> one line item with summed quantity,
// grouped by wet-market section. Leftover slots contribute nothing
// (already cooked and paid for).

export const MARKET_SECTIONS = ['Produce', 'Seafood', 'Dry Goods/Pantry', 'Others'];

function normalizeName(name) {
  return String(name || '').trim().toLowerCase();
}

export function itemKey(name, unit) {
  return `${normalizeName(name)}|${normalizeName(unit)}`;
}

/**
 * @returns {Array<{key, name, unit, qty, section, meals: string[]}>}
 */
export function buildGroceryList(plan, mealsById) {
  const items = new Map();

  for (const slots of Object.values(plan?.slots || {})) {
    for (const s of Object.values(slots)) {
      if (!s?.meal_id || s.leftover) continue;
      const meal = mealsById[s.meal_id];
      if (!meal) continue;
      for (const ing of meal.ingredients || []) {
        const key = itemKey(ing.name, ing.unit);
        if (!items.has(key)) {
          items.set(key, {
            key,
            name: ing.name,
            unit: ing.unit || '',
            qty: 0,
            section: MARKET_SECTIONS.includes(ing.section) ? ing.section : 'Others',
            meals: [],
          });
        }
        const item = items.get(key);
        item.qty += Number(ing.qty || 0);
        if (!item.meals.includes(meal.name)) item.meals.push(meal.name);
      }
    }
  }

  return [...items.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function groupBySection(items) {
  const groups = Object.fromEntries(MARKET_SECTIONS.map((s) => [s, []]));
  for (const item of items) {
    (groups[item.section] || groups.Others).push(item);
  }
  return groups;
}

export function formatQty(qty) {
  const n = Number(qty);
  if (Number.isInteger(n)) return String(n);
  return String(Math.round(n * 100) / 100);
}
