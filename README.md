# LenDen Bangla

A modern personal money organizer for tracking debt, savings goals, and recurring
bills — built for Bangladesh, in English and Bangla.

Three things, done properly:

- **Debt** — who you owe, who owes you, and the running net balance.
- **Goals** — savings targets for specific things, topped up whenever you like.
- **Monthly Payments** — recurring bills, grouped by upcoming, overdue and paid.

## Stack

React Native (Expo SDK 54) · TypeScript · Expo Router · NativeWind ·
Supabase (Postgres + Auth) · TanStack React Query · Reanimated

Dark mode only, by design. Full English/Bangla localisation including Bangla
numerals, with Inter and Hind Siliguri swapped per language.

## Running it

This app needs a custom dev client — it **will not run in Expo Go**, because
native Google Sign-In isn't bundled there.

```bash
npm install
npx expo start --dev-client
```

First-time setup (database, Google OAuth, the dev build) is in **[SETUP.md](SETUP.md)**.

## Layout

```
src/
  app/          Expo Router routes — (auth) sign-in, (tabs) the four screens
  api/          React Query hooks wrapping Supabase calls
  auth/         Session provider and Google sign-in
  components/   Shared UI
  i18n/         English/Bangla strings, fonts and numerals
  lib/          Supabase client, formatters
  data/         Domain types
supabase/
  schema.sql    Tables, row level security, triggers and RPCs
```
