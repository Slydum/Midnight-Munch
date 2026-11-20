import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
export const supabase = url && key ? createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}}) : null;
export const isRemote = !!supabase;
const listeners:Record<string,Set<()=>void>> = {};
const cacheKey=(table:string)=>"mm-native:"+table;
const uuid=()=> "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,c=>{const r=Math.random()*16|0;return (c==="x"?r:(r&3|8)).toString(16)});
const notify=(table:string)=>listeners[table]?.forEach(fn=>fn());
async function localRead(table:string):Promise<any[]>{try{return JSON.parse((await AsyncStorage.getItem(cacheKey(table)))||"[]")}catch{return []}}
async function localWrite(table:string,rows:any[]){await AsyncStorage.setItem(cacheKey(table),JSON.stringify(rows));notify(table)}
export const db={
  async list(table:string):Promise<any[]>{
    if(supabase){try{const {data,error}=await supabase.from(table).select("*").order("created_at",{ascending:true});if(error)throw error;await AsyncStorage.setItem(cacheKey(table),JSON.stringify(data||[]));return data||[]}catch{}}
    return localRead(table);
  },
  async upsert(table:string,row:any){
    const full={...row,id:row.id||uuid()};
    const rows=await localRead(table);const index=rows.findIndex(x=>x.id===full.id);
    const merged=index>=0?{...rows[index],...full}:{created_at:new Date().toISOString(),...full};
    if(index>=0)rows[index]=merged;else rows.push(merged);
    await localWrite(table,rows);
    if(supabase){const {error}=await supabase.from(table).upsert(merged);if(error)console.warn("Midnight Munch sync:",error.message);}
    return merged;
  },
  async remove(table:string,id:string){
    await localWrite(table,(await localRead(table)).filter(x=>x.id!==id));
    if(supabase){const {error}=await supabase.from(table).delete().eq("id",id);if(error)console.warn("Midnight Munch sync:",error.message);}
  },
  subscribe(table:string,fn:()=>void){
    (listeners[table] ||= new Set()).add(fn);
    const channel=supabase?.channel("native-"+table+"-"+uuid()).on("postgres_changes",{event:"*",schema:"public",table},()=>fn()).subscribe();
    return ()=>{listeners[table]?.delete(fn);if(channel)supabase?.removeChannel(channel)};
  }
};
