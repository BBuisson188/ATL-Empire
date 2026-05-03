# ATL Empire Handoff

## Publishing to GitHub

For this repo, publish changes through the GitHub API path. Do not use local `git push`.

Repository:

- `BBuisson188/ATL-Empire`
- Branch: `main`

Before editing or publishing, confirm the GitHub connector has write access:

- Use the GitHub integration/API to check `BBuisson188/ATL-Empire`.
- Required permission signal: `push: true`.
- If the GitHub integration/API cannot publish, stop before making changes and tell the user.

Current working publish method:

1. Make the local changes.
2. Increment the build stamp/cache version in `index.html`.
   - Example: `20260503a`
   - Example visible stamp: `Build 2026.05.03a`
3. Run checks:
   - `node --check app.js`
   - `node --check raise-cash-hotfix.js`
   - `git diff --check -- app.js index.html styles.css raise-cash-hotfix.js assets/board/atlanta-beltline.png assets/board/path400.png assets/board/silver-comet-trail.png assets/board/stone-mountain-trail.png assets/board/world-of-coca-cola.png`
4. Publish with the API helper:
   - `powershell -NoProfile -ExecutionPolicy Bypass -File .\publish-gh-api.ps1`
5. Verify on GitHub:
   - Fetch the published commit.
   - Fetch `index.html` from `main` and confirm the new build version is present.

Important local details:

- `gh` may not be on PATH for Codex. The helper uses:
  - `$env:ProgramFiles\GitHub CLI\gh.exe`
- Codex shell may have bad proxy variables. The helper clears:
  - `HTTP_PROXY`
  - `HTTPS_PROXY`
  - `ALL_PROXY`
- The helper publishes a new commit directly to `main` through `gh api`.
- The helper does not use local `git push`.

Files currently included by `publish-gh-api.ps1`:

- `app.js`
- `HANDOFF.md`
- `index.html`
- `publish-gh-api.ps1`
- `styles.css`
- `raise-cash-hotfix.js`
- `assets/mansion.png`
- `assets/townhouse_1.png`
- `assets/townhouse_2.png`
- `assets/townhouse_3.png`
- `assets/townhouse_4.png`
- `assets/board/atlanta-beltline.png`
- `assets/board/path400.png`
- `assets/board/silver-comet-trail.png`
- `assets/board/stone-mountain-trail.png`
- `assets/board/world-of-coca-cola.png`

If future changes touch other files, update the `$paths` list in `publish-gh-api.ps1` before publishing.

Known successful API publish before the property-management batch:

- Build: `2026.05.03a`
- Commit: `82f67b380d322abcff9ff72999da40311af15319`
- URL: `https://github.com/BBuisson188/ATL-Empire/commit/82f67b380d322abcff9ff72999da40311af15319`
