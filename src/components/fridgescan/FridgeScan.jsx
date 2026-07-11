import { useState } from 'react';
import { detectIngredients, recognitionAvailable, matchMealsToIngredients } from '../../lib/imageRecognition.js';
import Badge from '../shared/Badge.jsx';

// Photo -> detected ingredients -> user confirms/edits -> "what can I make".
// Detection is explicitly framed as unreliable; the confirm step is mandatory.
export default function FridgeScan({ meals }) {
  const [preview, setPreview] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const [detected, setDetected] = useState([]); // [{name, confidence, kept}]
  const [confirmed, setConfirmed] = useState(null); // [names] once confirmed
  const [manualEntry, setManualEntry] = useState('');

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setConfirmed(null);
    setError(null);
    setDetected([]);
    if (!recognitionAvailable) {
      setError('Image recognition is not configured (VITE_CLARIFAI_PAT missing) — add what you see manually below.');
      return;
    }
    setScanning(true);
    try {
      const found = await detectIngredients(file);
      setDetected(found.map((f) => ({ ...f, kept: true })));
      if (!found.length) setError('Nothing recognized with confidence — add items manually below.');
    } catch (err) {
      setError(err.message);
    } finally {
      setScanning(false);
    }
  };

  const addManual = () => {
    const name = manualEntry.trim();
    if (!name) return;
    setDetected((d) => [...d, { name, confidence: 1, kept: true, manual: true }]);
    setManualEntry('');
  };

  const kept = detected.filter((d) => d.kept);
  const matches = confirmed ? matchMealsToIngredients(meals, confirmed) : [];

  return (
    <>
      <div className="card">
        <div className="card-title">Scan your fridge</div>
        <p className="muted" style={{ marginBottom: 10 }}>
          Snap or upload a photo. Detection isn't 100% reliable — items hide behind each other and
          quantities are a guess — so you always confirm the list before it's used.
        </p>
        <input type="file" accept="image/*" capture="environment" onChange={onFile} />
        {preview && (
          <img src={preview} alt="Fridge" style={{ maxWidth: '100%', borderRadius: 10, marginTop: 10, maxHeight: 280, objectFit: 'contain' }} />
        )}
        {scanning && <p style={{ marginTop: 10 }}>🔎 Scanning photo…</p>}
        {error && <p style={{ color: 'var(--color-warn)', marginTop: 10 }}>{error}</p>}
      </div>

      {(detected.length > 0 || preview) && !confirmed && (
        <div className="card">
          <div className="card-title">
            {detected.length > 0 && <span className="tick-pop" style={{ marginRight: 6 }}>✔</span>}
            Confirm what's actually there
          </div>
          {detected.map((d, i) => (
            <label key={i} className={`grocery-item${d.kept ? '' : ' checked'}`}>
              <input type="checkbox" checked={d.kept}
                onChange={() => setDetected((arr) => arr.map((x, idx) => (idx === i ? { ...x, kept: !x.kept } : x)))} />
              <span className="g-name" style={{ flex: 1 }}>{d.name}</span>
              <span className="muted">{d.manual ? 'added by you' : `${Math.round(d.confidence * 100)}% sure`}</span>
            </label>
          ))}
          <div className="row" style={{ marginTop: 10 }}>
            <input type="text" placeholder="Add something the scan missed…" value={manualEntry}
              onChange={(e) => setManualEntry(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addManual()}
              style={{ flex: 1, minWidth: 160 }} />
            <button className="btn btn-ghost" onClick={addManual}>Add</button>
          </div>
          <button className="btn btn-cta" style={{ marginTop: 12 }} disabled={kept.length === 0}
            onClick={() => setConfirmed(kept.map((d) => d.name))}>
            ✓ Confirm {kept.length} item{kept.length === 1 ? '' : 's'} — what can we make?
          </button>
        </div>
      )}

      {confirmed && (
        <div className="card">
          <div className="row-between">
            <span className="card-title">Meals you can make with what you have</span>
            <button className="btn btn-ghost btn-sm" onClick={() => setConfirmed(null)}>Edit list</button>
          </div>
          <div className="row" style={{ marginBottom: 10 }}>
            {confirmed.map((n) => <Badge key={n}>{n}</Badge>)}
          </div>
          {matches.length === 0 && (
            <p className="muted">No library meals match these ingredients yet — try the recipe search on the Library page.</p>
          )}
          {matches.map(({ meal, matched, missing, score }) => (
            <div key={meal.id} style={{ padding: '10px 0', borderBottom: '1px dashed var(--color-border)' }}>
              <div className="row-between">
                <span style={{ fontWeight: 600 }}>{meal.plant_based ? '🌱 ' : ''}{meal.name}</span>
                <Badge kind={score >= 0.7 ? 'ok' : 'neutral'}>{Math.round(score * 100)}% covered</Badge>
              </div>
              <p className="muted" style={{ marginTop: 4 }}>
                Have: {matched.join(', ')}
                {missing.length > 0 && <> · Still need: {missing.join(', ')}</>}
              </p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
