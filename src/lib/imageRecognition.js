// Fridge photo -> detected ingredient list.
//
// Provider: Clarifai's food-item-recognition model when VITE_CLARIFAI_PAT is
// set (a free-tier Personal Access Token works). Without a key the feature
// degrades gracefully: the UI tells the user detection is unavailable and
// drops straight into manual entry.
//
// Detection is never auto-trusted — results always go through the
// confirm/edit step in the FridgeScan UI, because photos hide items behind
// other items and quantities can't be judged reliably.

const CLARIFAI_PAT = import.meta.env.VITE_CLARIFAI_PAT;

export const recognitionAvailable = Boolean(CLARIFAI_PAT);

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * @param {File} file image file from <input type="file" capture>
 * @returns {Promise<Array<{name: string, confidence: number}>>}
 */
export async function detectIngredients(file) {
  if (!CLARIFAI_PAT) {
    throw new Error(
      'Image recognition is not configured. Add VITE_CLARIFAI_PAT to enable fridge photo detection, or enter ingredients manually.'
    );
  }
  const base64 = await fileToBase64(file);
  const res = await fetch(
    'https://api.clarifai.com/v2/models/food-item-recognition/outputs',
    {
      method: 'POST',
      headers: {
        Authorization: `Key ${CLARIFAI_PAT}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_app_id: { user_id: 'clarifai', app_id: 'main' },
        inputs: [{ data: { image: { base64 } } }],
      }),
    }
  );
  if (!res.ok) throw new Error(`Image recognition failed (${res.status})`);
  const data = await res.json();
  const concepts = data.outputs?.[0]?.data?.concepts || [];
  return concepts
    .filter((c) => c.value >= 0.5)
    .map((c) => ({ name: c.name, confidence: c.value }));
}

// "What can I make with what I have": rank library meals by how many of
// their ingredients match the confirmed fridge list.
export function matchMealsToIngredients(meals, fridgeIngredients) {
  const have = fridgeIngredients.map((n) => n.trim().toLowerCase()).filter(Boolean);
  return meals
    .map((meal) => {
      const needed = (meal.ingredients || []).map((i) => i.name.toLowerCase());
      const matched = needed.filter((n) => have.some((h) => n.includes(h) || h.includes(n)));
      return {
        meal,
        matched,
        missing: needed.filter((n) => !matched.includes(n)),
        score: needed.length ? matched.length / needed.length : 0,
      };
    })
    .filter((r) => r.matched.length > 0)
    .sort((a, b) => b.score - a.score);
}
