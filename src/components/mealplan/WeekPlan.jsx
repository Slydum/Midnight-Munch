import { useState } from 'react';
import MealSlotCard from './MealSlotCard.jsx';
import SwapModal from './SwapModal.jsx';
import Modal from '../shared/Modal.jsx';
import { generateWeekPlan, weekDates, SLOTS, SLOT_LABELS } from '../../lib/mealGenerator.js';

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function WeekPlan({
  plan,
  weekStart,
  meals,
  mealsById,
  settings,
  pastPlans,
  leftovers,
  savedWeeks,
  onSavePlan,
  onSaveWeekTemplate,
  onAddLeftover,
}) {
  const [swapTarget, setSwapTarget] = useState(null); // {date, slot}
  const [swapTick, setSwapTick] = useState(0); // re-keys cards to replay the swap animation
  const [saveName, setSaveName] = useState(null); // null = closed, '' = open
  const [showApply, setShowApply] = useState(false);

  const dates = weekDates(weekStart);

  const generate = (existingPlan = null, onlyDate = null) => {
    const next = generateWeekPlan({
      meals,
      weekStartIso: weekStart,
      budgetCeiling: Number(settings.budget_ceiling || 0),
      pastPlans,
      cooldownDays: Number(settings.cooldown_days || 10),
      leftovers,
      existingPlan,
      onlyDate,
    });
    onSavePlan(next);
    setSwapTick((t) => t + 1);
  };

  const setSlot = (date, slot, patch) => {
    const next = {
      ...plan,
      slots: {
        ...plan.slots,
        [date]: { ...plan.slots[date], [slot]: patch },
      },
    };
    onSavePlan(next);
  };

  const handleMadeExtra = (date, slot) => {
    const mealId = plan.slots[date][slot]?.meal_id;
    if (!mealId) return;
    const raw = window.prompt('How many extra servings did you make?', '2');
    const servings = Number(raw);
    if (!raw || !Number.isFinite(servings) || servings <= 0) return;
    onAddLeftover({ meal_id: mealId, servings_left: servings, made_on: date });
  };

  if (!plan) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 32 }}>
        <p style={{ marginBottom: 12 }}>No plan for this week yet.</p>
        <div className="row" style={{ justifyContent: 'center' }}>
          <button className="btn btn-cta" onClick={() => generate()}>✨ Generate this week</button>
          {savedWeeks.length > 0 && (
            <button className="btn btn-ghost" onClick={() => setShowApply(true)}>Use a saved week</button>
          )}
        </div>
        {showApply && (
          <ApplySavedModal
            savedWeeks={savedWeeks}
            onClose={() => setShowApply(false)}
            onPick={(w) => {
              onSavePlan({ week_start: weekStart, slots: remapSlots(w.slots, weekStart), budget_ceiling: settings.budget_ceiling });
              setShowApply(false);
            }}
          />
        )}
      </div>
    );
  }

  return (
    <>
      <div className="row" style={{ marginBottom: 12 }}>
        <button className="btn btn-cta" onClick={() => generate(plan)}>↻ Regenerate week</button>
        <button className="btn btn-ghost" onClick={() => setSaveName('')}>★ Save this week</button>
        {savedWeeks.length > 0 && (
          <button className="btn btn-ghost" onClick={() => setShowApply(true)}>Use a saved week</button>
        )}
        <span className="muted">Locked meals (🔒) survive regeneration.</span>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))' }}>
        {dates.map((date, i) => (
          <div className="card plan-day" key={date}>
            <div className="card-title">{DAY_NAMES[i]} <span className="muted">{date.slice(5)}</span></div>
            <button className="btn btn-ghost btn-sm" onClick={() => generate(plan, date)} style={{ marginBottom: 4 }}>
              ↻ Regenerate day
            </button>
            {SLOTS.map((slot) => {
              const slotData = plan.slots?.[date]?.[slot];
              return (
                <div key={slot}>
                  <div className="slot-label">{SLOT_LABELS[slot]}</div>
                  <MealSlotCard
                    swapKey={`${date}-${slot}-${slotData?.meal_id}-${swapTick}`}
                    slotData={slotData}
                    meal={slotData?.meal_id ? mealsById[slotData.meal_id] : null}
                    onSwap={() => setSwapTarget({ date, slot })}
                    onToggleLock={() => setSlot(date, slot, { ...slotData, locked: !slotData.locked })}
                    onMadeExtra={() => handleMadeExtra(date, slot)}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {swapTarget && (
        <SwapModal
          meals={meals}
          plan={plan}
          date={swapTarget.date}
          slot={swapTarget.slot}
          onClose={() => setSwapTarget(null)}
          onPick={(mealId) => {
            setSlot(swapTarget.date, swapTarget.slot, { meal_id: mealId, locked: false, leftover: false });
            setSwapTarget(null);
            setSwapTick((t) => t + 1);
          }}
        />
      )}

      {saveName !== null && (
        <Modal title="Save this week as a template" onClose={() => setSaveName(null)}>
          <label className="field">
            Template name
            <input type="text" value={saveName} onChange={(e) => setSaveName(e.target.value)} placeholder="e.g. Payday week winner" autoFocus />
          </label>
          <button
            className="btn"
            disabled={!saveName.trim()}
            onClick={() => {
              onSaveWeekTemplate({ name: saveName.trim(), slots: plan.slots });
              setSaveName(null);
            }}
          >
            Save template
          </button>
        </Modal>
      )}

      {showApply && (
        <ApplySavedModal
          savedWeeks={savedWeeks}
          onClose={() => setShowApply(false)}
          onPick={(w) => {
            onSavePlan({ ...plan, slots: remapSlots(w.slots, weekStart) });
            setShowApply(false);
            setSwapTick((t) => t + 1);
          }}
        />
      )}
    </>
  );
}

// A saved template's slots carry old dates — remap day 1..7 onto the target week.
function remapSlots(savedSlots, weekStart) {
  const savedDates = Object.keys(savedSlots).sort();
  const targetDates = weekDates(weekStart);
  const out = {};
  targetDates.forEach((date, i) => {
    const src = savedSlots[savedDates[i]] || { pre: null, mid: null, post: null };
    out[date] = JSON.parse(JSON.stringify(src));
  });
  return out;
}

function ApplySavedModal({ savedWeeks, onClose, onPick }) {
  return (
    <Modal title="Apply a saved week" onClose={onClose}>
      {savedWeeks.map((w) => (
        <div key={w.id} className="row-between" style={{ padding: '8px 0', borderBottom: '1px dashed var(--color-border)' }}>
          <div>
            <div style={{ fontWeight: 600 }}>★ {w.name}</div>
            <div className="muted">saved {String(w.created_at || '').slice(0, 10)}</div>
          </div>
          <button className="btn btn-sm" onClick={() => onPick(w)}>Apply</button>
        </div>
      ))}
    </Modal>
  );
}
