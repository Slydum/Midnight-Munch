// Weekly plan generation for the 8PM–6AM night-shift schedule.
//
// Slots per day:
//   pre  — dinner before 8PM (any effort)
//   mid  — midnight meal (must be no-cook / minimal prep)
//   post — ~6AM light meal
//
// Rules:
//   * nutrition tags balance across the WEEK as an average, not per meal
//   * total plan cost must respect the weekly budget ceiling
//   * a meal is not repeated within the cooldown window (default 10 days)
//   * available leftovers are suggested before brand-new meals (cost 0)
//   * locked slots are never touched on regeneration

export const SLOTS = ['pre', 'mid', 'post'];
export const SLOT_LABELS = {
  pre: 'Pre-shift · dinner (before 8PM)',
  mid: 'Mid-shift · midnight (no-cook)',
  post: 'Post-shift · light (~6AM)',
};
export const NUTRITION_TAGS = ['protein', 'B12', 'iron', 'omega-3'];
// A tag is "on track" when at least this share of the week's meals carry it.
const TAG_TARGET_SHARE = { protein: 0.5, B12: 0.2, iron: 0.35, 'omega-3': 0.2 };

export function weekStartOf(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun
  const diff = (day + 6) % 7; // back to Monday
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function isoDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function weekDates(weekStartIso) {
  const start = new Date(weekStartIso + 'T00:00:00');
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return isoDate(d);
  });
}

function slotEligible(meal, slot) {
  if (!(meal.time_slots || []).includes(slot)) return false;
  if (slot === 'mid' && meal.prep_effort !== 'no-cook') return false;
  return true;
}

// meal ids used within `cooldownDays` before `weekStartIso`, from past plans.
export function recentMealIds(pastPlans, weekStartIso, cooldownDays) {
  const cutoff = new Date(weekStartIso + 'T00:00:00');
  cutoff.setDate(cutoff.getDate() - cooldownDays);
  const used = new Set();
  for (const plan of pastPlans) {
    for (const [date, slots] of Object.entries(plan.slots || {})) {
      const d = new Date(date + 'T00:00:00');
      if (d >= cutoff && d < new Date(weekStartIso + 'T00:00:00')) {
        for (const s of Object.values(slots)) if (s?.meal_id) used.add(s.meal_id);
      }
    }
  }
  return used;
}

export function planCost(plan, mealsById) {
  let total = 0;
  for (const slots of Object.values(plan.slots || {})) {
    for (const s of Object.values(slots)) {
      if (!s?.meal_id || s.leftover) continue; // leftovers already paid for
      total += Number(mealsById[s.meal_id]?.cost || 0);
    }
  }
  return total;
}

// Weekly nutrition status: { tag: { share, onTrack } }
export function nutritionStatus(plan, mealsById) {
  const counts = Object.fromEntries(NUTRITION_TAGS.map((t) => [t, 0]));
  let mealCount = 0;
  for (const slots of Object.values(plan.slots || {})) {
    for (const s of Object.values(slots)) {
      const meal = s?.meal_id && mealsById[s.meal_id];
      if (!meal) continue;
      mealCount++;
      for (const tag of meal.nutrition_tags || []) {
        if (tag in counts) counts[tag]++;
      }
    }
  }
  const status = {};
  for (const tag of NUTRITION_TAGS) {
    const share = mealCount ? counts[tag] / mealCount : 0;
    status[tag] = { share, target: TAG_TARGET_SHARE[tag], onTrack: share >= TAG_TARGET_SHARE[tag] };
  }
  return status;
}

// Score a candidate: reward under-covered nutrition tags, mild cost pressure,
// small jitter so regeneration feels fresh.
function scoreMeal(meal, tagDeficits, budgetLeft) {
  let score = Math.random() * 0.5;
  for (const tag of meal.nutrition_tags || []) {
    score += (tagDeficits[tag] || 0) * 3;
  }
  const cost = Number(meal.cost || 0);
  if (cost > budgetLeft) score -= 100; // hard budget pressure
  else score += (1 - cost / Math.max(budgetLeft, 1)) * 0.4;
  return score;
}

/**
 * Generate (or regenerate) a week plan.
 * @param opts.meals        meal library rows
 * @param opts.weekStartIso 'YYYY-MM-DD' Monday
 * @param opts.budgetCeiling weekly ceiling in currency units
 * @param opts.pastPlans    previous week_plans rows (for cooldown)
 * @param opts.cooldownDays default 10
 * @param opts.leftovers    leftover rows [{meal_id, servings_left}]
 * @param opts.existingPlan plan to regenerate (locked slots preserved)
 * @param opts.onlyDate     regenerate a single day only
 */
