// Local-first data layer. Keep the existing mm-table-* keys to preserve user data.
const TABLES = ['meals','week_plans','leftovers','saved_weeks','settings','cooking_sessions','fridge_items'];
const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('mm-local-data') : null;
const listeners = new Map();
const key = (table) => `mm-table-${table}`;
function read(table) { try { const value=JSON.parse(localStorage.getItem(key(table))||'[]'); return Array.isArray(value)?value:[]; } catch { return []; } }
function notify(table) { listeners.get(table)?.forEach(fn=>fn()); channel?.postMessage({table}); }
channel?.addEventListener('message',e=>listeners.get(e.data?.table)?.forEach(fn=>fn()));
function uid(){ return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`; }
export const isRemote = false;
export const db = {
 isRemote:false,
 async list(table){ return read(table); },
 async upsert(table,row){
  const rows=read(table), full={...row,id:row.id||uid()}, i=rows.findIndex(r=>r.id===full.id);
  const merged=i>=0?{...rows[i],...full}:{created_at:new Date().toISOString(),...full};
  if(i>=0) rows[i]=merged; else rows.push(merged);
  localStorage.setItem(key(table),JSON.stringify(rows)); notify(table); return merged;
 },
 async remove(table,id){ localStorage.setItem(key(table),JSON.stringify(read(table).filter(r=>r.id!==id))); notify(table); },
 subscribe(table,fn){ if(!listeners.has(table)) listeners.set(table,new Set()); listeners.get(table).add(fn); return ()=>listeners.get(table)?.delete(fn); },
 exportAll(){ return {app:'Midnight Munch',formatVersion:1,exportedAt:new Date().toISOString(),tables:Object.fromEntries(TABLES.map(t=>[t,read(t)]))}; },
 importAll(backup){
  if(!backup||backup.app!=='Midnight Munch'||backup.formatVersion!==1||!backup.tables||typeof backup.tables!=='object') throw new Error('This is not a supported Midnight Munch backup.');
  for(const t of TABLES) if(backup.tables[t]!==undefined&&!Array.isArray(backup.tables[t])) throw new Error(`The backup contains invalid ${t} data.`);
  for(const t of TABLES) if(Array.isArray(backup.tables[t])) { localStorage.setItem(key(t),JSON.stringify(backup.tables[t])); notify(t); }
  localStorage.setItem('mm-seeded','1'); return true;
 }
};
