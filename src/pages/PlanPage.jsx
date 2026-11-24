import {useEffect,useRef,useState} from 'react';
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
 const [generating,setGenerating]=useState(false),[generationError,setGenerationError]=useState(''),[generationNote,setGenerationNote]=useState('');
 const autoStarted=useRef(false);
 const generateFreshRecipes=async()=>{
  if(generating)return;setGenerating(true);setGenerationError('');setGenerationNote('');
  try{
   const dayNames=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
   const selectedDays=settings.planning_days||dayNames;
   const mealTypes=settings.meal_types?.length?settings.meal_types:['Breakfast','Lunch','Dinner'];
   const dates=weekDates(weekStart).filter(date=>selectedDays.includes(dayNames[(new Date(date+'T00:00:00').getDay()+6)%7]));
   const result=await requestAiMealPlan(settings,dates);
   if(!Array.isArray(result.meals)||!result.meals.length)throw new Error('The recipe service returned an empty plan. Your saved recipes were left untouched.');
   const records=await Promise.all(result.meals.map(async recipe=>toMealRecord(recipe,await findMealImage(recipe.name))));
   const slots={};dates.forEach(date=>{slots[date]=Object.fromEntries(mealTypes.map(type=>[type,null]));});
   result.meals.forEach((recipe,index)=>{if(slots[recipe.date]&&mealTypes.includes(recipe.meal_type))slots[recipe.date][recipe.meal_type]={meal_id:records[index].id,locked:false,leftover:false};});
   const missing=dates.flatMap(date=>mealTypes.filter(type=>!slots[date][type]?.meal_id));
   if(missing.length)throw new Error('The recipe service left '+missing.length+' selected meal slot(s) empty. Your saved recipes were left untouched. Try again.');
   localStorage.setItem('mm-seeded','1');
   await Promise.all(records.map(record=>db.upsert('meals',record)));
   await savePlan({week_start:weekStart,slots,budget_ceiling:Number(settings.budget_ceiling||0),generation_summary:result.summary||'',generated_by:'gemini',generated_at:new Date().toISOString()});
   await refresh();setGenerationNote('Added '+records.length+' personalized recipes. Your existing recipe library was preserved.');
  }catch(error){setGenerationError(error.message||'Could not generate fresh recipes. Your saved recipes were not changed.');}
  finally{setGenerating(false);}
 };
 useEffect(()=>{
  if(loading||generating||autoStarted.current||currentPlan||!settings.onboarding_completed)return;
  autoStarted.current=true;
  generateFreshRecipes();
 },[loading,generating,currentPlan,settings.onboarding_completed]);
 if(loading)return <p className="muted">Loading…</p>;
 return <><h1 style={{margin:'8px 0 14px',fontSize:'1.4rem'}}>Week of {weekStart}</h1><section className="fresh-recipes-panel"><div><strong>Fresh recipes for this week</strong><p>Your saved household preferences shape every recipe, portion and weekly budget. New recipes are added without deleting your library.</p></div><button className="btn fresh-recipes-button" onClick={generateFreshRecipes} disabled={generating}>{generating?'Building your personalized plan…':'↻ Generate with my preferences'}</button>{generationNote&&<p className="fresh-recipes-success" role="status">{generationNote}</p>}{generationError&&<p className="fresh-recipes-error" role="alert">{generationError}</p>}</section><div className="grid grid-2" style={{marginBottom:12}}><BudgetTracker plan={currentPlan} mealsById={mealsById} settings={settings} onSaveSettings={saveSettings} pastPlans={pastPlans}/><NutritionFlags plan={currentPlan} mealsById={mealsById}/></div><WeekPlan plan={currentPlan} weekStart={weekStart} meals={meals} mealsById={mealsById} settings={settings} pastPlans={pastPlans} leftovers={leftovers} savedWeeks={savedWeeks} onSavePlan={savePlan} onSaveWeekTemplate={saveWeekTemplate} onAddLeftover={l=>saveLeftover(l)}/>{leftovers.length>0&&<div className="card" style={{marginTop:12}}><div className="card-title">♻ Leftovers on hand</div><p className="muted" style={{marginBottom:8}}>Regenerating slots these fit will suggest reheating them first — they cost ₱0 in the plan.</p>{leftovers.map(l=><div key={l.id} className="row-between" style={{padding:'4px 0'}}><span>{mealsById[l.meal_id]?.name||'?'} · {l.servings_left} serving{l.servings_left>1?'s':''}</span><button className="btn btn-ghost btn-sm" onClick={()=>db.upsert('leftovers',{...l,servings_left:l.servings_left-1})}>Ate one</button></div>)}</div>}</>;
}
