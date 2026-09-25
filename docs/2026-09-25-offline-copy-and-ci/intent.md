# Intent: a safe offline copy, and tests on every PR

Status: agreed 2026-09-25. For this change the intent is the only document; no spec or plan.
Author: Fan Xia (drafted with Claude)
Date: 2026-09-25

## Problem

1. **Another page can replace the app's offline copy.** `sw.js` treats every page opened within the app's folder as the app. It answers with the cached app, then saves whatever that page really was as the app. Opening something else on the site (the README, a test file) shows the app instead. Worse, the next launch of the installed app shows that other page until a later refresh puts the app back. Found during the visual check of the previous PR.
2. **The tests only run on one laptop.** `npm test` exists, but nothing runs it on a pull request or on `main`. A change can merge without it.

## Proposed outcome

- Other pages on the site open as themselves and never touch the app's offline copy.
- An installed app that already holds a wrong copy gets a clean one.
- The app still opens offline with the saved timetable, and a test now says so.
- Every pull request and every push to `main` runs the tests in GitHub Actions, in both browsers, with the result on the PR.

## Affected users and systems

- Users: anyone with the app installed; the owner, who reviews PRs.
- `sw.js`, the test setup (`tests/`, `playwright.config.js`), a new `.github/workflows/` file, `CLAUDE.md` and `README.md`.
- Not affected: `index.html` and how the app behaves online.

## Constraints (out of scope)

- The app keeps no dependencies and no build step.
- CI doesn't replace checking changes by eye in Chrome.
- No repository settings change (such as requiring the tests to pass before merging) without the owner's say-so.

## Open questions

1. Should merging require the tests to pass (branch protection)?
   **Answer (default, not asked):** Not in this change. Offer it once CI has run green.
2. Should other pages on the site be available offline?
   **Answer (default, not asked):** No. Only the app and its own files are kept.
