# 🌙 Midnight Munch

A mobile-first Progressive Web App (PWA) for household meal planning and cooking.

Midnight Munch is a web app, not a native iOS or Android app. It runs in Safari, Chrome, and other modern browsers, and can be added to a phone's home screen.

## Features

- Weekly meal planning and meal generation.
- Consolidated grocery / market list.
- Recipe library and guided Cooking Buddy.
- Household budget tracking and nutrition flags.
- Leftovers, fridge inventory, and meal history.
- Local-device demo mode, with optional Supabase sync between devices.

## Install on a phone

**iPhone:** Open the deployed site in Safari, tap Share, then choose **Add to Home Screen**.

**Android:** Open the site in Chrome and choose **Install app** or **Add to Home screen**.

The PWA uses a web app manifest and service worker for its installable app experience and offline app-shell caching.

## Develop

```bash
npm install
npm run dev
```

Create a production build with:

```bash
npm run build
```

## Deploy

The `.github/workflows/deploy.yml` workflow builds the Vite app and deploys it to GitHub Pages whenever changes are pushed to `main`.

For shared household sync, create a dedicated Supabase project, run `supabase/schema.sql`, and add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as GitHub Actions repository secrets.

Without Supabase credentials, the app uses local device storage. The shared-link access model does not provide user accounts, so do not store sensitive personal information.

## Optional integrations

Recipe search can use TheMealDB by default, with optional Google Custom Search credentials. Fridge photo recognition can be enabled with a Clarifai token.
