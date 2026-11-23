import { useEffect,useState,useMemo,useCallback } from 'react';
import { db } from './supabase.js';
import { seedMeals } from './seedMeals.js';
import { weekStartOf,isoDate } from './mealGenerator.js';

export function useTable(table){
 const [rows,setRows]=useState([]),[loading,setLoading]=useState(true);
 const refresh=useCallback(()=>db.list(table).then(value=>{setRows(value);setLoading(false);}),[table]);
 useEffect(()=>{refresh();return db.subscribe(table,refresh);},[table,refresh]);
 return {rows,loading,refresh};
}
export const DEFAULT_SETTINGS={
 id:'main',budget_ceiling:1500,cooldown_days:10,mantra:'Write your own “why” here — tap to edit.',
 household_name:'Our household',household_size:2,servings_per_meal:2,dietary_preference:'No preference',
 allergies:[],exclusions:[],favorite_ingredients:[],disliked_ingredients:[],
 appliances:['Stovetop','Rice cooker','Refrigerator'],
 planning_days:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],meal_types:['Breakfast','Lunch','Dinner'],
 planning_frequency:'Weekly',grocery_pricing:'estimates',household_access:'local',onboarding_completed:false
};
export function useSettings(){
 const {rows,loading}=useTable('settings');
 const settings=useMemo(()=>({...DEFAULT_SETTINGS,...(rows.find(r=>r.id==='main')||{})}),[rows]);
 const save=useCallback(patch=>db.upsert('settings',{...settings,...patch,id:'main'}),[settings]);
 return {settings,save,loading};
}
export function useMeals(){
 const {rows,loading,refresh}=useTable('meals');
 useEffect(()=>{if(!loading&&rows.length===0&&!localStorage.getItem('mm-seeded')){localStorage.setItem('mm-seeded','1');Promise.all(seedMeals.map(m=>db.upsert('meals',m))).then(refresh);}},[loading,rows.length,refresh]);
 const mealsById=useMemo(()=>Object.fromEntries(rows.map(m=>[m.id,m])),[rows]);
 return {meals:rows,mealsById,loading,refresh};
}
export function currentWeekStartIso(){return isoDate(weekStartOf(new Date()));}
export function usePlans(){
 const {rows,loading}=useTable('week_plans'),weekStart=currentWeekStartIso();
 const currentPlan=rows.find(p=>p.week_start===weekStart)||null;
 const pastPlans=rows.filter(p=>p.week_start<weekStart).sort((a,b)=>b.week_start.localeCompare(a.week_start));
 const savePlan=useCallback(plan=>db.upsert('week_plans',plan),[]);
 return {plans:rows,currentPlan,pastPlans,savePlan,loading,weekStart};
}
export function useLeftovers(){
 const {rows,loading}=useTable('leftovers');
 return {leftovers:rows.filter(l=>l.servings_left>0),allLeftovers:rows,loading,save:l=>db.upsert('leftovers',l),remove:id=>db.remove('leftovers',id)};
}
export function useSavedWeeks(){
 const {rows,loading}=useTable('saved_weeks');
 return {savedWeeks:rows,loading,save:w=>db.upsert('saved_weeks',w),remove:id=>db.remove('saved_weeks',id)};
}
export function useOnline(){
 const [online,setOnline]=useState(typeof navigator==='undefined'?true:navigator.onLine);
 useEffect(()=>{const up=()=>setOnline(true),down=()=>setOnline(false);window.addEventListener('online',up);window.addEventListener('offline',down);return()=>{window.removeEventListener('online',up);window.removeEventListener('offline',down);};},[]);
 return online;
}
