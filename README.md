# 🌙 Midnight Munch

A shared household meal planner and cooking companion for two people working around night-shift schedules.

The app supports meal planning, a consolidated market list, a meal library, budget tracking, nutrition flags, leftovers, fridge inventory, history, and a guided Cooking Buddy.

## Cooking Buddy

- 14 guided Filipino household dinner recipes.
- Ingredient checklist with serving-size scaling.
- Step-by-step cooking instructions.
- Individual countdown timers, pause/resume, reset, and +1 minute.
- Timer completion vibration and optional browser notification (when permission is already granted).
- Screen wake lock where the browser supports it.
- Shared active recipe, step, ingredient checklist, and timer state when Supabase is connected.

## PWA

The app includes a web app manifest, service worker, offline app-shell caching, and mobile home-screen metadata. On iPhone, open the deployed site in Safari, tap Share, then Add to Home Screen. On Android, use the browser's Install app option.

## Development

```bash
npm install
npm run dev
```

Without Supabase credentials, the app uses local device storage for demo mode. For two-device live sync, configure a dedicated Supabase project.

## Shared Supabase setup

1. Create a dedicated Supabase project for Midnight Munch. Do not reuse a database that contains unrelated application data.
2. Run `supabase/schema.sql` in the new project's SQL Editor.
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as GitHub Actions repository secrets.
4. Push to `main`; GitHub Actions builds and deploys to GitHub Pages.
5. Share the deployed URL with your household.

**Access note:** This version uses a shared-link access model without accounts. Anyone who obtains the app URL can read and edit its shared data. Do not store sensitive personal information in it.

## Optional integrations

Recipe search can use TheMealDB by default, with optional Google Custom Search credentials. Fridge photo recognition can be enabled with a Clarifai token.
