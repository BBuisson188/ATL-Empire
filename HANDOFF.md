# ATL Empire Handoff

## Publish Rule

Every publish must increment both version surfaces in `index.html`:

- The visible setup-screen build stamp, for example `Build 2026.05.06a`.
- The cache-busting query strings for `manifest.json`, `styles.css`, and `app.js`, for example `?v=20260506a`.

Keep those two formats equivalent on every published build. Do not publish code changes while leaving the visible build stamp behind the asset query version.

## Current Publish State

- Repository: `BBuisson188/ATL-Empire`
- Branch: `main`
- Current build: `2026.05.06a`
- The old `raise-cash-hotfix.js` compatibility script and ad hoc `publish-gh-api.ps1` script were removed from the app.

## Recent Fixes

- Free Parking games now render the `assets/board/free_parking.png` corner art when the lottery house rule is disabled.
- Debt trades now allow a negative-cash player to propose property-for-cash trades, while still preventing them from offering cash they do not have.
- `index.html` should load only `app.js`, not the removed hotfix script.

## Verification Before Publishing

Run at least:

```powershell
node --check app.js
rg -n "Build 2026|manifest.json\?v=|styles.css\?v=|app.js\?v=|raise-cash-hotfix" index.html
```

Confirm the build stamp and query-string versions match before updating GitHub `main`.
