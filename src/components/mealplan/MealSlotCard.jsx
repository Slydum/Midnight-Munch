import { useState } from 'react';

// One meal slot in the week grid: shows the meal, lock toggle, swap trigger,
// leftover marker, and a gentle plant-based note when relevant.
export default function MealSlotCard({ slotData, meal, onSwap, onToggleLock, onMadeExtra, swapKey }) {
  const [showSteps, setShowSteps] = useState(false);

  if (!slotData || !meal) {
    return (
      <div className="meal-card">
        <span className="muted">No meal fits this slot yet — add more meals to the library.</span>
      </div>
    );
  }

  const locked = slotData.locked;

  return (
    <div key={swapKey} className={`meal-card meal-swap-in${locked ? ' locked' : ''}`}>
      {slotData.leftover && <div className="leftover-tag">♻ leftover · already made</div>}
      <div className="meal-name">
        {meal.plant_based && <span title="Plant-based — a gentle nod to your why">🌱 </span>}
        {meal.name}
      </div>
      <div className="meal-meta">
        ₱{slotData.leftover ? 0 : Number(meal.cost || 0)} · {meal.prep_effort}
        {(meal.nutrition_tags || []).length > 0 && <> · {(meal.nutrition_tags || []).join(', ')}</>}
      </div>
      <div className="meal-actions">
        <button className="btn btn-ghost btn-sm" onClick={onSwap} disabled={locked} title="Swap for another suggestion">
          ⇄ Swap
        </button>
        <button
          className="btn btn-ghost btn-sm"
          onClick={onToggleLock}
          title={locked ? 'Unlock — regeneration may change this' : 'Lock — regeneration keeps this'}
        >
          {locked ? '🔒' : '🔓'}
        </button>
        {meal.prep_effort === 'batch-cook' && !slotData.leftover && (
          <button className="btn btn-ghost btn-sm" onClick={onMadeExtra} title="Made extra servings? Track them as leftovers">
            🍲 Extra
          </button>
        )}
        {meal.instructions && (
          <button className="btn btn-ghost btn-sm" onClick={() => setShowSteps((s) => !s)}>
            {showSteps ? 'Hide' : 'Steps'}
          </button>
        )}
      </div>
      {showSteps && (
        <p className="muted" style={{ whiteSpace: 'pre-wrap', marginTop: 8 }}>{meal.instructions}</p>
      )}
    </div>
  );
}
