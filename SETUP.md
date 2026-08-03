# Khoroch — backend setup

The app code is finished. These are the steps only you can do (they need a browser
and your own accounts). **Do them in this order** — later steps depend on earlier ones.

---

## 1. Create the database tables

1. Open <https://supabase.com/dashboard> → your project → **SQL Editor**.
2. Open `supabase/schema.sql` from this repo, copy the whole file, paste it in, click **Run**.
3. Go to **Table Editor** and confirm you now see: `profiles`, `debts`, `debt_payments`, `goals`, `bills`.

You can do this step right now — nothing else blocks it.

---

## 2. Set up EAS and generate your signing key

Google needs a fingerprint from your app's signing key, and that key doesn't exist
until EAS makes one. So this comes *before* the Google setup.

```bash
npm install -g eas-cli     # once, if you don't have it
eas login                  # create a free Expo account if needed
eas build:configure        # choose Android
eas credentials            # Android → production → Keystore → view details
```

From `eas credentials`, copy the **SHA-1 Certificate Fingerprint**. It looks like
`AB:CD:EF:12:...`. Keep it handy for the next step.

---

## 3. Create Google OAuth clients

Go to <https://console.cloud.google.com> → create a project (or pick one).

**a) Configure the consent screen** (APIs & Services → OAuth consent screen)
- User type: **External**
- Fill in app name, your email. Add yourself under **Test users**.

**b) Create the Web client** (APIs & Services → Credentials → Create Credentials → OAuth client ID)
- Application type: **Web application**
- Under **Authorized redirect URIs** add:
  `https://fbibeviotzunbyzrnkdb.supabase.co/auth/v1/callback`
- Save. Copy the **Client ID** and **Client secret**.

**c) Create the Android client**
- Application type: **Android**
- Package name: `com.khoroch.app`
- SHA-1: paste the fingerprint from step 2
- Save. (You don't need to copy anything from this one — it just authorises your app.)

---

## 4. Connect Google to Supabase

1. Supabase dashboard → **Authentication** → **Providers** → **Google**.
2. Toggle it **on**.
3. Paste the **Web** client ID and client secret from step 3b (not the Android one).
4. Save.

---

## 5. Put the Web client ID in your .env

Open `.env` in this repo and fill in the blank:

```
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=<paste the Web client ID from step 3b>
```

It's the same Web client ID you gave Supabase. `.env` is gitignored, so it stays local.

---

## 6. Build the dev client and install it

Expo Go **cannot** run this app any more — native Google Sign-In isn't included in it.
You need your own build, once:

```bash
eas build --profile development --platform android
```

Takes ~15 minutes in the cloud. When it finishes, EAS gives you a QR code / link —
open it on your phone and install the APK.

From now on, start the dev server with:

```bash
npx expo start --dev-client
```

(not plain `npx expo start`). You only need to rebuild the APK if you add another
native module — normal JS/UI changes still hot-reload as before.

---

## Checking it worked

1. Open the app → you should land on the **sign-in screen**.
2. Tap **Continue with Google** → pick your account.
3. You should land on the Debt tab, with empty states everywhere (this is correct — new accounts start empty).
4. In the Supabase dashboard → Table Editor → `profiles`, confirm a row appeared with your real name and email.
5. Add a debt, a goal and a bill in the app. Confirm each shows up in the matching Supabase table with your `user_id`.
6. Force-quit the app and reopen it — you should still be signed in, and your data should still be there.
7. Profile tab → Log Out → you should return to the sign-in screen.

---

## Troubleshooting

**"Google Sign-In is not configured yet"** — `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` is
missing from `.env`. Add it, then restart with `npx expo start --dev-client --clear`
(env vars are baked in at bundle time, so a plain reload won't pick it up).

**Sign-in sheet opens then immediately fails** — the SHA-1 in your Android OAuth
client doesn't match your build's keystore. Re-check `eas credentials`.

**"Not signed in" errors when saving** — the session expired. Log out and back in.

**Data saves but doesn't appear** — check RLS policies actually ran in step 1.
In Supabase → Table Editor → the table → RLS should say "enabled" with policies listed.
