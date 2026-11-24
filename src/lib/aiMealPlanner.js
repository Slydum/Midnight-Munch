const API_URL = import.meta.env.VITE_MEAL_API_URL || 'https://midnight-munch-api.yuripremiums.workers.dev';

export async function requestAiMealPlan(settings, dates) {
  const response = await fetch(`${API_URL}/generate-meals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      household_name: settings.household_name,
      servings_per_meal: settings.servings_per_meal,
      planning_days: settings.planning_days,
      meal_types: settings.meal_types,
      dietary_preference: settings.dietary_preference,
      allergies: settings.allergies || [],
      exclusions: settings.exclusions || [],
      favorite_ingredients: settings.favorite_ingredients || [],
      disliked_ingredients: settings.disliked_ingredients || [],
      appliances: settings.appliances || [],
      cooking_effort: settings.cooking_effort || 'balanced',
      budget_ceiling: Number(settings.budget_ceiling || 0),
      dates,
    }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || `Meal generation failed (${response.status}).`);
  if (!Array.isArray(payload.meals)) throw new Error('The meal generator returned an invalid plan.');
  return payload;
}

export function toMealRecord(recipe) {
  const id = `ai-${crypto.randomUUID()}`;
  return {
    id,
    name: recipe.name,
    description: recipe.description || '',
    ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
    cost: Math.max(0, Number(recipe.estimated_cost_php || 0)),
    prep_effort: ['no-cook', 'one-pan', 'batch-cook'].includes(recipe.prep_effort) ? recipe.prep_effort : 'one-pan',
    meal_types: [recipe.meal_type],
    time_slots: [],
    nutrition_tags: Array.isArray(recipe.nutrition_tags) ? recipe.nutrition_tags : [],
    plant_based: Boolean(recipe.plant_based),
    prep_minutes: Number(recipe.prep_minutes || 0),
    cook_minutes: Number(recipe.cook_minutes || 0),
    servings: Number(recipe.servings || 1),
    instructions: Array.isArray(recipe.instructions) ? recipe.instructions.join('\n') : String(recipe.instructions || ''),
    generated_by: 'gemini',
  };
}
