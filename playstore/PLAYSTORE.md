# Play Store deployment — Travel Helper (TWA via Bubblewrap)

The app ships to Google Play as a **Trusted Web Activity**: a thin Android wrapper
around the live PWA. The web app stays the single source of truth — every push to
Pages updates the installed app instantly, no store review needed for content.

## Status — what's done vs what's waiting on Lyle

DONE (in this repo):
- manifest.json upgraded: `id`, `scope`, categories, **maskable icons** (Play crops icons into circles; the `-maskable` versions have safe-zone padding)
- privacy.html — Play requires a live privacy policy URL
- assetlinks-template.json (this folder) — fill in the fingerprint at step 5
- CSP + input-sanitizing hardening on the app itself

WAITING ON LYLE (same list as My Last Smoke Break — one org account serves both apps):
- DUNS number → Google Play **organization** account ($25 one-time) under Smooth Rock Media LLC
- Decide final name/domain (Flight Plan B / flightplanb.com not confirmed yet)

## Build steps (once the Play account exists)

1. **Install Bubblewrap** (needs Node + JDK17 + Android SDK; it offers to download the SDK itself):
   ```
   npm i -g @bubblewrap/cli
   ```

2. **Init from the live manifest** (run in an empty folder, NOT in this repo):
   ```
   bubblewrap init --manifest https://lemonjello76.github.io/travel-helper/manifest.json
   ```
   Answers: package id `com.smoothrockmedia.travelhelper`, app name `Travel Helper`,
   display standalone, status bar `#101418`. Let it create a signing key and
   SAVE THE KEYSTORE + PASSWORDS somewhere real (password manager) — losing it
   means never updating the app again unless Play App Signing is on (turn it on).

3. **Build**: `bubblewrap build` → produces `app-release-bundle.aab` (upload this)
   and an `.apk` for local phone testing.

4. **Play Console**: create app → upload the `.aab` to Internal testing first.
   - Privacy policy URL: `https://lemonjello76.github.io/travel-helper/privacy.html`
   - Data safety form (matches privacy.html): Location = collected, not shared,
     ephemeral, app functionality. Personal info (name) = collected, not shared,
     stored, app functionality. Photos (screenshots user picks) = collected, not
     shared, processed ephemerally. No ads, no analytics.
   - Store listing needs: 512 icon (use icons/icon-512.png), 1024x500 feature
     graphic, 2+ phone screenshots.

5. **Digital Asset Links** — removes the browser bar from the TWA:
   - Play Console → Setup → App signing → copy the **SHA-256 certificate fingerprint**
   - Paste it into assetlinks-template.json → the file must be served at the
     ORIGIN ROOT: `https://lemonjello76.github.io/.well-known/assetlinks.json`
   - ⚠ That path is the ROOT of lemonjello76.github.io — it lives in a separate
     repo named `lemonjello76/lemonjello76.github.io` (create it if it doesn't
     exist, enable Pages, add `.well-known/assetlinks.json`).
   - If/when the app moves to its own domain (flightplanb.com behind Cloudflare),
     the assetlinks file moves to THAT domain's root instead, and Bubblewrap
     re-inits against the new manifest URL.

6. **Verify**: install the test build — if a Chrome URL bar shows at the top,
   asset links aren't verifying yet (fingerprint or path wrong).

## Known TWA fit notes
- share_target, service worker, notifications, geolocation, wake lock, TTS:
  all work inside a TWA (it IS Chrome).
- The API-key friction for strangers is unchanged — the key-proxy server is
  still the gate before charging money, not before listing an internal test.
