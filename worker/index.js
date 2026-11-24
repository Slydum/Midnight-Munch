const MODEL = "gemini-3.8-flash";
const ALLOWED_ORIGINS = new Set([
  "https://slydum.github.io",
  "http://localhost:5173",
]);

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.has(origin) ? origin : "https://slydum.github.io",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  };
}
function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders(origin) },
  });
}
function cleanText(value, max = 500) {
  return String(value ?? "").trim().slice(0, max);
}
function validateInput(body) {
  const days = Array.isArray(body.planning_days) ? body.planning_days : [];
  const mealTypes = Array.isArray(body.meal_types) ? body.meal_types : [];
  const allowedDays = new Set(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
  const allowedMeals = new Set(["Breakfast", "Lunch", "Dinner", "Snacks"]);
  if (!days.length || days.some((d) => !allowedDays.has(d))) throw new Error("Choose at least one valid planning day.");
  if (!mealTypes.length || mealTypes.some((m) => !allowedMeals.has(m))) throw new Error("Choose at least one valid meal type.");
  const portions = Number(body.servings_per_meal);
  if (!Number.isFinite(portions) || portions < 1 || portions > 20) throw new Error("Household portions must be between 1 and 20.");
  const budget = Number(body.budget_ceiling);
  if (!Number.isFinite(budget) || budget < 0 || budget > 1000000) throw new Error("Enter a valid weekly budget.");
  return { days, mealTypes, portions, budget };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(origin) });
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/health") {
      return json({ ok: true, service: "midnight-munch-api" }, 200, origin);
    }
    if (request.method === "GET" && url.pathname === "/diagnostics") {
      if (!env.GEMINI_API_KEY) return json({ ok: false, stage: "secret", error: "GEMINI_API_KEY is missing from the deployed Worker." }, 503, origin);
      try {
        const probe = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-goog-api-key": env.GEMINI_API_KEY },
          body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: "Reply with OK only." }] }], generationConfig: { maxOutputTokens: 8 } }),
        });
        if (!probe.ok) {
          const detail = await probe.text();
          console.error("Gemini diagnostics failed", probe.status, detail.slice(0, 1000));
          return json({ ok: false, stage: "gemini", status: probe.status, error: "Gemini rejected the test request. Check Worker logs for the provider's exact error." }, 502, origin);
        }
        return json({ ok: true, stage: "gemini", model: MODEL, message: "Gemini API connection is working." }, 200, origin);
      } catch (error) {
        console.error("Gemini diagnostics network failure", error?.message || error);
        return json({ ok: false, stage: "network", error: "Cloudflare could not reach the Gemini API." }, 502, origin);
      }
    }
    if (request.method !== "POST" || url.pathname !== "/generate-meals") {
      return json({ error: "Not found" }, 404, origin);
    }
    if (!ALLOWED_ORIGINS.has(origin)) return json({ error: "Origin not allowed" }, 403, origin);
    if (!env.GEMINI_API_KEY) return json({ error: "The Gemini API secret is not configured. Add GEMINI_API_KEY in Worker settings." }, 503, origin);

    let body;
    try { body = await request.json(); } catch { return json({ error: "Request body must be valid JSON." }, 400, origin); }
    let input;
    try { input = validateInput(body); } catch (error) { return json({ error: error.message }, 400, origin); }

    const dates = Array.isArray(body.dates) ? body.dates : [];
    if (dates.length !== input.days.length || dates.some((date) => !/^\d{4}-\d{2}-\d{2}$/.test(date))) return json({ error: "The selected dates are invalid. Please restart setup." }, 400, origin);

    const preferences = {
      householdName: cleanText(body.household_name, 80),
      dietaryPreference: cleanText(body.dietary_preference, 80) || "No preference",
      allergies: Array.isArray(body.allergies) ? body.allergies.map((v) => cleanText(v, 80)).filter(Boolean).slice(0, 30) : [],
      exclusions: Array.isArray(body.exclusions) ? body.exclusions.map((v) => cleanText(v, 80)).filter(Boolean).slice(0, 30) : [],
      favoriteIngredients: Array.isArray(body.favorite_ingredients) ? body.favorite_ingredients.map((v) => cleanText(v, 80)).filter(Boolean).slice(0, 20) : [],
      dislikedIngredients: Array.isArray(body.disliked_ingredients) ? body.disliked_ingredients.map((v) => cleanText(v, 80)).filter(Boolean).slice(0, 20) : [],
      appliances: Array.isArray(body.appliances) ? body.appliances.map((v) => cleanText(v, 50)).slice(0, 15) : [],
      effort: cleanText(body.cooking_effort, 40) || "balanced",
      days: input.days,
      mealTypes: input.mealTypes,
      portions: input.portions,
      weeklyBudgetPHP: input.budget,
      currency: "PHP",
      location: "Philippines",
    };

    const prompt = `You are the meal-planning engine for Midnight Munch, a practical household kitchen app in the Philippines.
Create a realistic, affordable weekly plan using Philippine-market ingredients and familiar Filipino and international meals.
Return ONLY valid JSON matching this shape:
{
  "summary": "one short sentence",
  "meals": [
    {
      "date": "YYYY-MM-DD",
      "meal_type": "Breakfast|Lunch|Dinner|Snacks",
      "name": "recipe name",
      "description": "short appetizing description",
      "servings": 2,
      "prep_minutes": 15,
      "cook_minutes": 15,
      "prep_effort": "no-cook|one-pan|batch-cook",
      "estimated_cost_php": 120,
      "ingredients": [{"name":"tofu","qty":300,"unit":"g","section":"Others"}],
      "nutrition_tags": ["protein"],
      "plant_based": true,
      "instructions": ["Step one","Step two","Step three"]
    }
  ]
}
Rules:
- Produce exactly one recipe for every requested date x selected meal type. No missing or extra slots.
- The date list is: ${body.dates.join(", ")}.
- Meal types per date: ${input.mealTypes.join(", ")}.
- Scale ingredient quantities to ${input.portions} full portions. Kids are already represented in the portion total.
- Every recipe must include practical quantities, units, 3-7 concise cooking steps and realistic PHP ingredient cost for the whole recipe/household portion.
- Keep the TOTAL of estimated_cost_php across the entire plan at or below PHP ${input.budget}, when feasible. If the budget is too low, choose simpler meals and explain briefly in summary. Do not invent implausibly cheap prices.
- Use ingredients commonly available in Philippine supermarkets, wet markets or groceries. Prefer overlapping ingredients to reduce waste.
- Respect the diet strictly. Vegetarian means no meat or fish; vegan means no animal products; pescatarian permits fish/seafood but no meat. Never include listed allergies or exclusions, including hidden sauces/condiments containing them.
- Do not add medical claims or promise nutrition outcomes. Nutrition tags are descriptive only.
- Vary proteins, vegetables and cooking styles. Reuse ingredients strategically, not the exact same meal repeatedly.
- If favorites are supplied, use them naturally. Avoid disliked ingredients.
- Available appliances: ${preferences.appliances.join(", ") || "stovetop and basic kitchen tools"}.
- Cooking effort preference: ${preferences.effort}.
- Household preferences: ${JSON.stringify(preferences)}.
- Output valid JSON only, no markdown fences.`;

    let response;
    try {
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-goog-api-key": env.GEMINI_API_KEY },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.7, maxOutputTokens: 16000 },
      }),
      });
    } catch (error) {
      console.error("Gemini network request failed", error?.message || error);
      return json({ error: "Cloudflare could not reach Gemini. Please retry in a moment." }, 502, origin);
    }
    if (!response.ok) {
      const details = await response.text();
      console.error("Gemini request failed", response.status, details.slice(0, 1200));
      return json({ error: response.status === 429 ? "Gemini's free usage limit has been reached. Please wait and try again." : "Gemini couldn't generate the plan. Please try again in a moment.", upstreamStatus: response.status }, response.status === 429 ? 429 : 502, origin);
    }
    let result;
    try { result = await response.json(); } catch {
      return json({ error: "Gemini returned an unreadable response. Please try again." }, 502, origin);
    }
    const text = result.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("") || "";
    let generated;
    try { generated = JSON.parse(text); } catch {
      console.error("Gemini returned invalid JSON", text.slice(0, 1200));
      return json({ error: "The meal generator returned an unreadable plan. Please try again." }, 502, origin);
    }
    if (!Array.isArray(generated.meals) || generated.meals.length !== input.days.length * input.mealTypes.length) {
      return json({ error: "The generated plan was incomplete. Please try again." }, 502, origin);
    }
    return json(generated, 200, origin);
  },
};