export function generateWeekPlan(opts) {
  const {
    meals,
    weekStartIso,
    budgetCeiling,
    pastPlans = [],
    cooldownDays = 10,
    leftovers = [],
    existingPlan = null,
    onlyDate = null,
  } = opts;

  const mealsById = Object.fromEntries(meals.map((m) => [m.id, m]));
  const dates = weekDates(weekStartIso);
  const recent = recentMealIds(pastPlans, weekStartIso, cooldownDays);

  const slots = {};
  for (const date of dates) {
    slots[date] = { pre: null, mid: null, post: null };
    const prev = existingPlan?.slots?.[date];
    if (prev) {
      for (const s of SLOTS) {
        const keep = onlyDate ? date !== onlyDate || prev[s]?.locked : prev[s]?.locked;
        if (keep && prev[s]) slots[date][s] = prev[s];
      }
    }
  }

  // Track usage within this week (avoid repeats inside the same week too)
  const usedThisWeek = new Set();
  for (const day of Object.values(slots)) {
    for (const s of Object.values(day)) if (s?.meal_id) usedThisWeek.add(s.meal_id);
  }

  // Leftover servings pool
  const leftoverPool = {};
  for (const l of leftovers) {
    if (l.servings_left > 0) leftoverPool[l.meal_id] = (leftoverPool[l.meal_id] || 0) + l.servings_left;
  }

  let spent = 0;
  for (const day of Object.values(slots)) {
    for (const s of Object.values(day)) {
      if (s?.meal_id && !s.leftover) spent += Number(mealsById[s.meal_id]?.cost || 0);
    }
  }

  const tagCounts = Object.fromEntries(NUTRITION_TAGS.map((t) => [t, 0]));
  let placed = 0;
  const countMeal = (meal) => {
    placed++;
    for (const t of meal.nutrition_tags || []) if (t in tagCounts) tagCounts[t]++;
  };
  for (const day of Object.values(slots)) {
    for (const s of Object.values(day)) {
      if (s?.meal_id && mealsById[s.meal_id]) countMeal(mealsById[s.meal_id]);
    }
  }

  // Budget reservation: cheapest eligible meal cost per slot type, so early
  // picks can't spend money that later slots will inevitably need.
  const cheapestBySlot = {};
  for (const slot of SLOTS) {
    const costs = meals.filter((m) => slotEligible(m, slot)).map((m) => Number(m.cost || 0));
    cheapestBySlot[slot] = costs.length ? Math.min(...costs) : 0;
  }
  const remainingBySlot = { pre: 0, mid: 0, post: 0 };
  for (const date of dates) {
    for (const slot of SLOTS) {
      if (!slots[date][slot]) remainingBySlot[slot]++;
    }
  }
  const reserveForOthers = () =>
    SLOTS.reduce((sum, s) => sum + remainingBySlot[s] * cheapestBySlot[s], 0);

  for (const date of dates) {
    for (const slot of SLOTS) {
      if (slots[date][slot]) continue; // locked/kept
      remainingBySlot[slot]--; // this slot is being filled now

      // 1) leftovers first — already paid for
      const leftoverId = Object.keys(leftoverPool).find(
        (id) => leftoverPool[id] > 0 && mealsById[id] && slotEligible(mealsById[id], slot)
      );
      if (leftoverId) {
        leftoverPool[leftoverId]--;
        slots[date][slot] = { meal_id: leftoverId, locked: false, leftover: true };
        countMeal(mealsById[leftoverId]);
        continue;
      }

      // 2) fresh pick
      const tagDeficits = {};
      for (const tag of NUTRITION_TAGS) {
        const share = placed ? tagCounts[tag] / placed : 0;
        tagDeficits[tag] = Math.max(0, TAG_TARGET_SHARE[tag] - share);
      }
      const budgetLeft = budgetCeiling - spent - reserveForOthers();

      let candidates = meals.filter(
        (m) => slotEligible(m, slot) && !recent.has(m.id) && !usedThisWeek.has(m.id)
      );
      // Relax constraints progressively if the library is small.
      if (!candidates.length) candidates = meals.filter((m) => slotEligible(m, slot) && !usedThisWeek.has(m.id));
      if (!candidates.length) candidates = meals.filter((m) => slotEligible(m, slot));
      if (!candidates.length) continue; // slot stays empty — UI will flag it

      // Hard budget preference: only consider meals that fit the remaining
      // ceiling when any exist; otherwise fall back to the cheapest options
      // so a small library still fills the week (UI flags the overage).
      let affordable = candidates.filter((m) => Number(m.cost || 0) <= budgetLeft);
      if (!affordable.length) {
        // No unused candidate fits — allow repeating an already-used meal
        // before blowing the ceiling.
        affordable = meals.filter((m) => slotEligible(m, slot) && Number(m.cost || 0) <= budgetLeft);
      }
      if (affordable.length) {
        candidates = affordable;
      } else {
        candidates = [...candidates].sort((a, b) => Number(a.cost || 0) - Number(b.cost || 0)).slice(0, 3);
      }

      candidates.sort((a, b) => scoreMeal(b, tagDeficits, budgetLeft) - scoreMeal(a, tagDeficits, budgetLeft));
      const pick = candidates[0];
      slots[date][slot] = { meal_id: pick.id, locked: false, leftover: false };
      usedThisWeek.add(pick.id);
      spent += Number(pick.cost || 0);
      countMeal(pick);
    }
  }

  return {
    ...(existingPlan || {}),
    week_start: weekStartIso,
    slots,
    budget_ceiling: budgetCeiling,
  };
}

// Alternative suggestions for the Swap action on one slot.
export function suggestSwaps({ meals, plan, date, slot, count = 5 }) {
  const current = plan.slots?.[date]?.[slot]?.meal_id;
  const usedThisWeek = new Set();
  for (const day of Object.values(plan.slots || {})) {
    for (const s of Object.values(day)) if (s?.meal_id) usedThisWeek.add(s.meal_id);
  }
  const fresh = meals.filter((m) => slotEligible(m, slot) && m.id !== current && !usedThisWeek.has(m.id));
  const repeatsOk = meals.filter((m) => slotEligible(m, slot) && m.id !== current && usedThisWeek.has(m.id));
  return [...fresh, ...repeatsOk].slice(0, count);
}
