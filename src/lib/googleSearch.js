// Recipe search is proxied through Cloudflare so provider credentials stay server-side.
const API_URL = import.meta.env.VITE_MEAL_API_URL || "https://midnight-munch-api.yuripremiums.workers.dev";
export const searchProvider = "tavily";
export async function searchRecipes(query) {
  const clean = String(query || "").trim();
  if (!clean) return [];
  const response = await fetch(`${API_URL}/search-recipes`, {
    method: "POST", mode: "cors", credentials: "omit", cache: "no-store",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify({ query: clean, limit: 8 }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || `Recipe search failed (${response.status}).`);
  return Array.isArray(payload.results) ? payload.results : [];
}
