# 🌙 Midnight Munch

A mobile-first Progressive Web App (PWA) for household meal planning and cooking.

Midnight Munch is a web app, not a native iOS or Android app. It runs in Safari, Chrome, and other modern browsers, and can be added to a phone's home screen.

## Features

- First-run household setup with editable food, routine, appliance and budget preferences.
- Flexible planning preferences: choose days and meal types without a hardcoded work schedule.
- Weekly meal planning and meal generation.
- Consolidated grocery / market list.
- Recipe library and guided Cooking Buddy.
- Household budget tracking and nutrition flags.
- Leftovers, fridge inventory, and meal history.
- Local-first storage with JSON backup and restore.

## Your data

Midnight Munch stores household data in this browser on this device. It does not require an account, cloud service, or internet connection for local data access. Data is not automatically synced to another device.

Use **Household settings → Export backup** regularly. Browser resets, clearing website data, or losing the device can erase local data. Restore a backup from the same settings page.

Grocery budgets and recipe costs are estimates in Philippine pesos (₱) unless updated with actual amounts.

## Install on a phone

**iPhone:** Open the deployed site in Safari, tap Share, then choose **Add to Home Screen**.

**Android:** Open the site in Chrome and choose **Install app** or **Add to Home screen**.

The PWA uses a web app manifest and service worker for its installable app experience and offline app-shell caching.

## Develop

```bash
npm install
npm run dev
```

Create a production build with `npm run build`.

## Deploy

The `.github/workflows/deploy.yml` workflow builds the Vite app and deploys it to GitHub Pages whenever changes are pushed to `main`.
