const ALLOWED_ORIGINS = new Set(["https://slydum.github.io", "http://localhost:5173"]);
function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.has(origin) ? origin : (origin ? "null" : "*");
  return {"Access-Control-Allow-Origin":allowed,"Access-Control-Allow-Methods":"GET, POST, OPTIONS","Access-Control-Allow-Headers":"Content-Type, Accept","Access-Control-Max-Age":"86400","Vary":"Origin"};
}
function json(data,status,origin){return new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json; charset=utf-8",...corsHeaders(origin)}});}
function cleanText(value,max=300){return String(value??"").trim().slice(0,max);}
function recipeFromJsonLd(html) {
  const scripts = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for (const match of scripts) {
    try {
      const parsed=JSON.parse(match[1].replace(/&quot;/g,'"'));
      const nodes=Array.isArray(parsed)?parsed:[parsed];
      const queue=[...nodes];
      while(queue.length){
        const node=queue.shift(); if(!node||typeof node!=="object") continue;
        if(Array.isArray(node)) {queue.push(...node);continue;}
        if(node["@graph"]) queue.push(...(Array.isArray(node["@graph"])?node["@graph"]:[node["@graph"]]));
        const types=Array.isArray(node["@type"])?node["@type"]:[node["@type"]];
        if(types.includes("Recipe")){
          const instructions=(node.recipeInstructions||[]).flatMap(x=>typeof x==="string"?[x]:x.text?[x.text]:(x.itemListElement||[]).map(y=>y.text||y.name).filter(Boolean));
          const image=typeof node.image==="string"?node.image:Array.isArray(node.image)?(typeof node.image[0]==="string"?node.image[0]:node.image[0]?.url):node.image?.url;
          return {ingredients:Array.isArray(node.recipeIngredient)?node.recipeIngredient:[],instructions,image,prepTime:node.prepTime||null,cookTime:node.cookTime||null,recipeYield:node.recipeYield||null};
        }
      }
    } catch {}
  }
  return null;
}
async function searchTavily(env,query,maxResults=8){
  const response=await fetch("https://api.tavily.com/search",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({api_key:env.TAVILY_API_KEY,query,search_depth:"basic",topic:"general",max_results:maxResults,include_images:true,include_raw_content:true})});
  if(!response.ok){const detail=await response.text();console.error("Tavily search failed",response.status,detail.slice(0,600));throw new Error(response.status===429?"Tavily monthly search allowance or rate limit reached.": "Recipe search provider is temporarily unavailable.");}
  return response.json();
}
async function enrichResult(result){
  let recipe=null;
  try{
    const u=new URL(result.url);
    if(!["http:","https:"].includes(u.protocol)) throw new Error("Invalid protocol");
    const page=await fetch(u.toString(),{headers:{"User-Agent":"Mozilla/5.0 (compatible; MidnightMunch/1.0; +https://slydum.github.io/Midnight-Munch/)"},redirect:"follow"});
    const type=page.headers.get("content-type")||"";
    if(page.ok&&type.includes("text/html")) recipe=recipeFromJsonLd((await page.text()).slice(0,1500000));
  }catch(error){console.warn("Recipe page extraction skipped",result.url,error?.message||error);}
  const raw=cleanText(result.raw_content||result.content,5000);
  return {title:cleanText(result.title,220),source:new URL(result.url).hostname.replace(/^www\./,""),url:result.url,thumbnail:result.image||null,ingredients:recipe?.ingredients||null,instructions:recipe?.instructions||raw||null,prepTime:recipe?.prepTime||null,cookTime:recipe?.cookTime||null,servings:recipe?.recipeYield||null,extracted:Boolean(recipe),excerpt:cleanText(result.content,700)};
}
export default {async fetch(request,env){
 const origin=request.headers.get("Origin")||"",url=new URL(request.url);
 if(request.method==="OPTIONS")return new Response(null,{status:204,headers:corsHeaders(origin)});
 if(request.method==="GET"&&url.pathname==="/health")return json({ok:true,service:"midnight-munch-api",recipeSearch:Boolean(env.TAVILY_API_KEY)},200,origin);
 if(request.method==="POST"&&url.pathname==="/generate-meals"){
  if(!env.GEMINI_API_KEY)return json({error:"Meal generation is not configured."},503,origin);
  let body;try{body=await request.json()}catch{return json({error:"Request body must be valid JSON."},400,origin);}
  const days=Array.isArray(body.planning_days)?body.planning_days:[],types=Array.isArray(body.meal_types)?body.meal_types:[];
  const dates=Array.isArray(body.dates)?body.dates:[];
  if(!days.length||!types.length||!dates.length||dates.some(date=>!/^\d{4}-\d{2}-\d{2}$/.test(date)))return json({error:"Choose valid planning days and meal types."},400,origin);
  const prefs={diet:cleanText(body.dietary_preference,80)||"No preference",allergies:body.allergies||[],exclusions:body.exclusions||[],favorites:body.favorite_ingredients||[],dislikes:body.disliked_ingredients||[],appliances:body.appliances||[],servings:Number(body.servings_per_meal)||2,budget:Number(body.budget_ceiling)||0};
  const prompt=`Create a weekly meal plan for a household in the Philippines. Return ONLY JSON: {"summary":"short","meals":[{"date":"YYYY-MM-DD","meal_type":"Breakfast|Lunch|Dinner|Snacks","name":"Recipe","description":"short","servings":2,"prep_minutes":15,"cook_minutes":15,"prep_effort":"one-pan","estimated_cost_php":120,"ingredients":[{"name":"tofu","qty":300,"unit":"g","section":"Others"}],"nutrition_tags":["protein"],"plant_based":true,"instructions":["Step 1","Step 2"]}]}. Produce exactly one recipe for each date and selected meal type. Dates: ${dates.join(", ")}. Types: ${types.join(", ")}. Respect dietary preference, allergies and exclusions strictly. Prefer affordable, common Philippine ingredients and ingredient overlap. Scale quantities to ${prefs.servings} servings. Keep total estimated cost within PHP ${prefs.budget} if realistic. Favorites: ${JSON.stringify(prefs.favorites)}. Avoid: ${JSON.stringify(prefs.dislikes)}. Appliances: ${JSON.stringify(prefs.appliances)}. Preferences: ${JSON.stringify(prefs)}. Costs are estimates, never claim live prices.`;
  try{
   const upstream=await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent",{method:"POST",headers:{"Content-Type":"application/json","X-goog-api-key":env.GEMINI_API_KEY},body:JSON.stringify({contents:[{role:"user",parts:[{text:prompt}]}],generationConfig:{responseMimeType:"application/json",temperature:0.6,maxOutputTokens:14000}})});
   if(!upstream.ok){
    const detail=await upstream.text();
    console.error("Gemini generation provider error",upstream.status,detail.slice(0,1200));
    const message=upstream.status===429?"Meal generation limit reached. Try again later.":upstream.status===401||upstream.status===403?"Meal generation authentication failed. The app administrator needs to check the Gemini API key and API access.":upstream.status===404?"The configured Gemini model or API endpoint was not found.":upstream.status>=500?"Google's meal generation service is temporarily having trouble. Please try again shortly.":`Gemini rejected the meal request (HTTP ${upstream.status}).`;
    return json({error:message},502,origin);
   }
   const data=await upstream.json(),raw=data.candidates?.[0]?.content?.parts?.map(p=>p.text||"").join("")||"",plan=JSON.parse(raw);
   if(!Array.isArray(plan.meals)||plan.meals.length!==dates.length*types.length)return json({error:"The generated plan was incomplete. Please try again."},502,origin);
   return json(plan,200,origin);
  }catch(error){console.error("Meal generation failed",error?.message||error);return json({error:"Meal generation failed. Please try again."},502,origin);}
 }
 if(request.method==="POST"&&url.pathname==="/search-recipes"){
  if(!env.TAVILY_API_KEY)return json({error:"TAVILY_API_KEY is missing from Worker secrets."},503,origin);
  let body;try{body=await request.json()}catch{return json({error:"Request body must be valid JSON."},400,origin);}
  const query=cleanText(body.query,180);
  if(!query)return json({error:"Enter a recipe or ingredient to search."},400,origin);
  try{
   const data=await searchTavily(env,query,Math.min(8,Math.max(1,Number(body.limit)||8)));
   const results=await Promise.all((data.results||[]).slice(0,8).map(enrichResult));
   return json({results,answer:cleanText(data.answer,1200),provider:"Tavily"},200,origin);
  }catch(error){console.error("Recipe search error",error?.message||error);return json({error:error.message||"Recipe search failed."},502,origin);}
 }
 return json({error:"Not found"},404,origin);
}};
