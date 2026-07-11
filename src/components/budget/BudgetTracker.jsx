import { useState } from 'react';
import ProgressBar from '../shared/ProgressBar.jsx';
import { planCost } from '../../lib/mealGenerator.js';

// Suggest a ceiling from historical spend (average of past weeks +10%
// headroom, rounded to 50). Never applied without explicit confirmation.
export function suggestCeiling(pastPlans, mealsById) {
  const spends = pastPlans
    .map((p) => planCost(p, mealsById))
    .filter((s) => s > 0)
    .slice(0, 8);
  if (spends.length < 2) return null;
  const avg = spends.reduce((a, b) => a + b, 0) / spends.length;
  return Math.round((avg * 1.1) / 50) * 50;
}

export default function BudgetTracker({ plan, mealsById, settings, onSaveSettings, pastPlans = [] }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(settings.budget_ceiling);

  const ceiling = Number(settings.budget_ceiling || 0);
  const spent = plan ? planCost(plan, mealsById) : 0;
  const over = spent > ceiling;
  const suggestion = suggestCeiling(pastPlans, mealsById);

  return (
    <div className="card">
      <div className="row-between">
        <span className="card-title">Budget this week</span>
        {!editing && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setDraft(ceiling); setEditing(true); }}>
            Set ceiling
          </button>
        )}
      </div>

      {editing ? (
        <div className="row" style={{ marginBottom: 8 }}>
          <input
            type="number"
            min="0"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            style={{ maxWidth: 140 }}
            aria-label="Weekly budget ceiling"
          />
          <button
            className="btn btn-sm"
            onClick={() => { onSaveSettings({ budget_ceiling: Number(draft) || 0 }); setEditing(false); }}
          >
            Save
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancel</button>
        </div>
      ) : (
        <p style={{ marginBottom: 8 }}>
          <strong style={{ color: over ? 'var(--color-warn)' : 'inherit' }}>₱{spent.toFixed(0)}</strong>
          <span className="muted"> of ₱{ceiling.toFixed(0)} ceiling</span>
          {over && <span className="badge badge-low" style={{ marginLeft: 8 }}>Over budget</span>}
        </p>
      )}

      <ProgressBar value={spent} max={ceiling} over={over} />

      {suggestion !== null && suggestion !== ceiling && (
        <p className="muted" style={{ marginTop: 8 }}>
          Based on your recent weeks, ₱{suggestion} might fit your actual spending.{' '}
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => onSaveSettings({ budget_ceiling: suggestion })}
          >
            Use ₱{suggestion}
          </button>
        </p>
      )}
    </div>
  );
}
