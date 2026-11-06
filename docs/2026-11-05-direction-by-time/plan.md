# Plan: open on Work or Home by the time of day

Status: approved 2026-11-05
Intent: [intent.md](intent.md) · Spec: [spec.md](spec.md)
Branch: `direction-by-time`

The owner approved this plan and spec.md, and asked to go ahead without another
review from them. The first plan re-picked the direction once noon or 3am had
passed. The owner found that too complicated and chose the 2-hour rule instead.
This plan replaces that one.

## 1. Scenarios first

- **New steps:**
  - `When I leave the app`, in `tests/steps/actions.js`. `I return to the app`
    moves there from `scrolling.js` and now also makes the page visible again.
    (Amended: the first draft put them in `scrolling.js`, but leaving and
    returning are actions.)
  - `Given the app's address ends in {string}`, in `tests/steps/setup.js`.
- **Existing scenarios that open on Work after noon** say so with `#work`:
  - `service-day.feature`: Wed 11:55pm and Fri 11:45pm.
  - `pick-train.feature`: Wed 11:40pm and Wed 11:49pm.
  - `timetable-scroll.feature`: its Background.
- **New `tests/features/direction.feature`**, one scenario per row of the spec's
  examples table (some combined), tagged R1 to R3. It includes the
  long-timetable scenario for the side effects of a switch.
- Run `npm test`. The new afternoon R1 rows, R2 and the switching R3 scenarios
  should fail on today's code; every existing scenario should still pass.

## 2. Code (`index.html`)

- `timeDir`, `openingDir`, `AWAY_MS` and `hiddenAt` as in the spec. `state.dir`
  starts from `openingDir(now0)`, and the `hash` constant goes.
- `visibilitychange`: record when the page is hidden. After 2 hours or more away,
  set the direction from `openingDir`; on a change, clear the pick and
  `showPast` and call `renderControls()`. Then `refresh()`/`render()` as today.
  Then, after a change, if the timetable is showing, `scrollTo(0, 0)` and
  `updateTop()`.

## 3. README

"Using it" step 2: the time-of-day rule, `#home`/`#work`, and 2 hours away.

## 4. Verify

- `npm test` passes, with none failed or flaky.
- Break it on purpose: remove the away check, then make the cutoff 1pm, then make
  `AWAY_MS` 3 hours. Confirm the matching scenarios fail each time, then
  restore.
- Visually inspect in Chrome at phone width (390px), in light and dark, on the
  local server. Check a morning open (Work), an afternoon open (Home), and a
  switch on return with the timetable scrolled. Record the browser, the method,
  the states checked and the findings below.

## 5. Review

A separate, fresh-context reviewer checks the diff against the spec and code.
Findings go below. Each confirmed issue is fixed with a failing scenario first.

## 6. Deliver

Commit on `direction-by-time`, push, and open a PR. It links these docs and
lists what was verified. Wait for CI (`gh pr checks`). Merging is left to the
owner.

## Verification (2026-11-05)

- **Scenarios first.** With the scenarios written and the app unchanged, 22
  failed: 11 per browser, on the direction or the card. The other 159 passed.
  Four new ones already passed, as expected, since today's app defaults to Work:
  the morning and 3am rows, `#work` in the afternoon, and the short absence.
- **`npm test`:** 181 passed, with none failed or flaky.
- **Broken on purpose** (only `direction.feature`, unless noted), then
  restored:
  - Away check removed: 12 failed, every switching R3 scenario in both browsers.
  - Cutoff moved to 1pm: the 12:00pm row failed in both browsers.
  - `AWAY_MS` set to 3 hours: 6 failed. These were the two-hour boundary, the
    on-screen scenario's return at 7pm, and the address on return.
  - Scroll to the top removed: the switching-side-effects scenario failed in
    both browsers.
  - `#work` ignored (full suite): 38 failed. These were R2 and every existing
    after-noon scenario that now opens with `#work`.
- **Visual check in Chrome.** Google Chrome 156.0.8078.80, driven by Playwright
  (`channel: "chrome"`) at 390 by 844, with the local server, live caltrain.com
  data, a paused clock on Wednesday, November 11, and San Francisco to Mountain
  View. Screenshots reviewed in light and dark:
  - 8:00am open: Work, with the 8:20am express on the card.
  - 1:00pm open: Home, with the 1:16pm local from Mountain View.
  - 8:00am with earlier trains shown, scrolled 1890px down, away until 5:00pm
    and back: Home, at the top, "Show 34 earlier trains" collapsed, the card
    in full view, and the back-to-top button hidden.
  - Away again for 30 minutes: stays on Home and keeps its place.

  Nothing overlapped, wrapped or lost contrast. The screens match what an open
  at that time shows today, except that the selected Work/Home button follows
  the time.
- **Gap: real backgrounding wasn't exercised.**
  - Playwright keeps every page visible. That holds even in a headed window,
    with focus emulation off or the window minimized.
  - In the owner's own Chrome, through the Claude in Chrome extension, the
    page reported itself hidden throughout. The desktop wasn't on screen, so
    switching tabs never fired `visibilitychange`.
  - The return checks therefore use the same visibility override as the tests
    (`document.hidden`, `visibilityState`, and the event).
  - That same Chrome did show the new build opening on Home at 11pm. It needed
    a second load, since the service worker served the old copy first.
  - Worth a check on the phone after merging: leave the installed app in the
    morning, then open it in the evening.

## Amendment after code review

The fresh-context code review's findings and what was done are in
[spec.md](spec.md#code-review). In short:
- A page that loads hidden now picks its direction when first shown, with a
  failing scenario first.
- Each hide records the latest time.
- Three behaviours that had no scenario now have one: the Settings guard,
  keeping your place on a same-direction return, and the hidden load. Another
  hash is covered too.
- The README wording is fixed.
- A new Concern for the owner: after the last train home, Home shows
  tomorrow's train.

Verification after these changes:
- `npm test`: 185 passed, with none failed or flaky.
- Broken on purpose, each caught by its scenario in both browsers, then
  restored:
  - the hidden load not counted, or counted from the load time;
  - the Settings guard removed;
  - a scroll on every long return.
- No visual change: the app's screens are the same as in the Chrome check
  above.
