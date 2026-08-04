# LenDen Bangla — Google Play production readiness audit

Audited 4 August 2026 against the code at commit `b662a0d`.

**Verdict: not shippable yet.** Five hard blockers, all fixable. The architecture
and data security are sound — the gaps are in Play policy compliance, production
hardening and store assets, not in how the app is built.

Legend for **Fix by**: 🤖 Claude can do it · 👤 you must do it · 🤝 both

---

## Summary

| Severity | Count | Theme |
|---|---|---|
| 🔴 Critical | 5 | Play policy blockers — rejection or takedown |
| 🟠 High | 8 | Crashes, security, rejection risk |
| 🟡 Medium | 9 | Quality, bloat, maintainability |
| 🟢 Low | 5 | Polish |

The single most important finding is **#1 — account deletion**. Google has
enforced this since 2023 and it is an automatic rejection for any app with
account creation.

---

# 🔴 Critical

### 1. No account deletion — Play policy violation
**Fix by: 🤝** (I build it, you add the web URL in Play Console)

Google's User Data policy requires any app that lets users create an account to
also let them **delete** it — both from inside the app *and* via a publicly
reachable web URL you declare in Play Console. The app has Google sign-in and
creates a `profiles` row, but Profile only offers Log Out.

This is an automatic rejection, not a warning.

**Fix:** add a "Delete account" flow that removes the auth user and cascades all
their rows (schema already has `on delete cascade`, so a single auth-user delete
wipes everything). Needs a Supabase Edge Function or RPC with elevated rights,
since clients cannot delete from `auth.users` directly. Plus a hosted deletion
page for the Console field.

### 2. Ships with Expo's default app icon
**Fix by: 👤** (design) — 🤖 can wire it once you supply the file

`assets/images/icon.png` and the adaptive icon layers are still Expo's stock
artwork. Shipping another company's logo is both a rejection and a trademark
problem. The adaptive background is also `#E6F4FE`, a pale blue that clashes
badly with the app's near-black theme.

**Fix:** supply a 1024×1024 icon plus adaptive foreground/background; I'll wire
them into `app.json` and set the background to the brand colour.

### 3. No privacy policy
**Fix by: 👤**

Mandatory: the app collects name, email, profile photo and financial records.
Required as a URL in Play Console *and* linked in-app. Note the Profile screen
already has a "Privacy & Security" row that currently does nothing — that's the
natural place to link it.

**Fix:** publish a policy covering what's collected (identity + financial),
that it's stored on Supabase, that it isn't sold or shared, and how to request
deletion.

### 4. Three unjustified sensitive permissions ship to production
**Fix by: 🤖**

`android/app/src/main/AndroidManifest.xml` requests:

- `SYSTEM_ALERT_WINDOW` — "display over other apps", a permission Play scrutinises hard
- `READ_EXTERNAL_STORAGE`
- `WRITE_EXTERNAL_STORAGE`
- `VIBRATE`

The app uses **none** of them. They come from Expo's prebuild defaults and the
dev-client tooling. Requesting storage and overlay permissions in a finance app
with no matching feature invites both rejection and user distrust.

**Fix:** declare `android.blockedPermissions` in `app.json` so prebuild strips
them, leaving only `INTERNET`.

### 5. Release signing not configured
**Fix by: 👤**

Only the shared React Native **debug** keystore exists
(`5E:8F:16:…`) — its private key ships publicly with every RN project. A release
build signed with it would be trivially forgeable, and Play rejects it outright.

**Fix:** generate a real upload keystore (or let EAS manage one via
`eas credentials`), then register that key's SHA-1 as a **third** Android OAuth
client so Google sign-in keeps working in production. Enable Play App Signing.

---

# 🟠 High

### 6. No error boundary anywhere
**Fix by: 🤖**

Zero `ErrorBoundary` / `componentDidCatch` in the codebase. In React Native a
render error unmounts the whole tree — in a release build that's a blank screen
with no way out but force-quit. Any unexpected API shape from Supabase does this.

