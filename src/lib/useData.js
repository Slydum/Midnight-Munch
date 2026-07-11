// React hooks over the data layer: live table reads that re-render when
// either user changes something (realtime in remote mode, BroadcastChannel
// locally).

import { useEffect, useState, useMemo, useCallback } from 'react';
import { db } from './supabase.js';
import { seedMeals } from './seedMeals.js';
import { weekStartOf, isoDate } from './mealGenerator.js';

export function useTable(table) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    db.list(table).then((r) => {
      setRows(r);
      setLoading(false);
    });
  }, [table]);

  useEffect(() => {
    refresh();
    const unsub = db.subscribe(table, refresh);
    return unsub;
  }, [table, refresh]);

  return { rows, loading, refresh };
}

export const DEFAULT_SETTINGS = {
  id: 'main',
  budget_ceiling: 1500,
  cooldown_days: 10,
  mantra: 'Write your own “why” here — tap to edit.',
};

export function useSettings() {
  const { rows, loading } = useTable('settings');
  const settings = useMemo(
    () => ({ ...DEFAULT_SETTINGS, ...(rows.find((r) => r.id === 'main') || {}) }),
    [rows]
  );
  const save = useCallback((patch) => db.upsert('settings', { ...settings, ...patch }), [settings]);
  return { settings, save, loading };
}

export function useMeals() {
  const { rows, loading, refresh } = useTable('meals');
  // First-run seed so the library isn't empty.
  useEffect(() => {
    if (!loading && rows.length === 0 && !localStorage.getItem('mm-seeded')) {
      localStorage.setItem('mm-seeded', '1');
      Promise.all(seedMeals.map((m) => db.upsert('meals', m))).then(refresh);
    }
  }, [loading, rows.length, refresh]);

  const mealsById = useMemo(() => Object.fromEntries(rows.map((m) => [m.id, m])), [rows]);
  return { meals: rows, mealsById, loading, refresh };
}

export function currentWeekStartIso() {
  return isoDate(weekStartOf(new Date()));
}

export function usePlans() {
  const { rows, loading } = useTable('week_plans');
  const weekStart = currentWeekStartIso();
  const currentPlan = rows.find((p) => p.week_start === weekStart) || null;
  const pastPlans = rows.filter((p) => p.week_start < weekStart).sort((a, b) => b.week_start.localeCompare(a.week_start));
  const savePlan = useCallback((plan) => db.upsert('week_plans', plan), []);
  return { plans: rows, currentPlan, pastPlans, savePlan, loading, weekStart };
}

export function useLeftovers() {
  const { rows, loading } = useTable('leftovers');
  const active = rows.filter((l) => l.servings_left > 0);
  return {
    leftovers: active,
    allLeftovers: rows,
    loading,
    save: (l) => db.upsert('leftovers', l),
    remove: (id) => db.remove('leftovers', id),
  };
}

export function useSavedWeeks() {
  const { rows, loading } = useTable('saved_weeks');
  return {
    savedWeeks: rows,
    loading,
    save: (w) => db.upsert('saved_weeks', w),
    remove: (id) => db.remove('saved_weeks', id),
  };
}

export function useOnline() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => {
      window.removeEventListener('online', up);
      window.removeEventListener('offline', down);
    };
  }, []);
  return online;
}
