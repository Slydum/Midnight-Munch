import {useEffect,useMemo,useState} from 'react';
import WeekPlan from '../components/mealplan/WeekPlan.jsx';
import BudgetTracker from '../components/budget/BudgetTracker.jsx';
import NutritionFlags from '../components/nutrition/NutritionFlags.jsx';
import {useMeals,usePlans,useSettings,useLeftovers,useSavedWeeks} from '../lib/useData.js';
import {db} from '../lib/supabase.js';
import {requestAiMealPlan,toMealRecord,findMealImage} from '../lib/aiMealPlanner.js';
import {weekDates} from '../lib/mealGenerator.js';

export default function PlanPage(){
 const {meals,mealsById,loading,refresh}=useMeals();
 const {currentPlan,pastPlans,savePlan,weekStart}=usePlans();
 const {settings,save:saveSettings}=useSettings();
 const {leftovers,save:saveLeftover}=useLeftovers();
 const {savedWeeks,save:saveWeekTemplate}=useSavedWeeks();
 const draftKey='mm-plan-draft:'+weekStart;
 const [draft,setDraft]=useState(()=>{try{return JSON.parse(localStorage.getItem(draftKey)||'null')}catch{return null}});
 const [generating,setGenerating]=useState(false),[busyDay,setBusyDay]=useState(null),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const activePlan=draft||currentPlan;
 const selectedDays=settings.planning_days||['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
 const mealTypes=settings.meal_types?.length?settings.meal_types:['Breakfast','Lunch','Dinner'];
 const dates=useMemo(()=>weekDates(weekStart).filter(date=>selectedDays.includes(['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][(new Date(date+'T00:00:00').getDay()+6)%7])),[weekStart,selectedDays.join('|')]);
 useEffect(()=>{if(draft)localStorage.setItem(draftKey,JSON.stringify(draft));else localStorage.removeItem(draftKey)},[draft,draftKey]);
 const buildRecipes=async(targetDates,basePlan=null)=>{
  const result=await requestAiMealPlan(settings,targetDates);
  if(!Array.isArray(result.meals)||result.meals.length!==targetDates.length*mealTypes.length)throw new Error('The generated plan was incomplete. Your current draft has been kept.');
  const records=await Promise.all(result.meals.map(async recipe=>toMealRecord(recipe,await findMealImage(recipe.name))));
  const slots={...(basePlan?.slots||{})};
  targetDates.forEach(date=>{slots[date]=Object.fromEntries(mealTypes.map(type=>[type,null]));});
  result.meals.forEach((recipe,index)=>{if(slots[recipe.date]&&mealTypes.includes(recipe.meal_type))slots[recipe.date][recipe.meal_type]={meal_id:records[index].id,locked:false,leftover:false};});
  const missing=targetDates.flatMap(date=>mealTypes.filter(type=>!slots[date]?.[type]?.meal_id));
  if(missing.length)throw new Error('Some selected meal slots came back empty. Your current draft has been kept.');
  await Promise.all(records.map(record=>db.upsert('meals',record)));
  await refresh();
  return {week_start:weekStart,slots,budget_ceiling:Number(settings.budget_ceiling||0),generation_summary:result.summary||'',generated_by:'gemini',generated_at:new Date().toISOString(),status:'draft'};
 };
 const generateWeek=async()=>{
  if(generating)return;setGenerating(true);setError('');setNotice('');
  try{setDraft(await buildRecipes(dates));setNotice('Your first draft is ready. Review every day before approving it.');}
  catch(e){setError(e.message||'Could not generate your weekly plan.');}
  finally{setGenerating(false);}
 };
 const regenerateDay=async(date)=>{
  if(busyDay)return;setBusyDay(date);setError('');setNotice('');
  try{setDraft(await buildRecipes([date],activePlan));setNotice('Updated '+date+'. The rest of your week was left unchanged.');}
  catch(e){setError(e.message||'Could not regenerate that day.');}
  finally{setBusyDay(null);}
 };
 const updateDraft=next=>setDraft({...next,status:'draft'});
 const approve=async()=>{
  if(!draft)return;
  await savePlan({...draft,status:'approved',approved_at:new Date().toISOString()});
  setDraft(null);setNotice('Your weekly meal plan is approved and saved.');
 };
 if(loading)return <p className="muted">Preparing your kitchen…</p>;
 if(generating)return <section className="generation-screen" role="status"><div className="generation-orbit"><span>m.</span></div><p className="eyebrow">THE HOUSEHOLD KITCHEN</p><h1>Putting your week together<span className="generation-dots">…</span></h1><p>Finding meals that fit your household, preferences, portions and budget.</p><div className="generation-progress"><span/></div><small>Planning meals · checking ingredients · estimating costs</small></section>;
 return <><h1 style={{margin:'8px 0 14px',fontSize:'1.4rem'}}>Week of {weekStart}</h1>
  {!activePlan&&<section className="fresh-recipes-panel"><div><strong>Your week, planned around you</strong><p>We'll use your saved household preferences, dietary rules, selected days, meal types and weekly budget.</p></div><button className="btn fresh-recipes-button" onClick={generateWeek}>Generate my weekly plan</button></section>}
  {error&&<p className="fresh-recipes-error" role="alert">{error}</p>}
  {notice&&<p className="fresh-recipes-success" role="status">{notice}</p>}
  {activePlan&&<><div className="row-between" style={{marginBottom:12,flexWrap:'wrap',gap:8}}><div><strong>{draft?'Review your weekly plan':'Your approved weekly plan'}</strong><p className="muted">{draft?'Regenerate individual days until every meal looks right, then approve the whole week.':'This plan is saved. Generate a new draft whenever you want to make changes.'}</p></div>{draft?<button className="btn btn-cta" onClick={approve} disabled={!!busyDay}>Approve my weekly plan</button>:<button className="btn btn-cta" onClick={generateWeek}>Generate a new plan</button>}</div>
   <div className="grid grid-2" style={{marginBottom:12}}><BudgetTracker plan={activePlan} mealsById={mealsById} settings={settings} onSaveSettings={saveSettings} pastPlans={pastPlans}/><NutritionFlags plan={activePlan} mealsById={mealsById}/></div>
   <WeekPlan plan={activePlan} weekStart={weekStart} meals={meals} mealsById={mealsById} settings={settings} pastPlans={pastPlans} leftovers={leftovers} savedWeeks={savedWeeks} onSavePlan={updateDraft} onSaveWeekTemplate={saveWeekTemplate} onAddLeftover={l=>saveLeftover(l)} reviewMode={!!draft} onRegenerateDay={regenerateDay} busyDay={busyDay}/>
   {leftovers.length>0&&<div className="card" style={{marginTop:12}}><div className="card-title">♻ Leftovers on hand</div>{leftovers.map(l=><div key={l.id} className="row-between" style={{padding:'4px 0'}}><span>{mealsById[l.meal_id]?.name||'?'} · {l.servings_left} serving{l.servings_left>1?'s':''}</span><button className="btn btn-ghost btn-sm" onClick={()=>db.upsert('leftovers',{...l,servings_left:l.servings_left-1})}>Ate one</button></div>)}</div>}
  </>}
 </>;
}