**Fix:** add an `ErrorBoundary` at the root with a friendly retry screen.

### 7. `allowBackup="true"` exposes session tokens
**Fix by: 🤖**

The manifest allows Android auto-backup. Supabase refresh tokens live in
AsyncStorage, so they get copied into Google Drive backups and can be pulled via
`adb backup` on some devices. A stolen refresh token is a full account takeover.

**Fix:** set `allowBackup: false` for this app, or exclude the auth storage.

### 8. Six visibly broken buttons
**Fix by: 🤝**

Play rejects apps for "broken or non-functional" UI. Currently inert:

| Where | Control |
|---|---|
| Profile | Privacy & Security |
| Profile | Help & Support |
| Profile | Notifications toggle (flips, saves nothing) |
| Bills | "Pay now" |
| Debt detail | "Add Payment" |
| Debt detail | "Remind" |

The notifications toggle is the worst — it implies a setting is being saved when
nothing is.

**Fix:** either implement, or remove/disable for v1. Recommend: wire Privacy to
your policy URL, Help to an email link, remove the notifications toggle and the
three unimplemented actions until they do something.

### 9. No offline or network-failure handling
**Fix by: 🤖**

No NetInfo, no `onlineManager` wiring, no offline banner. React Query is set to
`retry: 1`, so on a flaky connection users get a bare "Something went wrong" with
no indication the problem is their network. Common in Bangladesh's mobile data
conditions — this will be a frequent 1-star complaint.

**Fix:** wire NetInfo into React Query's `onlineManager`, add an offline banner,
and distinguish network errors from real failures.

### 10. Zero accessibility support
**Fix by: 🤖**

No `accessibilityLabel`, `accessibilityRole` or `accessibilityHint` anywhere.
The bottom nav, all icon-only buttons and the sign-in button are unlabelled — a
TalkBack user hears "button" with no idea what it does. Play surfaces
accessibility issues in pre-launch reports.

**Fix:** add labels and roles to every interactive element, driven off the
existing i18n strings so they translate too.

### 11. Touch target below the 48dp minimum
**Fix by: 🤖**

Bills' "Pay now" chip is `px-2 py-0.5` — roughly 20dp tall, well under Google's
48dp minimum. Hard to hit, flagged by pre-launch reports.

### 12. `debt_payments` RLS allows cross-debt writes
**Fix by: 🤖**

The policy checks `auth.uid() = user_id` but never verifies that `debt_id`
belongs to the caller. A user could insert a payment against **someone else's**
debt row while passing their own `user_id`. Currently unexploitable — the table
is unused — but it's a latent hole that becomes real the moment "Add Payment"
ships.

**Fix:** add a `with check` that confirms the parent debt is owned by the caller.

### 13. `versionCode` is hardcoded to 1
**Fix by: 🤖**

`android/app/build.gradle` pins `versionCode 1`, but `eas.json` sets
`appVersionSource: "remote"`. Every Play upload needs a higher `versionCode` than
the last; a hardcoded 1 means your second upload is rejected.

---

# 🟡 Medium

### 14. Web-only dependencies ship in the Android bundle
`react-dom` and `react-native-web` are production dependencies but the app is
Android-only. Dead weight in the bundle. (Verify Expo Router doesn't need them at
build time before removing — worth testing.) **🤖**

### 15. `expo-dev-client` in production dependencies
Development tooling listed as a runtime dependency. It's the source of the
overlay/storage permissions in #4. **🤖**

### 16. Eight unused template assets
`react-logo@{,2x,3x}.png`, `expo-badge{,-white}.png`, `expo-logo.png`,
`tutorial-web.png`, `logo-glow.png` — none referenced by any source file.
Roughly 450 KB of dead assets in the APK. **🤖**

