# 🌙 Midnight Munch

A shared meal-planning web app for two people working around a night-shift schedule (8PM–6AM).
It answers three questions at once with minimal input: **what do we eat, what does it cost, and are we
covering our nutrition gaps** during a pescatarian → plant-based transition.

No accounts, no login — access is the shared link itself. Both of you can edit everything, and
changes sync live between devices via Supabase Realtime.

## Features

- **One-tap weekly plan** — 7 days × 3 night-shift slots (pre-shift dinner, no-cook midnight meal,
  light ~6AM meal), balanced for nutrition *across the week*, kept under your budget ceiling, and
  avoiding repeats within a 10-day cooldown (configurable).
- **Tweak after generating** — swap any meal, lock (🔒) the keepers, regenerate a day or the whole
  week. Budget and nutrition re-check live as you tweak.
- **Market list** — auto-built from the plan, ingredients consolidated across meals, grouped by wet
  market section (Produce / Seafood / Dry Goods / Others). Checkboxes work **offline** and sync back
  when signal returns.
- **Meal library** — add your own meals (ingredients, cost, effort, slots, nutrition tags, cooking
  steps) or search recipes online and save them in.
- **Fridge scan** — photo → detected ingredients → *you confirm/correct the list* → "what can I make
  with what I have".
- **Budget tracker** — you set the weekly ceiling; the app learns from past weeks and *suggests*
  adjustments (never applies them without your OK).
- **Nutrition flags** — simple weekly-average badges for protein, B12, iron, omega-3. No calorie
  counting.
- **Leftover tracking** — mark batch-cooked meals as "made extra"; leftovers get suggested first for
  upcoming slots at ₱0.
- **Saved weeks** — a week that worked becomes a reusable named template.
- **History** — past weeks with meals, spend, and nutrition flags.
- **Light & dark mode** — cream by day, deep forest green for the mid-shift hours.
- **Your "why"** — a personal, editable note on the dashboard; plant-based meals get a quiet 🌱.

## Getting started

```bash
npm install
npm run dev
```

Without any configuration the app runs in **demo mode** (device-only storage) so you can try
everything immediately. For the real shared setup:

### 1. Supabase (shared data + live sync)

1. Create a free project at [supabase.com](https://supabase.com).
2. Paste `supabase/schema.sql` into the SQL editor and run it.
3. Copy `.env.example` to `.env` and fill `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`
   (Project Settings → API).
4. Deploy anywhere static (Vercel/Netlify/Cloudflare Pages) with those env vars, and share the URL —
   that URL *is* the shared access.

> Sync conflicts use last-write-wins, which is fine for two people; the realtime feed means you see
> each other's edits within a second or two anyway.

### 2. Recipe search (optional)

Works out of the box via TheMealDB (free, includes full ingredients + steps). For real Google
results, create a [Programmable Search Engine](https://programmablesearchengine.google.com/) and a
Custom Search JSON API key, then set `VITE_GOOGLE_API_KEY` and `VITE_GOOGLE_CSE_ID`.

### 3. Fridge photo recognition (optional)

Set `VITE_CLARIFAI_PAT` (a free [Clarifai](https://clarifai.com) Personal Access Token) to enable
photo detection with the `food-item-recognition` model. Without it, the fridge page still works via
manual entry. Detection is never auto-trusted — you always confirm the list.

## Project structure

```
src/
├── components/       # one feature = one folder
│   ├── mealplan/     # week grid, meal cards, swap/lock/regenerate
│   ├── grocerylist/  # market list + checkboxes
│   ├── meallibrary/  # library CRUD + recipe search
│   ├── fridgescan/   # photo upload + confirm/edit detected items
│   ├── budget/       # ceiling, running total, suggestions
│   ├── nutrition/    # weekly-average flags
│   ├── dashboard/    # mantra card
│   └── shared/       # buttons, modal, badges, progress bar
├── lib/              # business logic, no UI
│   ├── supabase.js       # data layer: Supabase + realtime + offline queue + demo fallback
│   ├── mealGenerator.js  # plan generation (budget/nutrition/cooldown/leftovers)
│   ├── groceryBuilder.js # ingredient consolidation + market sections
│   ├── googleSearch.js   # recipe search providers
│   ├── imageRecognition.js # fridge photo detection + "what can I make"
│   ├── seedMeals.js      # starter library
│   └── useData.js        # React hooks over the data layer
├── pages/            # Dashboard, Plan, Groceries, Library, Fridge, History
└── styles/           # theme.js (all design tokens) + global.css
```

## Design

Warm Botanical / Harvest palette: olive `#606C38`, forest `#283618`, cream `#FEFAE0`,
tan `#DDA15E`, rust `#BC6C25` — all centralized in `src/styles/theme.js`.
