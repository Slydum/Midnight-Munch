import { useState } from 'react';
import Modal from '../shared/Modal.jsx';
import { NUTRITION_TAGS, SLOTS, SLOT_LABELS } from '../../lib/mealGenerator.js';
import { MARKET_SECTIONS } from '../../lib/groceryBuilder.js';

const EFFORTS = ['no-cook', 'one-pan', 'batch-cook'];

const emptyIngredient = () => ({ name: '', qty: 1, unit: '', section: 'Produce' });

export default function MealForm({ initial, onSave, onClose }) {
  const [meal, setMeal] = useState(() => ({
    name: '',
    ingredients: [emptyIngredient()],
    cost: 0,
    prep_effort: 'one-pan',
    time_slots: ['pre'],
    nutrition_tags: [],
    plant_based: true,
    instructions: '',
    ...(initial || {}),
  }));

  const set = (patch) => setMeal((m) => ({ ...m, ...patch }));
  const setIngredient = (i, patch) =>
    set({ ingredients: meal.ingredients.map((ing, idx) => (idx === i ? { ...ing, ...patch } : ing)) });

  const toggleIn = (list, value) =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  const valid = meal.name.trim() && meal.time_slots.length > 0;

  return (
    <Modal title={initial?.id ? 'Edit meal' : 'Add meal'} onClose={onClose}>
      <label className="field">
        Name
        <input type="text" value={meal.name} onChange={(e) => set({ name: e.target.value })} autoFocus />
      </label>

      <div className="field" style={{ display: 'block', marginBottom: 10 }}>
        <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>Ingredients</span>
        {meal.ingredients.map((ing, i) => (
          <div className="row" key={i} style={{ marginTop: 6 }}>
            <input type="text" placeholder="name" value={ing.name} style={{ flex: 2, minWidth: 90 }}
              onChange={(e) => setIngredient(i, { name: e.target.value })} />
            <input type="number" placeholder="qty" value={ing.qty} style={{ width: 64 }} min="0" step="0.25"
              onChange={(e) => setIngredient(i, { qty: e.target.value })} />
            <input type="text" placeholder="unit" value={ing.unit} style={{ width: 80 }}
              onChange={(e) => setIngredient(i, { unit: e.target.value })} />
            <select value={ing.section} style={{ width: 130 }} onChange={(e) => setIngredient(i, { section: e.target.value })}>
              {MARKET_SECTIONS.map((s) => <option key={s}>{s}</option>)}
            </select>
            <button className="btn btn-ghost btn-sm" onClick={() => set({ ingredients: meal.ingredients.filter((_, idx) => idx !== i) })}>✕</button>
          </div>
        ))}
        <button className="btn btn-ghost btn-sm" style={{ marginTop: 6 }}
          onClick={() => set({ ingredients: [...meal.ingredients, emptyIngredient()] })}>
          + Ingredient
        </button>
      </div>

      <div className="grid grid-2">
        <label className="field">
          Estimated cost (₱)
          <input type="number" min="0" value={meal.cost} onChange={(e) => set({ cost: Number(e.target.value) || 0 })} />
        </label>
        <label className="field">
          Prep effort
          <select value={meal.prep_effort} onChange={(e) => set({ prep_effort: e.target.value })}>
            {EFFORTS.map((x) => <option key={x}>{x}</option>)}
          </select>
        </label>
      </div>

      <div className="field">
        <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>Valid time slots</span>
        <div className="row" style={{ marginTop: 4 }}>
          {SLOTS.map((slot) => (
            <label key={slot} className="row" style={{ gap: 4, fontWeight: 400 }}>
              <input type="checkbox" checked={meal.time_slots.includes(slot)}
                onChange={() => set({ time_slots: toggleIn(meal.time_slots, slot) })} />
              {SLOT_LABELS[slot].split('·')[0].trim()}
            </label>
          ))}
        </div>
        {meal.time_slots.includes('mid') && meal.prep_effort !== 'no-cook' && (
          <p className="muted" style={{ marginTop: 4 }}>Heads up: mid-shift slots only accept no-cook meals in the generator.</p>
        )}
      </div>

      <div className="field">
        <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>Nutrition tags</span>
        <div className="row" style={{ marginTop: 4 }}>
          {NUTRITION_TAGS.map((tag) => (
            <label key={tag} className="row" style={{ gap: 4, fontWeight: 400 }}>
              <input type="checkbox" checked={meal.nutrition_tags.includes(tag)}
                onChange={() => set({ nutrition_tags: toggleIn(meal.nutrition_tags, tag) })} />
              {tag}
            </label>
          ))}
          <label className="row" style={{ gap: 4, fontWeight: 400 }}>
            <input type="checkbox" checked={meal.plant_based} onChange={(e) => set({ plant_based: e.target.checked })} />
            🌱 plant-based
          </label>
        </div>
      </div>

      <label className="field">
        Cooking instructions / steps
        <textarea rows={5} value={meal.instructions} onChange={(e) => set({ instructions: e.target.value })}
          placeholder={'1. ...\n2. ...'} />
      </label>

      <div className="row">
        <button className="btn" disabled={!valid}
          onClick={() => onSave({ ...meal, cost: Number(meal.cost) || 0, ingredients: meal.ingredients.filter((i) => i.name.trim()) })}>
          Save meal
        </button>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
      </div>
    </Modal>
  );
}
