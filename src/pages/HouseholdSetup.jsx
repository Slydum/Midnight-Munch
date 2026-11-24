import {useState} from 'react';
import {db} from '../lib/supabase.js';
import {weekStartOf,isoDate} from '../lib/mealGenerator.js';
import {requestAiMealPlan,toMealRecord,findMealImage} from '../lib/aiMealPlanner.js';

const MEALS=[
 {name:'Breakfast',note:'quick + repeatable',tone:'butter'},
 {name:'Lunch',note:'leftovers-friendly',tone:'leaf'},
 {name:'Dinner',note:'the main event',tone:'peach'},
 {name:'Snacks',note:'optional extras',tone:'rose'}
];
const DIETS=[
 {name:'No restrictions',value:'No preference',note:'anything goes',symbol:'✳'},
 {name:'Vegetarian',value:'Vegetarian',note:'no meat or fish',symbol:'♧'},
 {name:'Vegan',value:'Vegan',note:'plants only',symbol:'❋'},
 {name:'Pescatarian',value:'Pescatarian',note:'fish, no meat',symbol:'♧'},
 {name:'Keto',value:'Keto',note:'low carb, high fat',symbol:'◒'},
 {name:'High-protein',value:'High-protein',note:'protein-forward meals',symbol:'↗'},
 {name:'Mediterranean',value:'Mediterranean',note:'veg, fish, olive oil',symbol:'✳'},
 {name:'Anti-inflammatory',value:'Anti-inflammatory',note:'whole foods',symbol:'◉'}
];
const DAYS=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const STEPS=['People','Meals','Days','Food','Allergies','Budget'];
const asList=v=>Array.isArray(v)?v.join(', '):(v||'');
const parseList=v=>v.split(',').map(x=>x.trim()).filter(Boolean);

