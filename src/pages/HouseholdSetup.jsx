import {useState} from 'react';
const DAYS=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const APPLIANCES=['Stovetop','Oven','Air fryer','Microwave','Rice cooker','Slow cooker','Blender','Refrigerator','Freezer'];
const MEALS=['Breakfast','Lunch','Dinner','Snacks'];
const csv=v=>Array.isArray(v)?v.join(', '):(v||'');
const list=v=>v.split(',').map(x=>x.trim()).filter(Boolean);
export default function HouseholdSetup({settings,onSave,onComplete,editing=false}){
 const [form,setForm]=useState({household_name:settings.household_name||'Our household',household_size:settings.household_size||2,servings_per_meal:settings.servings_per_meal||settings.household_size||2,dietary_preference:settings.dietary_preference||'No preference',allergies:csv(settings.allergies),exclusions:csv(settings.exclusions),favorite_ingredients:csv(settings.favorite_ingredients),disliked_ingredients:csv(settings.disliked_ingredients),appliances:settings.appliances||['Stovetop','Rice cooker','Refrigerator'],planning_days:settings.planning_days||DAYS,meal_types:settings.meal_types||['Breakfast','Lunch','Dinner'],planning_frequency:settings.planning_frequency||'Weekly',budget_ceiling:settings.budget_ceiling||1500});
 const [saving,setSaving]=useState(false);
 const update=(key,value)=>setForm(s=>({...s,[key]:value}));
 const toggle=(key,value)=>update(key,form[key].includes(value)?form[key].filter(x=>x!==value):[...form[key],value]);
 const submit=async e=>{e.preventDefault();setSaving(true);await onSave({...form,household_size:Math.max(1,Number(form.household_size)||1),servings_per_meal:Math.max(1,Number(form.servings_per_meal)||1),budget_ceiling:Math.max(0,Number(form.budget_ceiling)||0),allergies:list(form.allergies),exclusions:list(form.exclusions),favorite_ingredients:list(form.favorite_ingredients),disliked_ingredients:list(form.disliked_ingredients),household_access:'local',grocery_pricing:'estimates',onboarding_completed:true});setSaving(false);onComplete?.();};
 const choices=(key,items)=><div className="choice-grid">{items.map(item=><label key={item} className={form[key].includes(item)?'choice selected':'choice'}><input type="checkbox" checked={form[key].includes(item)} onChange={()=>toggle(key,item)}/>{item}</label>)}</div>;
 return <main className="setup-page">
  <div className="setup-topline"><span className="brand-mark">m.</span><span>THE HOUSEHOLD KITCHEN</span></div>
  <div className="setup-intro"><p className="eyebrow">A KITCHEN THAT FITS YOUR ACTUAL LIFE</p><h1>{editing?<>Household<br/><em>preferences.</em></>:<>Let's set up<br/><em>your kitchen.</em></>}</h1><p>Tell Midnight Munch who you're cooking for and how you like to plan. You can change every detail later.</p></div>
  <form className="setup-form" onSubmit={submit}>
   <section className="setup-section"><span className="setup-step">01 / HOUSEHOLD</span><h2>The people at your table</h2>
    <label className="field">Household name<input value={form.household_name} onChange={e=>update('household_name',e.target.value)} required/></label>
    <div className="setup-two"><label className="field">People in household<input type="number" min="1" max="30" value={form.household_size} onChange={e=>update('household_size',e.target.value)}/></label><label className="field">Servings per recipe<input type="number" min="1" max="30" value={form.servings_per_meal} onChange={e=>update('servings_per_meal',e.target.value)}/></label></div>
   </section>
   <section className="setup-section"><span className="setup-step">02 / FOOD</span><h2>What works for you</h2>
    <label className="field">Dietary preference<select value={form.dietary_preference} onChange={e=>update('dietary_preference',e.target.value)}>{['No preference','Vegetarian','Pescatarian','Vegan','Omnivore'].map(v=><option key={v}>{v}</option>)}</select></label>
    <label className="field">Allergies <small>Separate items with commas</small><input value={form.allergies} onChange={e=>update('allergies',e.target.value)} placeholder="e.g. peanuts, shrimp"/></label>
    <label className="field">Ingredients to exclude<input value={form.exclusions} onChange={e=>update('exclusions',e.target.value)} placeholder="e.g. mushrooms, pork"/></label>
    <label className="field">Ingredients you enjoy<input value={form.favorite_ingredients} onChange={e=>update('favorite_ingredients',e.target.value)} placeholder="e.g. tofu, salmon, tomatoes"/></label>
    <label className="field">Ingredients you dislike<input value={form.disliked_ingredients} onChange={e=>update('disliked_ingredients',e.target.value)} placeholder="e.g. okra, olives"/></label>
   </section>
   <section className="setup-section"><span className="setup-step">03 / YOUR ROUTINE</span><h2>Plan around your week</h2><p className="setup-hint">Choose days and meal types. No assumptions about work shifts or fixed meal times.</p>
    <span className="field-label">Planning days</span>{choices('planning_days',DAYS)}<span className="field-label">Meal types</span>{choices('meal_types',MEALS)}
    <label className="field">Planning frequency<select value={form.planning_frequency} onChange={e=>update('planning_frequency',e.target.value)}>{['Daily','Twice a week','Weekly','Every two weeks'].map(v=><option key={v}>{v}</option>)}</select></label>
   </section>
   <section className="setup-section"><span className="setup-step">04 / KITCHEN & BUDGET</span><h2>What you have to work with</h2><span className="field-label">Available appliances</span>{choices('appliances',APPLIANCES)}
    <label className="field">Weekly grocery budget <span className="currency-input"><b>₱</b><input type="number" min="0" step="50" value={form.budget_ceiling} onChange={e=>update('budget_ceiling',e.target.value)}/></span></label>
    <p className="setup-hint">Grocery prices are estimates in Philippine pesos. You can edit them and record actual spending later.</p>
   </section>
   <div className="setup-footer"><div><strong>{editing?'Save your household profile':'Your kitchen, your rules.'}</strong><p>Saved locally on this device. No account or cloud sync.</p></div><button className="setup-submit" type="submit" disabled={saving||!form.planning_days.length||!form.meal_types.length}>{saving?'Saving…':editing?'Save changes ↗':'Build my kitchen ↗'}</button></div>
  </form>
 </main>;
}