import React,{createContext,useContext,useEffect,useState} from "react";
import {AppState} from "react-native";
import { db,flushQueue } from "../lib/db";
import { seedMeals } from "../data/seedMeals";
import { DEFAULT_SETTINGS } from "../lib/seedDefaults";
type Store={ready:boolean;version:number;refresh:()=>void};
const Ctx=createContext<Store>({ready:false,version:0,refresh:()=>{}});
export function DataProvider({children}:{children:React.ReactNode}){
 const [ready,setReady]=useState(false);const [version,setVersion]=useState(0);
 const refresh=()=>setVersion(v=>v+1);
 useEffect(()=>{let alive=true;(async()=>{
   const existing=await db.list("meals");
   if(existing.length===0){for(const meal of seedMeals)await db.upsert("meals",meal)}
   const settings=await db.list("settings");
   if(!settings.length)await db.upsert("settings",DEFAULT_SETTINGS);
   await flushQueue();
   if(alive)setReady(true);
 })();
 const sub=AppState.addEventListener("change",state=>{if(state==="active")flushQueue()});
 return()=>{alive=false;sub.remove()}},[]);
 return <Ctx.Provider value={{ready,version,refresh}}>{children}</Ctx.Provider>
}
export function useStore(){return useContext(Ctx)}
export function useTable(table:string){
 const {version}=useStore();const [rows,setRows]=useState<any[]>([]);
 useEffect(()=>{let alive=true;const load=()=>db.list(table).then(r=>{if(alive)setRows(r)});load();const unsub=db.subscribe(table,load);return()=>{alive=false;unsub()}},[table,version]);
 return {rows};
}
