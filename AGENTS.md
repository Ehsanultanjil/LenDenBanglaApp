# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

# Khoroch mobile app

This IS the Khoroch app — a React Native/Expo rewrite of an earlier Vite web prototype (no longer in this repo). Build/improve directly on this codebase.

Do not redesign the architecture unless absolutely necessary. Work with the existing codebase and improve it.

**Scope is deliberately narrow — 3 features only, plus a Profile tab:**
1. **Debt** (`src/app/(tabs)/debt.tsx`) — who you owe / who owes you.
2. **Goals** (`src/app/(tabs)/goals.tsx`) — savings toward specific items (e.g. MacBook, trip).
3. **Bills / "Monthly Payments"** (`src/app/(tabs)/bills.tsx`) — upcoming recurring payments.
4. **Profile** (`src/app/(tabs)/profile.tsx`) — minimal summary only.

Everything else from the original design (Home dashboard, Transactions, Analytics/charts, Accounts, Budget, Settings, Notifications, Search, Onboarding, Add-Transaction) was **intentionally deleted** per explicit user request — do not re-add any of it without being asked. `mockData.ts` was trimmed to only `Debt`/`Bill`/`Goal` types+data — don't reintroduce the removed types/arrays casually.

## Tech stack
- Framework: React Native + Expo SDK (latest stable)
- Language: TypeScript
- Navigation: Expo Router
- Styling: NativeWind (Tailwind CSS)
- Backend: Supabase (Postgres) — **wired**. Client in `src/lib/supabase.ts`, schema in `supabase/schema.sql`. Storage not used yet.
- Auth: Supabase Auth + native Google Sign-In — **wired**. `src/auth/AuthProvider.tsx`.
- Server state: TanStack React Query — **wired**. Hooks in `src/api/{debts,goals,bills}.ts`.
- State management: Zustand — **not used**. React Query holds server state; there is no meaningful client state left, so Zustand was deliberately skipped.
- Forms: React Hook Form — **not used**. Forms are small enough with plain `useState`.
- Animations: React Native Reanimated, React Native Gesture Handler, Moti (if already installed)
- Icons: Lucide React Native
- Charts: Victory Native XL (`victory-native` + `@shopify/react-native-skia`)
- Lists: `@shopify/flash-list` (FlashList) instead of FlatList where appropriate
- Fonts: Inter (English) + Hind Siliguri (Bangla), switched by `src/i18n/LanguageProvider.tsx`

Current phase: **backend wired**. `src/data/mockData.ts` is gone — all data comes from Supabase.
Domain types live in `src/data/types.ts`, formatters in `src/lib/format.ts`.

**This app no longer runs in Expo Go** — native Google Sign-In requires a custom dev
client. Run `npx expo start --dev-client`. See `SETUP.md` for the one-time build and
Google/Supabase dashboard configuration.

Still deliberately unimplemented (dead buttons, do not wire without being asked):
"Pay now", "Add Payment", "Remind", edit/delete for any entity, Privacy & Security,
Help & Support, the notifications toggle. `debt_payments` exists in the schema but stays
empty until "Add Payment" is built.

## Development rules
- Use TypeScript everywhere.
- Reuse existing components whenever possible, keep components modular.
- Do not duplicate code — extract shared patterns (see `src/components/`).
- Follow the current folder structure: `src/app` (Expo Router routes), `src/components` (shared UI), `src/api` (React Query hooks + Supabase calls), `src/auth`, `src/lib` (supabase client, formatters), `src/data` (domain types), `src/i18n`, `src/hooks`.
- All user-facing text must go through `src/i18n/translations.ts` with **both** `en` and `bn` entries — the `AppStrings` interface enforces this.
- Use the font-aware `Text`/`TextInput` from `src/components/AppText.tsx`, never the raw React Native ones, or Bangla renders in the wrong font.
- Every table has RLS scoped to `auth.uid()`. The anon key ships in the bundle, so RLS is the only thing protecting data — never add a table without policies.
- Do not introduce unnecessary dependencies; if a better library is needed, explain why before using it.
- Optimize re-renders, keep performance in mind.
- Support both Android and iOS.
- Dark mode is the primary (currently only) design target — see `tailwind.config.js` for tokens.
- Reusable design tokens (colors, spacing, typography, shadows, border radius) live in `tailwind.config.js`.
