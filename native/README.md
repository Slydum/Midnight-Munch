# Midnight Munch 2.0 · Native app

This is the Expo / React Native application for iOS and Android. The existing GitHub Pages PWA remains available while the native app is developed in parallel.

## Run locally

```sh
cd native
npm install
npx expo start
```

Install Expo Go on a phone and scan the QR code. For native notifications, keep-awake, and release builds, create an EAS development build.

## Shared data

Copy `.env.example` to `.env` and configure `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` for household sync. Without credentials, data is stored locally on the device. The current shared-link Supabase policy is intentionally unchanged from the web app; anyone with the project URL and anon key can access rows permitted by those open policies. Add household authentication and tighter RLS before public distribution.

## Migration notes

- Original web app remains in the repository root and is not overwritten.
- Recipe seed data, cooking recipes, and meal-generation rules are copied from the existing app without rewriting the recipe content.
- Native screens progressively replace browser-only components with React Native controls.
