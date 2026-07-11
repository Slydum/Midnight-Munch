// Starter meal library so the app is useful on first open.
// Pescatarian / plant-based-leaning, wet-market-friendly ingredients.
// Sections: Produce | Seafood | Dry Goods/Pantry | Others
// Slots: pre (dinner before 8PM) | mid (midnight, no-cook/minimal) | post (~6AM light)
// Effort: no-cook | one-pan | batch-cook

export const seedMeals = [
  {
    name: 'Adobong Kangkong with Tofu',
    ingredients: [
      { name: 'kangkong', qty: 2, unit: 'bundle', section: 'Produce' },
      { name: 'tofu', qty: 1, unit: 'block', section: 'Others' },
      { name: 'garlic', qty: 1, unit: 'head', section: 'Produce' },
      { name: 'soy sauce', qty: 0.25, unit: 'cup', section: 'Dry Goods/Pantry' },
      { name: 'vinegar', qty: 0.25, unit: 'cup', section: 'Dry Goods/Pantry' },
    ],
    cost: 90,
    prep_effort: 'one-pan',
    time_slots: ['pre'],
    nutrition_tags: ['protein', 'iron'],
    plant_based: true,
    instructions:
      '1. Press and cube tofu, pan-fry until golden. Set aside.\n2. Sauté garlic, add kangkong stalks first, then leaves.\n3. Add soy sauce + vinegar, simmer 2 min without stirring.\n4. Return tofu, toss, serve.',
  },
  {
    name: 'Ginataang Gulay (Squash & Sitaw in Coconut Milk)',
    ingredients: [
      { name: 'squash (kalabasa)', qty: 0.5, unit: 'kg', section: 'Produce' },
      { name: 'sitaw (string beans)', qty: 1, unit: 'bundle', section: 'Produce' },
      { name: 'coconut milk', qty: 1, unit: 'can', section: 'Dry Goods/Pantry' },
      { name: 'garlic', qty: 0.5, unit: 'head', section: 'Produce' },
      { name: 'onion', qty: 1, unit: 'pc', section: 'Produce' },
    ],
    cost: 110,
    prep_effort: 'batch-cook',
    time_slots: ['pre'],
    nutrition_tags: ['iron'],
    plant_based: true,
    instructions:
      '1. Sauté garlic and onion.\n2. Add squash and coconut milk, simmer 10 min.\n3. Add sitaw, simmer until tender. Season.\nMakes 3-4 servings — good batch-cook for leftovers.',
  },
  {
    name: 'Inihaw na Bangus (Grilled Milkfish)',
    ingredients: [
      { name: 'bangus (milkfish)', qty: 1, unit: 'pc', section: 'Seafood' },
      { name: 'tomato', qty: 2, unit: 'pc', section: 'Produce' },
      { name: 'onion', qty: 1, unit: 'pc', section: 'Produce' },
      { name: 'calamansi', qty: 4, unit: 'pc', section: 'Produce' },
    ],
    cost: 160,
    prep_effort: 'one-pan',
    time_slots: ['pre'],
    nutrition_tags: ['protein', 'omega-3', 'B12'],
    plant_based: false,
    instructions:
      '1. Stuff bangus with tomato and onion.\n2. Grill (or pan-grill) ~10 min per side.\n3. Serve with calamansi + soy dip.',
  },
  {
    name: 'Overnight Oats with Banana & Peanut Butter',
    ingredients: [
      { name: 'rolled oats', qty: 1, unit: 'cup', section: 'Dry Goods/Pantry' },
      { name: 'soy milk', qty: 1, unit: 'cup', section: 'Dry Goods/Pantry' },
      { name: 'banana', qty: 2, unit: 'pc', section: 'Produce' },
      { name: 'peanut butter', qty: 2, unit: 'tbsp', section: 'Dry Goods/Pantry' },
    ],
    cost: 55,
    prep_effort: 'no-cook',
    time_slots: ['mid', 'post'],
    nutrition_tags: ['protein', 'iron'],
    plant_based: true,
    instructions:
      '1. Mix oats + soy milk in a jar the evening before.\n2. Refrigerate.\n3. Top with banana slices + peanut butter when eating.',
  },
  {
    name: 'Tuna & Crackers Snack Plate',
    ingredients: [
      { name: 'canned tuna', qty: 1, unit: 'can', section: 'Dry Goods/Pantry' },
      { name: 'crackers', qty: 1, unit: 'pack', section: 'Dry Goods/Pantry' },
      { name: 'cucumber', qty: 1, unit: 'pc', section: 'Produce' },
    ],
    cost: 70,
    prep_effort: 'no-cook',
    time_slots: ['mid'],
    nutrition_tags: ['protein', 'omega-3', 'B12'],
    plant_based: false,
    instructions: '1. Drain tuna, squeeze calamansi if on hand.\n2. Slice cucumber.\n3. Assemble on crackers. Zero cooking — mid-shift safe.',
  },
  {
    name: 'Chickpea Salad Wrap',
    ingredients: [
      { name: 'canned chickpeas', qty: 1, unit: 'can', section: 'Dry Goods/Pantry' },
      { name: 'tortilla wraps', qty: 2, unit: 'pc', section: 'Dry Goods/Pantry' },
      { name: 'lettuce', qty: 0.5, unit: 'head', section: 'Produce' },
      { name: 'tomato', qty: 1, unit: 'pc', section: 'Produce' },
      { name: 'mayo (vegan ok)', qty: 2, unit: 'tbsp', section: 'Dry Goods/Pantry' },
    ],
    cost: 85,
    prep_effort: 'no-cook',
    time_slots: ['mid', 'post'],
    nutrition_tags: ['protein', 'iron'],
    plant_based: true,
    instructions: '1. Mash chickpeas with mayo.\n2. Load wrap with lettuce, tomato, chickpea mash.\n3. Roll. No stove needed.',
  },
  {
    name: 'Tofu Sisig',
    ingredients: [
      { name: 'tofu', qty: 2, unit: 'block', section: 'Others' },
      { name: 'onion', qty: 2, unit: 'pc', section: 'Produce' },
      { name: 'chili', qty: 3, unit: 'pc', section: 'Produce' },
      { name: 'soy sauce', qty: 3, unit: 'tbsp', section: 'Dry Goods/Pantry' },
      { name: 'calamansi', qty: 4, unit: 'pc', section: 'Produce' },
    ],
    cost: 95,
    prep_effort: 'one-pan',
    time_slots: ['pre'],
    nutrition_tags: ['protein', 'iron'],
    plant_based: true,
    instructions:
      '1. Crumble and fry tofu until crisp.\n2. Add chopped onion + chili.\n3. Season with soy + calamansi. Serve sizzling if you have the plate.',
  },
  {
    name: 'Sardines with Misua Soup',
    ingredients: [
      { name: 'canned sardines', qty: 1, unit: 'can', section: 'Dry Goods/Pantry' },
      { name: 'misua noodles', qty: 1, unit: 'pack', section: 'Dry Goods/Pantry' },
      { name: 'garlic', qty: 0.5, unit: 'head', section: 'Produce' },
      { name: 'pechay', qty: 1, unit: 'bundle', section: 'Produce' },
    ],
    cost: 75,
    prep_effort: 'one-pan',
    time_slots: ['pre', 'post'],
    nutrition_tags: ['protein', 'omega-3', 'B12', 'iron'],
    plant_based: false,
    instructions:
      '1. Sauté garlic, add sardines with sauce.\n2. Add 3 cups water, boil.\n3. Drop misua + pechay, simmer 3 min. Fast, warm post-shift meal.',
  },
  {
    name: 'Peanut Butter Banana Smoothie',
    ingredients: [
      { name: 'banana', qty: 2, unit: 'pc', section: 'Produce' },
      { name: 'soy milk', qty: 1.5, unit: 'cup', section: 'Dry Goods/Pantry' },
      { name: 'peanut butter', qty: 2, unit: 'tbsp', section: 'Dry Goods/Pantry' },
      { name: 'fortified cereal', qty: 0.5, unit: 'cup', section: 'Dry Goods/Pantry' },
    ],
    cost: 50,
    prep_effort: 'no-cook',
    time_slots: ['post'],
    nutrition_tags: ['protein', 'B12'],
    plant_based: true,
    instructions: '1. Blend everything 30 seconds.\n2. Fortified cereal adds B12 — key for the plant-based transition.',
  },
  {
    name: 'Monggo Guisado (Mung Bean Stew)',
    ingredients: [
      { name: 'monggo (mung beans)', qty: 1, unit: 'cup', section: 'Dry Goods/Pantry' },
      { name: 'malunggay leaves', qty: 1, unit: 'bundle', section: 'Produce' },
      { name: 'garlic', qty: 0.5, unit: 'head', section: 'Produce' },
      { name: 'onion', qty: 1, unit: 'pc', section: 'Produce' },
      { name: 'tomato', qty: 2, unit: 'pc', section: 'Produce' },
    ],
    cost: 65,
    prep_effort: 'batch-cook',
    time_slots: ['pre'],
    nutrition_tags: ['protein', 'iron'],
    plant_based: true,
    instructions:
      '1. Boil monggo until soft (~40 min).\n2. Sauté garlic, onion, tomato; combine.\n3. Add malunggay at the end. Batch-cooks well — mark leftovers!',
  },
];
