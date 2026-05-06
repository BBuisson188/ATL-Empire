# ATL Empire Handoff

## Current State

- Repo: `BBuisson188/ATL-Empire`
- Branch: `main`
- Current published build: `2026.05.05b`
- Latest published commit: `230568b138cd0f65f722c0b95b9c77c0b55a23eb`
- Latest commit URL: `https://github.com/BBuisson188/ATL-Empire/commit/230568b138cd0f65f722c0b95b9c77c0b55a23eb`

## What Changed Recently

- Raise Cash flow now supports minimizing the modal, opening Trade, and returning to debt resolution.
- A debtor may raise money through legal combinations of selling buildings, mortgaging eligible properties, and trading eligible undeveloped properties.
- Bankruptcy is blocked while liquidation/trade capacity appears sufficient to cover the shortfall.
- Condos/towers were renamed to townhomes/mansions throughout the UI and card text.
- Townhome/mansion PNG markers render on owned property squares and rotate/size by board edge.
- Board rendering was changed so cells are built once, then updated in place to reduce PNG flashing.
- Manage Properties tries to preserve scroll position after build/sell/mortgage actions.
- Rush hour visual square was restored to the old `Stuck in Rush Hour`/`Gridlock` look.
- When a player only lands on the rush-hour corner, log/status/player location can show `Rush Hour Reverse Commute`; actually stuck players still use rush-hour wording.
- `raise-cash-hotfix.js` is now only a compatibility stub so it does not override the built-in debt logic.

## Current Architecture

- Single-page vanilla app:
  - `index.html` loads `styles.css`, `app.js`, and the compatibility `raise-cash-hotfix.js`.
  - `app.js` contains board data, game state, rendering, actions, debt, trades, auctions, bots, saves, and art helpers.
  - `styles.css` contains board layout, responsive UI, modals, cards, tokens, owner flags, and improvement marker placement.
- Board structure:
  - `buildBoard()` creates static board DOM once.
  - `updateBoardState()` refreshes owners, tokens, improvement markers, deck previews, and center controls.
  - `spaceLabel()` controls board-facing labels; `playerLocationName()` controls player-facing location names.
- Debt model:
  - `game.debt` tracks debtor, creditor, amount, and pot handling.
  - `renderDebtModal()` is the main Raise Cash UI.
  - `finishDebtIfSolved()`, `settleDebt()`, and bankruptcy helpers complete or eliminate the debt.
- Improvements:
  - `game.improvements[index]` stores 1-4 townhomes or 5 mansion.
  - Marker images are `assets/townhouse_1.png` through `assets/townhouse_4.png` and `assets/mansion.png`.
- Saves:
  - Browser `localStorage` stores saved games.
  - Existing saves may contain old names/state, so code should stay tolerant of missing newer fields.

## Publishing

Do not use local `git push`.

Before editing or publishing, confirm GitHub connector/API write access for `BBuisson188/ATL-Empire`; required signal is `push: true`. If API publishing is unavailable, stop before making changes and tell the user.

Publish workflow:

1. Make local changes.
2. Increment cache/build version in `index.html`.
3. Update the commit message in `publish-gh-api.ps1`.
4. Run:
   - `node --check app.js`
   - `node --check raise-cash-hotfix.js`
   - `git diff --check -- app.js index.html styles.css raise-cash-hotfix.js HANDOFF.md publish-gh-api.ps1`
5. Publish through API:
   - `powershell -NoProfile -ExecutionPolicy Bypass -File .\publish-gh-api.ps1`
6. Verify with GitHub API by fetching the commit and `index.html` from `main`.

`publish-gh-api.ps1` publishes directly to `main` through `gh api`, clears proxy variables, and uses `$env:ProgramFiles\GitHub CLI\gh.exe` when `gh` is not on PATH.

If future changes touch new files, add them to the `$paths` list in `publish-gh-api.ps1` before publishing.

## Unresolved Issues

- Need iPad testing of the Raise Cash minimize/trade/return path with several debt scenarios.
- Need iPad testing that board PNG flashing is actually reduced at start/end of turn.
- Need confirm Manage Properties scroll preservation works on iPad, especially near the bottom of long lists.
- Need verify bankruptcy rules in edge cases: debt to player, debt to bank/pot, mortgaged transfers, and trades that only partially cover debt.
- Need visual QA of townhome/mansion markers on all four board edges and at different viewport orientations.
- Old saved games may still carry previous wording or unusual states; continue testing with both fresh and saved games.

## Next Recommended Steps

- Run one fresh game on iPad and force these cases: land on rush-hour corner, get sent to rush hour, owe rent beyond cash, trade during Raise Cash, and declare bankruptcy only after legal options are exhausted.
- Add a small browser-based regression harness or scripted state setup for debt, bankruptcy, and improvement marker cases.
- Consider splitting `app.js` later into data, state/actions, rendering, and debt/trade modules once gameplay behavior settles.
- Remove dead CSS for `.debt-dock` if the hidden compatibility style continues to be enough and no dock UI is coming back.

## Important Implementation Notes

- Keep the rush-hour board square visual text old-style; only visitor wording should use `Rush Hour Reverse Commute`.
- `raise-cash-hotfix.js` should remain non-invasive unless there is a very specific compatibility need.
- Mortgage/trade eligibility depends on `groupHasBuildings()` and `transferBlockedReason()`; do not allow mortgaging/trading deeds from a color group with buildings.
- `liquidationSummary()` estimates possible trade capacity from other players' available cash; it is intentionally an estimate, not a guaranteed trade.
- The API publish path can leave local git status looking dirty because it does not update the local index or push through git.
