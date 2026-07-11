import { useState } from 'react';
import MealForm from './MealForm.jsx';
import RecipeSearch from './RecipeSearch.jsx';
import Badge from '../shared/Badge.jsx';
import { db } from '../../lib/supabase.js';

export default function MealLibrary({ meals }) {
  const [editing, setEditing] = useState(null); // null | {} for new | meal row
  const [filter, setFilter] = useState('');

  const shown = meals.filter((m) => m.name.toLowerCase().includes(filter.toLowerCase()));

  const saveMeal = async (meal) => {
    await db.upsert('meals', meal);
    setEditing(null);
  };

  // A picked search result pre-fills the form; user confirms cost/slots/tags.
  const fromSearchResult = (r) => {
    setEditing({
      name: r.title,
      ingredients: r.ingredients?.length ? r.ingredients : [{ name: '', qty: 1, unit: '', section: 'Produce' }],
      instructions: r.instructions || `Recipe source: ${r.url}`,
      cost: 0,
      prep_effort: 'one-pan',
      time_slots: ['pre'],
      nutrition_tags: [],
      plant_based: false,
    });
  };

  return (
    <>
      <RecipeSearch onPickResult={fromSearchResult} />

      <div className="card">
        <div className="row-between" style={{ marginBottom: 10 }}>
          <span className="card-title" style={{ marginBottom: 0 }}>Meal library ({meals.length})</span>
          <button className="btn" onClick={() => setEditing({})}>+ Add meal</button>
        </div>
        <input type="search" placeholder="Filter meals…" value={filter} onChange={(e) => setFilter(e.target.value)} />

        {shown.map((m) => (
          <div key={m.id} className="row-between" style={{ padding: '10px 0', borderBottom: '1px dashed var(--color-border)' }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600 }}>{m.plant_based ? '🌱 ' : ''}{m.name}</div>
              <div className="row" style={{ marginTop: 4 }}>
                <Badge>₱{Number(m.cost || 0)}</Badge>
                <Badge>{m.prep_effort}</Badge>
                <Badge>{(m.time_slots || []).join(' + ')}</Badge>
                {(m.nutrition_tags || []).map((t) => <Badge key={t} kind="ok">{t}</Badge>)}
              </div>
            </div>
            <div className="row" style={{ flexShrink: 0 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditing(m)}>Edit</button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => window.confirm(`Delete "${m.name}" from the library?`) && db.remove('meals', m.id)}
              >
                🗑
              </button>
            </div>
          </div>
        ))}
        {shown.length === 0 && <p className="muted" style={{ marginTop: 10 }}>Nothing matches.</p>}
      </div>

      {editing !== null && (
        <MealForm initial={editing.id ? editing : editing.name ? editing : null} onSave={saveMeal} onClose={() => setEditing(null)} />
      )}
    </>
  );
}
