# LenDen Bangla — backend setup

The app code is finished. These are the steps only you can do (they need a browser
and your own accounts).

App identity, for reference — these must match everywhere, and are case-sensitive:

| | |
|---|---|
| Package name | `com.LenDenbangla.app` |
| App name | LenDen Bangla |
| Supabase project | `https://fbibeviotzunbyzrnkdb.supabase.co` |

---

## 1. Create the database tables

1. Open <https://supabase.com/dashboard> → your project → **SQL Editor**.
2. Open `supabase/schema.sql` from this repo, copy the whole file, paste it in, click **Run**.
3. Go to **Table Editor** and confirm you see: `profiles`, `debts`, `debt_payments`, `goals`, `bills`.

---

## 2. Google OAuth — Web client

<https://console.cloud.google.com> → APIs & Services → Credentials.

**Consent screen** (if not done): User type **External**, fill in app name and your
email, add yourself under **Test users**.

**Create OAuth client ID** → Application type **Web application**:
- Authorized redirect URI: `https://fbibeviotzunbyzrnkdb.supabase.co/auth/v1/callback`
- Save, then copy the **Client ID** and **Client secret**.

---

## 3. Connect Google to Supabase

Supabase dashboard → **Authentication** → **Providers** → **Google** → enable →
paste the **Web** client ID and secret from step 2 → Save.

---

## 4. Put the Web client ID in .env

```
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=<the Web client ID from step 2>
```

Same value you gave Supabase. `.env` is gitignored, so it stays on your machine.

---

## 5. Build locally with Android Studio

You have Android Studio, so you don't need EAS cloud builds — local is faster and
has no build queue.

**One-time environment setup.** In PowerShell:

```powershell
setx ANDROID_HOME "$env:LOCALAPPDATA\Android\Sdk"
setx JAVA_HOME "C:\Program Files\Android\Android Studio\jbr"
```

Close and reopen your terminal afterwards so the variables take effect.

**Connect a device.** Either:
- Plug in your phone with **USB debugging** enabled (Settings → Developer options), or
- Start an emulator from Android Studio → Device Manager.

Confirm it's detected:

```bash
adb devices
```

**Build and install:**

```bash
npx expo run:android
```

First run takes 10–20 minutes (Gradle downloads a lot). It generates an `android/`
folder — gitignored, and safe to delete since it regenerates from `app.json`.

After that first build, day to day you only need:

```bash
npx expo start --dev-client
```

Rebuild only when you add another native module. JS and UI changes still hot-reload.

> Expo Go **cannot** run this app — native Google Sign-In isn't bundled in it.

---

## 6. Register your debug SHA-1 with Google

**This comes after the first build, not before** — the debug keystore doesn't exist
until Gradle creates it.

Local debug builds are signed with Android's *debug* keystore, which is a different
key from the one EAS uses. Google checks the signature, so it needs this fingerprint
or sign-in fails.

Get the fingerprint:

```powershell
& "C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe" -list -v `
  -keystore "$env:USERPROFILE\.android\debug.keystore" `
  -alias androiddebugkey -storepass android -keypass android
```

Copy the **SHA1** line (looks like `A1:B2:C3:…`).

Then Google Cloud Console → Credentials → **Create OAuth client ID**:
- Application type: **Android**
- Package name: `com.LenDenbangla.app`
- SHA-1: the fingerprint you just copied
- Save.

No rebuild needed — Google validates this server-side, so sign-in starts working
within a minute or two.

> A release build (Play Store or EAS) uses a *different* key again. When you get
> there, create another Android OAuth client with the same package name and that
> key's SHA-1. One client per fingerprint; they coexist fine.

---

## Checking it worked

1. Open the app → you should land on the **sign-in screen**.
2. Tap **Continue with Google** → pick your account.
3. You should land on the Debt tab with empty states everywhere — correct, new accounts start empty.
4. Supabase → Table Editor → `profiles` — confirm a row appeared with your real name and email.
5. Add a debt, a goal and a bill. Confirm each appears in the matching Supabase table with your `user_id`.
6. Force-quit and reopen — still signed in, data still there.
7. Profile → Log Out → back to the sign-in screen.
8. Profile → Language → বাংলা. All text and numbers should switch.

---

## Troubleshooting

**"Google Sign-In is not configured yet"** — `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` is
missing from `.env`. Add it, then restart with `npx expo start --dev-client --clear`.
Env vars are baked in at bundle time, so a plain reload won't pick it up.

**Sign-in sheet opens, then fails immediately** — almost always a SHA-1 mismatch
(step 6) or a package-name mismatch. Both are case-sensitive: it must be exactly
`com.LenDenbangla.app` in Google Cloud and in `app.json`.

**`npx expo run:android` can't find the SDK** — `ANDROID_HOME` isn't set, or the
terminal wasn't restarted after `setx`.

**Gradle fails with a Java version error** — `JAVA_HOME` is pointing at an old JDK.
Point it at Android Studio's bundled one as shown in step 5.

**Data saves but doesn't appear** — check the RLS policies from step 1 actually ran.
Supabase → Table Editor → the table → RLS should say enabled, with policies listed.