### 17. Profile fires three queries for three numbers
`profile.tsx` calls `useDebts()`, `useGoals()` and `useBills()` purely to display
counts. Usually served from cache, but on a cold open to Profile it's three
round-trips to render three integers. **🤖**

### 18. No crash reporting
No Sentry or equivalent. Once live you'll have no visibility into production
crashes beyond Play's limited console reports. **🤝**

### 19. No `expo-updates` / OTA channel
`expo.modules.updates.ENABLED=false`. Every JS fix requires a full store review.
For a v1 that's defensible, but worth deciding deliberately. **🤝**

### 20. Duplicate `cancel` string in i18n
Defined in both `common.cancel` and `profile.cancel` with identical values. **🤖**

### 21. Screens are large
`bills.tsx` ~350 lines, `debt.tsx` ~300, `goals.tsx` ~340 — each holds list
rendering, a create form and a detail sheet. Works, but the forms are the obvious
extraction candidates as features grow. **🤖**

### 22. No tests
Zero test files. For a finance app, the money-math (net balance, goal progress,
overdue derivation) is worth covering. **🤖**

---

# 🟢 Low

### 23. `formatDate` returns hardcoded English
`'Today'`, `'Yesterday'`, `` `${n} days ago` `` are English regardless of
language. Bangla users see English relative dates. **🤖**

### 24. Deadline formatting bypasses i18n
Goals uses `toLocaleDateString('en-US', …)` directly, so months stay English in
Bangla mode. **🤖**

### 25. `predictiveBackGestureEnabled: false`
Opts out of Android 14+ predictive back. Fine, but reconsider. **🤖**

### 26. No `android:localeConfig`
The app supports two languages but doesn't declare them, so Android 13+ per-app
language settings won't show it. **🤖**

### 27. Splash screen icon is Expo's
`splash-icon.png` is still stock. **👤**

---

# What only you can do

Nothing in this section can be verified or completed from the repository.

| Item | Notes |
|---|---|
| **Privacy Policy URL** | Required. Must be publicly reachable, no login. |
| **Account deletion URL** | Required alongside the in-app flow (#1). |
| **Data Safety form** | Declare: name, email, photo, financial info; encrypted in transit; deletable on request. Must match the policy exactly — mismatches trigger takedowns. |
| **App icon** | 512×512 PNG for the listing + 1024×1024 source for adaptive layers. |
| **Feature graphic** | 1024×500. Mandatory. |
| **Screenshots** | Minimum 2, phone. Recommend 4–6 covering all four tabs. |
| **Store listing** | Title (≤30), short description (≤80), full description (≤4000). Consider Bangla localisation given the audience. |
| **Content rating** | IARC questionnaire. Finance app, no objectionable content → expect Everyone. |
| **Target audience** | Declare 18+ to avoid Families policy obligations. |
| **Upload keystore** | See #5. Enable Play App Signing. |
| **Production OAuth client** | Third Android client for the release SHA-1. |
| **Google OAuth verification** | Consent screen is currently in Testing — only your test users can sign in. Must publish, and if you request sensitive scopes, pass verification. **Easy to miss: without this, everyone but your test accounts is locked out.** |
| **Supabase production hardening** | Enable PITR/backups, set auth rate limits, restrict the Google provider to your real client IDs. |
| **Closed testing** | Play now requires ~12 testers for 14 days before a personal developer account can go to production. |

---

# Suggested order

1. **Fix everything marked 🤖** — permissions, backup flag, error boundary, offline, accessibility, RLS, versionCode, dead assets. (~half a day, no external dependencies)
2. **Build account deletion** (#1) — the biggest single blocker.
3. **You:** icon, privacy policy, deletion page.
4. **You:** upload keystore + production OAuth client.
5. **You:** store listing, screenshots, Data Safety form.
6. Closed testing track, 12 testers, 14 days.
7. Production.

Realistically 1–2 weeks, dominated by the 14-day testing requirement rather than
engineering.
