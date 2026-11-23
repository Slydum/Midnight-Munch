import {useState} from 'react';

const DAYS=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const APPLIANCES=['Stovetop','Oven','Air fryer','Microwave','Rice cooker','Slow cooker','Blender','Refrigerator','Freezer'];
const MEALS=['Breakfast','Lunch','Dinner','Snacks'];
const DIETS=['No preference','Vegetarian','Pescatarian','Vegan','Omnivore'];
const STEPS=[{name:'Household',eyebrow:'THE PEOPLE AT YOUR TABLE',title:'Who are we cooking for?'},{name:'Food',eyebrow:'WHAT WORKS FOR YOU',title:'Your food preferences.'},{name:'Routine',eyebrow:'YOUR WEEK, YOUR WAY',title:'When do you want to plan?'},{name:'Kitchen',eyebrow:'TOOLS & BUDGET',title:'What do you have to work with?'},{name:'Review',eyebrow:'ONE LAST LOOK',title:'Your kitchen, your rules.'}];
const csv=v=>Array.isArray(v)?v.join(', '):(v||'');
const list=v=>v.split(',').map(x=>x.trim()).filter(Boolean);
const money=v=>Number(v||0).toLocaleString('en-PH');
export default function HouseholdSetup({settings,onSave,onComplete,editing=false}){
 const [step,setStep]=useState(0);
 const [form,setForm]=useState({
  household_name:editing?(settings.household_name||''):'',
  household_size:editing?(settings.household_size||''):'',
  servings_per_meal:editing?(settings.servings_per_meal||''):'',
  dietary_preference:editing?(settings.dietary_preference||''):'',
  allergies:editing?csv(settings.allergies):'',
  exclusions:editing?csv(settings.exclusions):'',
  favorite_ingredients:editing?csv(settings.favorite_ingredients):'',
  disliked_ingredients:editing?csv(settings.disliked_ingredients):'',
  appliances:editing?(settings.appliances||[]):[],
  planning_days:editing?(settings.planning_days||[]):[],
  meal_types:editing?(settings.meal_types||[]):[],
  planning_frequency:editing?(settings.planning_frequency||'Weekly'):'Weekly',
  budget_ceiling:editing?(settings.budget_ceiling??''):''
 });
 const [saving,setSaving]=useState(false),[error,setError]=useState('');
 const update=(key,value)=>setForm(s=>({...s,[key]:value}));
 const toggle=(key,value)=>update(key,form[key].includes(value)?form[key].filter(x=>x!==value):[...form[key],value]);
 const next=()=>{
  setError('');
  if(step===0&&(!form.household_name.trim()||Number(form.household_size)<1||Number(form.servings_per_meal)<1)){setError('Add a household name, household size and serving size to continue.');return;}
  if(step===1&&!form.dietary_preference){setError('Choose a dietary preference, or select “No preference”.');return;}
  if(step===2&&(!form.planning_days.length||!form.meal_types.length)){setError('Choose at least one day and one meal type.');return;}
  setStep(s=>Math.min(s+1,STEPS.length-1));
  window.scrollTo({top:0,behavior:'smooth'});
 };
 const back=()=>{setError('');setStep(s=>Math.max(0,s-1));window.scrollTo({top:0,behavior:'smooth'});};
 const submit=async e=>{
  e.preventDefault();
  if(step!==STEPS.length-1){next();return;}
  setSaving(true);setError('');
  try{
   await onSave({...form,household_name:form.household_name.trim(),household_size:Math.max(1,Number(form.household_size)||1),servings_per_meal:Math.max(1,Number(form.servings_per_meal)||1),budget_ceiling:Math.max(0,Number(form.budget_ceiling)||0),allergies:list(form.allergies),exclusions:list(form.exclusions),favorite_ingredients:list(form.favorite_ingredients),disliked_ingredients:list(form.disliked_ingredients),household_access:'local',grocery_pricing:'estimates',onboarding_completed:true});
   onComplete?.();
  }catch(err){setError(err.message||'Could not save your household settings.');}
  finally{setSaving(false);}
 };
 const choices=(key,items)=><div className="choice-grid">{items.map(item=><label key={item} className={form[key].includes(item)?'choice selected':'choice'}><input type="checkbox" checked={form[key].includes(item)} onChange={()=>toggle(key,item)}/>{item}</label>)}</div>;
 const review=(label,value)=><div className="review-row"><span>{label}</span><strong>{value||'Not set'}</strong></div>;
 const current=STEPS[step];
 return <main className={editing?'setup-page setup-editing':'setup-page'}>
  {!editing&&<div className="setup-topline"><span className="brand-mark">m.</span><span>THE HOUSEHOLD KITCHEN</span></div>}
  <div className="setup-intro"><p className="eyebrow">{editing?'YOUR KITCHEN, YOUR SETTINGS':'A KITCHEN THAT FITS YOUR ACTUAL LIFE'}</p><h1>{editing?<>Household<br/><em>preferences.</em></>:<>Let's set up<br/><em>your kitchen.</em></>}</h1><p>{editing?'Update one part at a time. Your changes are saved on this device.':'A few quick steps to make the kitchen planner yours. Nothing is locked in, and you can change it all later.'}</p></div>
  <div className="wizard-progress" aria-label={`Step ${step+1} of ${STEPS.length}`}>
   <div className="wizard-progress-copy"><span>STEP 0{step+1} <i>OF 0{STEPS.length}</i></span><strong>{current.name}</strong></div>
   <div className="wizard-track">{STEPS.map((s,i)=><span key={s.name} className={i<=step?'complete':''}/>)}</div>
   <div className="wizard-stepnames">{STEPS.map((s,i)=><span key={s.name} className={i===step?'current':''}>{s.name}</span>)}</div>
  </div>
  <form className="setup-form wizard-form" onSubmit={submit}>
   <section className="setup-section wizard-panel" key={step}>
    <span className="setup-step">0{step+1} / {current.eyebrow}</span>
    <h2>{current.title}</h2>
    {step===0&&<>
     <label className="field">Household name<input value={form.household_name} onChange={e=>update('household_name',e.target.value)} placeholder="e.g. The Santos household" required/></label>
     <div className="setup-two"><label className="field">People in household<input type="number" min="1" max="30" value={form.household_size} onChange={e=>update('household_size',e.target.value)} placeholder="How many?" required/></label><label className="field">Servings per recipe<input type="number" min="1" max="30" value={form.servings_per_meal} onChange={e=>update('servings_per_meal',e.target.value)} placeholder="How many plates?" required/></label></div>
     <p className="setup-hint">Household size and servings can be different. Set the usual number of portions you want recipes to make.</p>
    </>}
    {step===1&&<>
     <label className="field">Dietary preference<select value={form.dietary_preference} onChange={e=>update('dietary_preference',e.target.value)}><option value="">Choose a preference</option>{DIETS.map(v=><option key={v}>{v}</option>)}</select></label>
     <label className="field">Allergies <small>Separate items with commas</small><input value={form.allergies} onChange={e=>update('allergies',e.target.value)} placeholder="e.g. peanuts, shrimp"/></label>
     <label className="field">Ingredients to exclude<input value={form.exclusions} onChange={e=>update('exclusions',e.target.value)} placeholder="e.g. mushrooms, pork"/></label>
     <label className="field">Ingredients you enjoy<input value={form.favorite_ingredients} onChange={e=>update('favorite_ingredients',e.target.value)} placeholder="e.g. tofu, salmon, tomatoes"/></label>
     <label className="field">Ingredients you dislike<input value={form.disliked_ingredients} onChange={e=>update('disliked_ingredients',e.target.value)} placeholder="e.g. okra, olives"/></label>
    </>}
    {step===2&&<>
     <p className="setup-hint">Choose the days and meal types you want to plan. No assumptions about work shifts or fixed meal times.</p>
     <span className="field-label">Which days?</span>{choices('planning_days',DAYS)}
     <span className="field-label">Which meals?</span>{choices('meal_types',MEALS)}
     <label className="field">How often do you plan?<select value={form.planning_frequency} onChange={e=>update('planning_frequency',e.target.value)}>{['Daily','Twice a week','Weekly','Every two weeks'].map(v=><option key={v}>{v}</option>)}</select></label>
    </>}
    {step===3&&<>
     <span className="field-label">Which appliances can you use?</span>{choices('appliances',APPLIANCES)}
     <label className="field">Weekly grocery budget <span className="currency-input"><b>₱</b><input type="number" min="0" step="50" value={form.budget_ceiling} onChange={e=>update('budget_ceiling',e.target.value)} placeholder="Set a budget (optional)"/></span></label>
     <p className="setup-hint">Prices are editable estimates in Philippine pesos. You can leave the budget blank and set it later.</p>
    </>}
    {step===4&&<div className="setup-review">
     <p className="setup-hint">Here's what Midnight Munch will use. Go back to change anything before saving.</p>
     {review('Household',form.household_name)}
     {review('People / servings',`${form.household_size} people · ${form.servings_per_meal} servings`)}
     {review('Diet',form.dietary_preference)}
     {review('Allergies',form.allergies)}
     {review('Avoid',form.exclusions)}
     {review('Planning days',form.planning_days.join(', '))}
     {review('Meal types',form.meal_types.join(', '))}
     {review('Planning frequency',form.planning_frequency)}
     {review('Appliances',form.appliances.join(', '))}
     {review('Weekly budget',form.budget_ceiling? `₱${money(form.budget_ceiling)}`:'Not set')}
     <div className="local-note"><strong>Saved on this device</strong><span>No account, cloud sync or cross-device sharing.</span></div>
    </div>}
   </section>
   {error&&<p className="wizard-error" role="alert">{error}</p>}
   <div className="wizard-actions">
    {step>0?<button className="wizard-back" type="button" onClick={back}>← Back</button>:<span className="wizard-local-note">Your answers stay on this device.</span>}
    {step<STEPS.length-1?<button className="setup-submit" type="button" onClick={next}>Continue <span>→</span></button>:<button className="setup-submit" type="submit" disabled={saving}>{saving?'Saving…':editing?'Save changes ↗':'Finish setup ↗'}</button>}
   </div>
  </form>
 </main>;
}
