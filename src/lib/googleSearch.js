// Live recipe search for the Meal Library.
//
// Two providers, picked automatically:
//   1. Google Programmable Search (Custom Search JSON API) when
//      VITE_GOOGLE_API_KEY + VITE_GOOGLE_CSE_ID are configured — real Google
//      results scoped to recipe sites.
//   2. TheMealDB (free, no key) as the out-of-the-box fallback so the search
//      feature works immediately.
//
// Both return the same shape:
//   { title, source, url, thumbnail, ingredients?, instructions? }
// TheMealDB results come with full ingredients/instructions, so they can be
// saved straight into the library; Google results save name+link and the
// user fills in details.

const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const GOOGLE_CX = import.meta.env.VITE_GOOGLE_CSE_ID;

export const searchProvider = GOOGLE_KEY && GOOGLE_CX ? 'google' : 'themealdb';

async function searchGoogle(query) {
  const url =
    `https://www.googleapis.com/customsearch/v1?key=${encodeURIComponent(GOOGLE_KEY)}` +
    `&cx=${encodeURIComponent(GOOGLE_CX)}&q=${encodeURIComponent(query + ' recipe')}&num=8`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Google search failed (${res.status})`);
  const data = await res.json();
  return (data.items || []).map((item) => ({
    title: item.title,
    source: item.displayLink,
    url: item.link,
    thumbnail: item.pagemap?.cse_thumbnail?.[0]?.src || null,
    ingredients: null,
    instructions: null,
  }));
}

async function searchTheMealDb(query) {
  const res = await fetch(
    `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`
  );
  if (!res.ok) throw new Error(`Recipe search failed (${res.status})`);
  const data = await res.json();
  return (data.meals || []).map((m) => {
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const name = m[`strIngredient${i}`];
      const measure = m[`strMeasure${i}`];
      if (name && name.trim()) {
        ingredients.push({ name: name.trim(), qty: 1, unit: (measure || '').trim(), section: 'Others' });
      }
    }
    return {
      title: m.strMeal,
      source: 'TheMealDB',
      url: m.strSource || m.strYoutube || `https://www.themealdb.com/meal/${m.idMeal}`,
      thumbnail: m.strMealThumb ? `${m.strMealThumb}/preview` : null,
      ingredients,
      instructions: m.strInstructions || '',
    };
  });
}

export async function searchRecipes(query) {
  if (!query.trim()) return [];
  if (searchProvider === 'google') return searchGoogle(query);
  return searchTheMealDb(query);
}
