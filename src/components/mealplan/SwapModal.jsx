import Modal from '../shared/Modal.jsx';
import { suggestSwaps, SLOT_LABELS } from '../../lib/mealGenerator.js';

export default function SwapModal({ meals, plan, date, slot, onPick, onClose }) {
  const suggestions = suggestSwaps({ meals, plan, date, slot, count: 6 });

  return (
    <Modal title={`Swap · ${date} · ${SLOT_LABELS[slot]}`} onClose={onClose}>
      {suggestions.length === 0 && (
        <p className="muted">No other meals fit this slot. Add more to the library (mid-shift needs no-cook meals).</p>
      )}
      {suggestions.map((m) => (
        <div key={m.id} className="row-between" style={{ padding: '8px 0', borderBottom: '1px dashed var(--color-border)' }}>
          <div>
            <div style={{ fontWeight: 600 }}>{m.plant_based ? '🌱 ' : ''}{m.name}</div>
            <div className="muted">₱{Number(m.cost || 0)} · {m.prep_effort} · {(m.nutrition_tags || []).join(', ') || 'no tags'}</div>
          </div>
          <button className="btn btn-sm" onClick={() => onPick(m.id)}>Use this</button>
        </div>
      ))}
    </Modal>
  );
}
