import { useCallback, useEffect, useMemo, useState } from 'react';
import { db, isRemote } from '../lib/supabase.js';
import { cookingRecipes } from '../lib/cookingRecipes.js';
import './cookingBuddy.css';

const INITIAL = { id:'active', recipe_id:'chicken-adobo', step_index:0, servings:4, checked_ingredients:[], completed_steps:[], is_running:false, timer_end_at:null, remaining_seconds:0 };

function formatTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds || 0));
  return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
}
function scaled(qty, servings) {
  const value = qty * servings / 4;
  return Number.isInteger(value) ? String(value) : String(Math.round(value*100)/100);
}

export default function CookingBuddyPage() {
  const [session, setSession] = useState(INITIAL);
  const [now, setNow] = useState(Date.now());
  const [loaded, setLoaded] = useState(false);
  const [wakeSupported, setWakeSupported] = useState(false);
  const recipe = useMemo(() => cookingRecipes.find(r => r.id === session.recipe_id) || cookingRecipes[0], [session.recipe_id]);
  const step = recipe.steps[Math.min(session.step_index, recipe.steps.length - 1)];
  const remaining = session.is_running && session.timer_end_at
    ? Math.max(0, Math.ceil((Date.parse(session.timer_end_at) - now) / 1000))
    : session.remaining_seconds;

  const persist = useCallback((patch) => {
    setSession(prev => {
      const next = { ...prev, ...patch, updated_at: new Date().toISOString() };
      db.upsert('cooking_sessions', next);
      return next;
    });
  }, []);

  useEffect(() => {
    let alive = true;
    db.list('cooking_sessions').then(rows => {
      if (!alive) return;
      const active = rows.find(r => r.id === 'active');
      if (active) setSession({ ...INITIAL, ...active });
      setLoaded(true);
    });
    const unsubscribe = db.subscribe('cooking_sessions', async () => {
      const rows = await db.list('cooking_sessions');
      const active = rows.find(r => r.id === 'active');
      if (alive && active) setSession(prev => ({ ...prev, ...active }));
    });
    return () => { alive = false; unsubscribe(); };
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!session.is_running || !session.timer_end_at || remaining > 0) return;
    persist({ is_running:false, timer_end_at:null, remaining_seconds:0 });
    if ('vibrate' in navigator) navigator.vibrate([250,120,250]);
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Midnight Munch', { body: `${step[0]} timer is done.` });
    }
  }, [remaining, session.is_running, session.timer_end_at, persist, step]);

  useEffect(() => {
    let lock;
    if (session.is_running && 'wakeLock' in navigator) {
      navigator.wakeLock.request('screen').then(value => { lock = value; setWakeSupported(true); }).catch(() => {});
    }
    return () => { lock?.release?.(); };
  }, [session.is_running]);

  const chooseRecipe = (id) => {
    const next = cookingRecipes.find(r => r.id === id);
    persist({ recipe_id:id, step_index:0, servings:4, checked_ingredients:[], completed_steps:[], is_running:false, timer_end_at:null, remaining_seconds:next?.steps[0]?.[2] || 0 });
  };
  const startTimer = () => {
    const seconds = remaining > 0 ? remaining : (step[2] || 0);
    if (!seconds) return;
    persist({ is_running:true, remaining_seconds:seconds, timer_end_at:new Date(Date.now()+seconds*1000).toISOString() });
  };
  const pauseTimer = () => persist({ is_running:false, remaining_seconds:remaining, timer_end_at:null });
  const resetTimer = () => persist({ is_running:false, remaining_seconds:step[2] || 0, timer_end_at:null });
  const changeStep = (index) => {
    const nextIndex = Math.max(0, Math.min(recipe.steps.length-1,index));
    persist({ step_index:nextIndex, is_running:false, timer_end_at:null, remaining_seconds:recipe.steps[nextIndex][2] || 0, completed_steps:nextIndex > session.step_index ? [...new Set([...(session.completed_steps||[]),session.step_index])] : session.completed_steps||[] });
  };
  const toggleIngredient = (index) => {
    const checked = session.checked_ingredients || [];
    persist({ checked_ingredients:checked.includes(index) ? checked.filter(x=>x!==index) : [...checked,index] });
  };
  const adjustServings = (delta) => persist({ servings:Math.max(1,Math.min(10,session.servings+delta)) });

  const progress = ((session.completed_steps?.length || 0) + (session.step_index === recipe.steps.length-1 ? 1 : 0)) / recipe.steps.length * 100;
  const copyLink = () => navigator.clipboard?.writeText(window.location.href);

  if (!loaded) return <p className="muted">Loading cooking session…</p>;

  return (
    <section className="cook-page">
      <header className="cook-heading">
        <div><span className="cook-eyebrow">YOUR STEP-BY-STEP KITCHEN HELPER</span><h1>Cooking Buddy <span>🥘</span></h1><p>One step at a time. I'll keep an eye on the timer.</p></div>
        <button className="btn btn-ghost cook-share" onClick={copyLink}>↗ Share with Ronin</button>
      </header>

      {!isRemote && <div className="cook-demo-note">Demo mode: cooking progress is saved on this device only. Shared live progress needs the household sync connection.</div>}

      <div className="cook-layout">
        <aside className="card cook-recipe-picker">
          <div className="card-title">What are we cooking?</div>
          <select value={recipe.id} onChange={e=>chooseRecipe(e.target.value)}>
            {cookingRecipes.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          <div className="cook-meta"><span>⏱ About {recipe.time} min</span><span>🍽 {session.servings} servings</span></div>
          <div className="cook-serving-control"><span>Adjust servings</span><div><button className="btn btn-ghost btn-sm" onClick={()=>adjustServings(-1)} disabled={session.servings<=1}>−</button><strong>{session.servings}</strong><button className="btn btn-ghost btn-sm" onClick={()=>adjustServings(1)} disabled={session.servings>=10}>+</button></div></div>
          <div className="cook-section-title">Ingredients <span>{session.checked_ingredients?.length || 0}/{recipe.ingredients.length}</span></div>
          <div className="cook-ingredients">
            {recipe.ingredients.map(([name,qty,unit],i)=><label key={name+i} className={session.checked_ingredients?.includes(i)?'cook-ingredient checked':'cook-ingredient'}>
              <input type="checkbox" checked={!!session.checked_ingredients?.includes(i)} onChange={()=>toggleIngredient(i)} />
              <span>{name}</span><small>{scaled(qty,session.servings)} {unit}</small>
            </label>)}
          </div>
          <p className="cook-hint">Tick ingredients as you prepare them. Changes sync to the shared cooking session when cloud sync is connected.</p>
        </aside>

        <main className="cook-main">
          <div className="card cook-step-card">
            <div className="row-between"><span className="badge badge-neutral">{recipe.type} · STEP {session.step_index+1} OF {recipe.steps.length}</span><span className="muted">~{Math.round(recipe.time)} min total</span></div>
            <div className="cook-progress"><div style={{width:`${progress}%`}} /></div>
            <h2>{step[0]}</h2><p className="cook-instruction">{step[1]}</p>
            {step[2] > 0 ? <div className="cook-timer">
              <div className={remaining===0?'cook-clock done':'cook-clock'}><span>{formatTime(remaining)}</span><small>{session.is_running?'COUNTING DOWN':remaining===0?'TIMER COMPLETE':'MIN : SEC'}</small></div>
              <div className="cook-timer-actions">
                {!session.is_running ? <button className="btn" onClick={startTimer}>▶ Start timer</button> : <button className="btn" onClick={pauseTimer}>Ⅱ Pause</button>}
                <button className="btn btn-ghost" onClick={resetTimer}>↺ Reset</button>
                <button className="btn btn-ghost" onClick={()=>persist({remaining_seconds:remaining+60,is_running:false,timer_end_at:null})}>+1 min</button>
              </div>
            </div> : <div className="cook-no-timer">No timer needed for this step. Take your time.</div>}
            <div className="cook-step-nav">
              <button className="btn btn-ghost" onClick={()=>changeStep(session.step_index-1)} disabled={session.step_index===0}>← Previous</button>
              {session.step_index < recipe.steps.length-1
                ? <button className="btn" onClick={()=>changeStep(session.step_index+1)}>Done · Next step →</button>
                : <button className="btn" onClick={()=>{changeStep(0);persist({completed_steps:[],checked_ingredients:[],is_running:false,timer_end_at:null,remaining_seconds:0});}}>✓ Finish recipe</button>}
            </div>
          </div>
          <div className="cook-step-list card">
            <div className="card-title">Cooking steps</div>
            {recipe.steps.map((s,i)=><button key={i} className={i===session.step_index?'cook-step-row active':(session.completed_steps||[]).includes(i)?'cook-step-row completed':'cook-step-row'} onClick={()=>changeStep(i)}>
              <span className="cook-step-number">{(session.completed_steps||[]).includes(i)?'✓':i+1}</span><span>{s[0]}</span><small>{s[2]?formatTime(s[2]):'No timer'}</small>
            </button>)}
          </div>
        </main>
      </div>
    </section>
  );
}
