import { useState } from 'react';

// The "why I don't eat meat" reminder: the user's own words, quietly on the
// dashboard, editable any time. No nagging — just an anchor.
export default function MantraCard({ settings, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(settings.mantra || '');

  if (editing) {
    return (
      <div className="card mantra-card">
        <textarea rows={3} value={draft} onChange={(e) => setDraft(e.target.value)}
          placeholder="In your own words — why this path matters to you." autoFocus />
        <div className="row" style={{ marginTop: 8 }}>
          <button className="btn btn-sm" onClick={() => { onSave({ mantra: draft.trim() }); setEditing(false); }}>Save</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="card mantra-card" onClick={() => { setDraft(settings.mantra || ''); setEditing(true); }}
      style={{ cursor: 'pointer' }} title="Tap to edit your why">
      <p>“{settings.mantra}”</p>
      <p className="muted" style={{ marginTop: 6, fontStyle: 'normal' }}>your why · tap to edit</p>
    </div>
  );
}
