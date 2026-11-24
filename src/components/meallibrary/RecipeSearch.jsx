import { useState } from 'react';
import { searchRecipes, searchProvider } from '../../lib/googleSearch.js';

export default function RecipeSearch({ onPickResult }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const run = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setBusy(true); setError(null);
    try { setResults(await searchRecipes(query)); }
    catch (err) { setError(err.message); setResults(null); }
    finally { setBusy(false); }
  };

  return (
    <div className="card">
      <div className="card-title">Find a recipe online</div>
      <form className="row" onSubmit={run}>
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder='e.g. "kangkong recipe", "tofu adobo"' style={{ flex:  1, minWidth: 180 }} />
        <button className="btn" disabled={busy}>{busy ? 'Searching…' : 'Search'}</button>
      </form>
      <p className="muted" style={{ marginTop: 6 }}>
        Live web results via Tavily. Recipe details are imported when the original page exposes structured recipe data.
      </p>
      {error && <p style={{ color: 'var(--color-warn)', marginTop: 8 }}>{error}</p>}
      {results?.length === 0 && <p className="muted" style={{ marginTop: 8 }}>No results — try a simpler term.</p>}
      {results?.map((r, i) => (
        <div key={r.url || i} className="row-between" style={{ padding: '10px 0', borderBottom: '1px dashed var(--color-border)' }}>
          <div className="row" style={{ flex: 1, minWidth: 0 }}>
            {r.thumbnail && <img src={r.thumbnail} alt="" width="48" height="48" style={{ borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.title}</div>
              <a href={r.url} target="_blank" rel="noreferrer" className="muted">{r.source}</a>
              <div className="muted">{r.extracted ? 'Ingredients and steps found' : 'Source link and excerpt only'}</div>
            </div>
          </div>
          <button className="btn btn-sm" onClick={() => onPickResult(r)}>Save to library</button>
        </div>
      ))}
    </div>
  );
}
