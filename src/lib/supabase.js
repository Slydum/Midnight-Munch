// Data layer for Midnight Munch.
// Supabase provides shared household data and live sync. Without credentials,
// the app falls back to localStorage + BroadcastChannel demo mode.
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = url && anonKey ? createClient(url, anonKey) : null;
export const isRemote = Boolean(supabase);

const TABLES = ['meals', 'week_plans', 'leftovers', 'saved_weeks', 'settings', 'cooking_sessions'];
const PENDING_KEY = 'mm-pending-ops';

function uid() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('mm-sync') : null;
const listeners = new Map();

function localKey(table) { return `mm-table-${table}`; }
function localRead(table) {
  try { return JSON.parse(localStorage.getItem(localKey(table)) || '[]'); } catch { return []; }
}
function localWrite(table, rows) {
  localStorage.setItem(localKey(table), JSON.stringify(rows));
  notify(table);
  channel?.postMessage({ table });
}
function notify(table) { listeners.get(table)?.forEach((fn) => fn()); }
channel?.addEventListener('message', (e) => notify(e.data.table));

function readQueue() {
  try { return JSON.parse(localStorage.getItem(PENDING_KEY) || '[]'); } catch { return []; }
}
function pushQueue(op) {
  const q = readQueue();
  q.push(op);
  localStorage.setItem(PENDING_KEY, JSON.stringify(q));
}

export async function flushQueue() {
  if (!supabase) return;
  const q = readQueue();
  if (!q.length) return;
  localStorage.setItem(PENDING_KEY, '[]');
  for (const op of q) {
    try {
      const result = op.kind === 'upsert'
        ? await supabase.from(op.table).upsert(op.row)
        : await supabase.from(op.table).delete().eq('id', op.id);
      if (result.error) throw result.error;
    } catch { pushQueue(op); }
  }
  TABLES.forEach(notify);
}
if (typeof window !== 'undefined') window.addEventListener('online', () => flushQueue());

function cacheRows(table, rows) { localStorage.setItem(localKey(table), JSON.stringify(rows)); }

export const db = {
  isRemote,
  async list(table) {
    if (!supabase) return localRead(table);
    try {
      const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: true });
      if (error) throw error;
      cacheRows(table, data);
      return data;
    } catch { return localRead(table); }
  },
  async upsert(table, row) {
    const full = { ...row, id: row.id || uid() };
    const rows = localRead(table);
    const idx = rows.findIndex((r) => r.id === full.id);
    const merged = idx >= 0 ? { ...rows[idx], ...full } : { created_at: new Date().toISOString(), ...full };
    if (idx >= 0) rows[idx] = merged; else rows.push(merged);
    localWrite(table, rows);
    if (supabase) {
      try {
        const { error } = await supabase.from(table).upsert(merged);
        if (error) throw error;
      } catch { pushQueue({ kind: 'upsert', table, row: merged }); }
    }
    return merged;
  },
  async remove(table, id) {
    localWrite(table, localRead(table).filter((r) => r.id !== id));
    if (supabase) {
      try {
        const { error } = await supabase.from(table).delete().eq('id', id);
        if (error) throw error;
      } catch { pushQueue({ kind: 'delete', table, id }); }
    }
  },
  subscribe(table, fn) {
    if (!listeners.has(table)) listeners.set(table, new Set());
    listeners.get(table).add(fn);
    let sub = null;
    if (supabase) {
      sub = supabase.channel(`mm-${table}-${uid()}`)
        .on('postgres_changes', { event: '*', schema: 'public', table }, () => fn())
        .subscribe();
    }
    return () => {
      listeners.get(table)?.delete(fn);
      if (sub) supabase.removeChannel(sub);
    };
  },
};
