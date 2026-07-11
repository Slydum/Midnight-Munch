// Data layer for Midnight Munch.
//
// Primary mode: Supabase (set VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY).
// Both users hit the same shared-link deployment; realtime subscriptions
// push each other's edits live. No accounts — the anon key + open RLS
// policies on this app's tables act as the "shared link" access model.
//
// Fallback mode: if Supabase env vars are missing, a local adapter backed by
// localStorage + BroadcastChannel keeps the whole app functional on one
// device (demo mode) so the app never hard-fails. The UI flags this.
//
// Offline: writes that fail while offline are queued in localStorage and
// flushed when connectivity returns (critical for grocery check-offs at the
// wet market).

import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = url && anonKey ? createClient(url, anonKey) : null;
export const isRemote = Boolean(supabase);

const TABLES = ['meals', 'week_plans', 'leftovers', 'saved_weeks', 'settings'];
const PENDING_KEY = 'mm-pending-ops';

function uid() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/* ------------------------------------------------------------------ */
/* Local adapter (demo mode + offline cache)                           */
/* ------------------------------------------------------------------ */

const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('mm-sync') : null;
const listeners = new Map(); // table -> Set<fn>

function localKey(table) {
  return `mm-table-${table}`;
}

function localRead(table) {
  try {
    return JSON.parse(localStorage.getItem(localKey(table)) || '[]');
  } catch {
    return [];
  }
}

function localWrite(table, rows) {
  localStorage.setItem(localKey(table), JSON.stringify(rows));
  notify(table);
  channel?.postMessage({ table });
}

function notify(table) {
  listeners.get(table)?.forEach((fn) => fn());
}

channel?.addEventListener('message', (e) => notify(e.data.table));

/* ------------------------------------------------------------------ */
/* Offline write queue (remote mode)                                   */
/* ------------------------------------------------------------------ */

function readQueue() {
  try {
    return JSON.parse(localStorage.getItem(PENDING_KEY) || '[]');
  } catch {
    return [];
  }
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
      if (op.kind === 'upsert') await supabase.from(op.table).upsert(op.row);
      else if (op.kind === 'delete') await supabase.from(op.table).delete().eq('id', op.id);
    } catch {
      pushQueue(op); // still failing — keep it queued
    }
  }
  TABLES.forEach(notify);
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => flushQueue());
}

/* ------------------------------------------------------------------ */
/* Unified db API                                                      */
/* ------------------------------------------------------------------ */

// In remote mode we also mirror reads into localStorage so the grocery list
// still renders with data while offline.
function cacheRows(table, rows) {
  localStorage.setItem(localKey(table), JSON.stringify(rows));
}

export const db = {
  isRemote,

  async list(table) {
    if (!supabase) return localRead(table);
    try {
      const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: true });
      if (error) throw error;
      cacheRows(table, data);
      return data;
    } catch {
      return localRead(table); // offline: serve cached copy
    }
  },

  async upsert(table, row) {
    const full = { ...row, id: row.id || uid() };
    // Optimistic local write so the UI (and offline use) is instant.
    const rows = localRead(table);
    const idx = rows.findIndex((r) => r.id === full.id);
    const merged = idx >= 0 ? { ...rows[idx], ...full } : { created_at: new Date().toISOString(), ...full };
    if (idx >= 0) rows[idx] = merged;
    else rows.push(merged);
    localWrite(table, rows);

    if (supabase) {
      try {
        const { error } = await supabase.from(table).upsert(merged);
        if (error) throw error;
      } catch {
        pushQueue({ kind: 'upsert', table, row: merged });
      }
    }
    return merged;
  },

  async remove(table, id) {
    localWrite(table, localRead(table).filter((r) => r.id !== id));
    if (supabase) {
      try {
        const { error } = await supabase.from(table).delete().eq('id', id);
        if (error) throw error;
      } catch {
        pushQueue({ kind: 'delete', table, id });
      }
    }
  },

  // Subscribe to changes on a table (both realtime remote changes and
  // local/optimistic ones). Returns an unsubscribe function.
  subscribe(table, fn) {
    if (!listeners.has(table)) listeners.set(table, new Set());
    listeners.get(table).add(fn);

    let sub = null;
    if (supabase) {
      sub = supabase
        .channel(`mm-${table}-${uid()}`)
        .on('postgres_changes', { event: '*', schema: 'public', table }, () => fn())
        .subscribe();
    }
    return () => {
      listeners.get(table)?.delete(fn);
      if (sub) supabase.removeChannel(sub);
    };
  },
};
