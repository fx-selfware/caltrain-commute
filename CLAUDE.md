# Caltrain Commute

A one-page PWA. `index.html` holds all of the app's CSS and JavaScript: no build step and no runtime dependencies. `package.json` exists only for the tests. README.md describes what the app does.

## Commands

- Run locally: `python3 -m http.server 8765`, then open http://localhost:8765. After a change, reload twice (the service worker serves the cached copy first).
- Test: `npm test`. The first time, run `npm install && npx playwright install chromium webkit`.
  - Healthy output ends with `N passed`, with nothing failed or flaky. Every test runs twice: Chromium as a Pixel 7 and WebKit as an iPhone 13.
  - Work isn't done until `npm test` passes. Don't skip or delete a failing test. For a bug fix, write the failing test first.

## Tests

- Tests never contact caltrain.com. `tests/fixtures/timetable.html` stands in for it, with the same markup the page parses. The comment at its top lists every train.
- `open(page, { at: "2026-09-23T07:10", prefs, hash })` in `tests/helpers.js` loads the app at a Pacific time with the clock paused. `page.clock.runFor(ms)` moves time and runs the 15-second redraw; `advanceTo(page, time)` jumps.
- Test what the viewer sees (text, `aria-pressed`, classes on rows), not internal state.

## Conventions

- Feature work follows `docs/<feature>/intent.md` → `spec.md` → `plan.md`, each approved before the next. See `docs/select-train/`.
- Colors are tokens on `:root`, with dark-mode overrides; check both themes.
- Anything from caltrain.com goes through `esc()` before it goes into HTML.
- Keep README's "Using it" in step with the controls.