export default function HouseholdSetup({settings,onSave,onComplete,editing=false}){
 const [step,setStep]=useState(0);
 const [form,setForm]=useState({
  adults:editing?(settings.adults_count??0):0,
  kids:editing?(settings.kids_count??0):0,
  meal_types:editing?(settings.meal_types||[]):[],
  planning_days:editing?(settings.planning_days||[]):[],
  dietary_preference:editing?(settings.dietary_preference||''):'',
  allergies:editing?asList(settings.allergies):'',
  exclusions:editing?asList(settings.exclusions):'',
  budget_ceiling:settings.onboarding_completed?(settings.budget_ceiling??1500):'',
  planning_frequency:settings.planning_frequency||'Weekly'
 });
 const [saving,setSaving]=useState(false),[error,setError]=useState(''),[generationError,setGenerationError]=useState('');
 const update=(key,value)=>setForm(s=>({...s,[key]:value}));
 const toggle=(key,value)=>update(key,form[key].includes(value)?form[key].filter(x=>x!==value):[...form[key],value]);
 const portions=Number(form.adults)+Number(form.kids)*0.5;
 const householdSize=Number(form.adults)+Number(form.kids);
 const next=()=>{
  setError('');
  if(step===0&&householdSize<1){setError('Add at least one person.');return;}
  if(step===1&&!form.meal_types.length){setError('Choose at least one meal.');return;}
  if(step===2&&!form.planning_days.length){setError('Choose at least one day.');return;}
  if(step===3&&!form.dietary_preference){setError('Choose a food preference to continue.');return;}
  if(step===5&&(!Number.isFinite(Number(form.budget_ceiling))||Number(form.budget_ceiling)<=0)){setError('Enter a weekly budget greater than ₱0.');return;}
  setStep(s=>Math.min(s+1,STEPS.length-1));window.scrollTo({top:0,behavior:'smooth'});
 };
 const back=()=>{setError('');setStep(s=>Math.max(0,s-1));window.scrollTo({top:0,behavior:'smooth'});};
 const finishSetup=async()=>{
  setSaving(true);setError('');setGenerationError('');
  const profile={
   ...settings,...form,
   adults_count:Number(form.adults),kids_count:Number(form.kids),
   household_size:householdSize,servings_per_meal:Math.max(1,Math.ceil(portions)),
   budget_ceiling:Number(form.budget_ceiling),
   allergies:parseList(form.allergies),exclusions:parseList(form.exclusions),
   favorite_ingredients:settings.favorite_ingredients||[],disliked_ingredients:settings.disliked_ingredients||[],
   appliances:settings.appliances||[],household_name:settings.household_name||'My household',
   household_access:'local',grocery_pricing:'estimates',onboarding_completed:true
  };
  try{
   await onSave(profile);
   onComplete?.();
  }catch(err){
   setError(err.message||'Could not save your household settings. Please try again.');
  }finally{setSaving(false);}
 };
 const submit=async e=>{
  e.preventDefault();
  if(step<STEPS.length-1){next();return;}
  if(!Number.isFinite(Number(form.budget_ceiling))||Number(form.budget_ceiling)<=0){setError('Enter a weekly budget greater than ₱0.');return;}
  await finishSetup();
 };
 const count=(label,key,portion)=> <div className="people-card">
  <div className="people-symbol">♙</div><div className="people-copy"><strong>{label}</strong><span>{portion}</span></div>
  <button type="button" className="count-button" aria-label={`Remove one ${label.toLowerCase()}`} disabled={Number(form[key])===0} onClick={()=>update(key,Math.max(0,Number(form[key])-1))}>−</button>
  <strong className="count-value">{form[key]}</strong>
  <button type="button" className="count-button add" aria-label={`Add one ${label.toLowerCase()}`} onClick={()=>update(key,Number(form[key])+1)}>+</button>
 </div>;
 const currentTitles=['Who’s eating?','Which meals?','Which days?','How do you eat?','Any allergies?','What’s your weekly budget?'];
 const subtitles=['Every meal scales to your household automatically.','Pick what we should plan for each week.','Choose the days you want meals planned.','Choose the food style that suits your household.','We’ll keep these ingredients out of your meal ideas.','Set a realistic weekly grocery budget in Philippine pesos.'];
 return <main className={editing?'minimal-setup editing':'minimal-setup'}>
  {!editing&&<div className="minimal-brand"><span className="minimal-mark">m.</span><span>THE HOUSEHOLD KITCHEN</span></div>}
  <div className="minimal-progress-head">
   {editing&&<span className="minimal-edit-label">HOUSEHOLD SETTINGS</span>}
   <button type="button" className="minimal-back" onClick={step?back:()=>window.history.back()} aria-label="Go back">‹</button>
   <div className="minimal-progress"><span style={{width:`${((step+1)/STEPS.length)*100}%`}}/></div>
  </div>
  {saving&&<section className="generation-screen" role="status"><div className="generation-orbit"><span>m.</span></div><p className="eyebrow">THE HOUSEHOLD KITCHEN</p><h1>Generating your meals<span className="generation-dots">…</span></h1><p>Building a week around your household, food preferences and budget.</p><div className="generation-progress"><span/></div><small>Checking ingredients · portions · estimated costs</small></section>}
  {!saving&&<form className="minimal-form" onSubmit={submit}>
   <header className="minimal-heading"><h1>{editing?STEPS[step]==='People'?'Who’s eating?':currentTitles[step]:currentTitles[step]}</h1><p>{subtitles[step]}</p></header>
   {step===0&&<section className="minimal-content">
    {count('Adults','adults','full portions')}
    {count('Kids','kids','half portions')}
    <div className="portion-total"><span>Portions per meal</span><strong>{portions}</strong></div>
   </section>}
   {step===1&&<section className="minimal-content meal-options">
    {MEALS.map(m=><button type="button" key={m.name} className={`meal-option ${form.meal_types.includes(m.name)?'selected':''}`} onClick={()=>toggle('meal_types',m.name)}>
     <span className={`meal-swatch ${m.tone}`}/><span className="option-copy"><strong>{m.name}</strong><small>{m.note}</small></span><span className="option-check">{form.meal_types.includes(m.name)?'✓':''}</span>
    </button>)}
   </section>}
   {step===2&&<section className="minimal-content day-options">
    {DAYS.map(day=><button type="button" key={day} className={form.planning_days.includes(day)?'day-option selected':'day-option'} onClick={()=>toggle('planning_days',day)}>{day}</button>)}
   </section>}
   {step===3&&<section className="minimal-content diet-options">
    {DIETS.map(d=><button type="button" key={d.value} className={form.dietary_preference===d.value?'diet-option selected':'diet-option'} onClick={()=>update('dietary_preference',d.value)}>
     <span className="diet-symbol">{d.symbol}</span><strong>{d.name}</strong><small>{d.note}</small>{form.dietary_preference===d.value&&<span className="diet-check">✓</span>}
    </button>)}
   </section>}
   {step===4&&<section className="minimal-content allergy-content">
    <label htmlFor="allergies">Allergies</label><textarea id="allergies" value={form.allergies} onChange={e=>update('allergies',e.target.value)} placeholder="e.g. peanuts, shrimp"/>
    <label htmlFor="exclusions">Other ingredients to avoid <span>Optional</span></label><textarea id="exclusions" value={form.exclusions} onChange={e=>update('exclusions',e.target.value)} placeholder="e.g. mushrooms, olives"/>
    <p>You can update these anytime in household settings.</p>
   </section>}
   {step===5&&<section className="minimal-content budget-content">
    <label htmlFor="weekly-budget">Weekly grocery budget</label>
    <div className="budget-input-wrap"><span>₱</span><input id="weekly-budget" type="text" inputMode="numeric" pattern="[0-9]*" autoComplete="off" value={form.budget_ceiling} onChange={e=>update("budget_ceiling",e.target.value.replace(/[^0-9]/g,""))} placeholder="e.g. 2500"/></div>
    <p>This is the estimated total for all selected meals and days. You can change it anytime.</p>
   </section>}
   {error&&<p className="minimal-error" role="alert">{error}</p>}
   <footer className="minimal-footer">
    <div className="minimal-step-label">{step+1} / {STEPS.length}</div>
    <button className="minimal-next" type="submit" disabled={saving}>{step===STEPS.length-1?(saving?'Saving…':editing?'Save':'Finish'):'Next'}</button>
   </footer>
  </form>}
 </main>;
}
