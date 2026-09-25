# Plan: pick a train from the timetable

Status: approved 2026-09-25
Intent: [intent.md](intent.md) · Spec: [spec.md](spec.md)

## Context

This follows the AI-native SDLC playbook: intent → spec → plan → build → verify → review → PR.

- [intent.md](intent.md) is reviewed, with the answers to its open questions recorded.
- [spec.md](spec.md) is approved, with the amendments below.

Together they define the feature. Tapping a timetable row makes the platform-sign card show that train. Three things return to the next train: tapping the row again, tapping the next train's row, or a "Back to next train" button. A floating button goes back to the top when the card is off screen.

Approving this plan also approved spec.md, including the amendments below.

A fresh-context planning agent stress-tested the draft design against `index.html`. Its findings are built in below. It also confirmed from the live caltrain.com page that train numbers are unique within a direction and service day, so the pick can be keyed on the train number.

Branch: `select-train` (already created from `main`).

## Amendment during build: a test suite

During the build the owner asked for a test suite, with tests backfilled for the existing features. It landed first, as its own commit, and passes against the code on `main`:

- Playwright runs `index.html` in Chromium (Pixel 7) and WebKit (iPhone 13).
- A fixture stands in for caltrain.com, and the clock is paused at a set Pacific time.

This feature is then built test first. Its tests cover every requirement and amendment, and they fail before the code exists. They're now `tests/features/pick-train.feature`, tagged with the requirement each scenario checks. `npm test` replaces most of the manual browser checks under Proof below. Screenshots are still used for layout.

One consequence for step 7: the floating button's visibility is updated synchronously at the end of `render()`, not in `requestAnimationFrame`. The fake clock also holds back animation frames, and doing it synchronously is simpler anyway.

Later in the build the owner asked for the tests in BDD form. They were rewritten as Gherkin scenarios run by playwright-bdd, again as a separate commit. It was checked against the code on `main` before this feature landed.

## Amendment after code review

A fresh-context `/code-review` of the finished diff found the following. Each fix came with a failing scenario first:

- **A tap could act on a table up to 15 seconds old.** Just after the last train, tapping a row could pick tomorrow's train with the same number. Just after a departure, tapping the still-highlighted row showed a different train. Now a tap first catches the page up with the clock. The pick keeps the day of the table that was tapped, so a pick made on a table that has since moved on to the next day is dropped.
- **Focus could fall to the page.** This happened when unpicking a past train hid its row, or when a redraw removed the focused back button. Focus now falls back to the card.
- **"Show N earlier trains" counted a picked earlier train that was already showing.**
- **Smaller fixes:**
  - Scroll anchoring is held off only around a tap, not for the whole page.
  - The floating button's shadow is a color token.
  - The "Weekday/Weekend schedule" label is built in one place.
- **Not changed: the floating button measures the card on every scroll.** Layout is already clean while scrolling, so this doesn't force a reflow. An IntersectionObserver would need a margin that follows the sticky controls' height.

## Spec amendments (from the stress test)

- **The tapped row stays under your finger.** Picking changes the card's height: the other day's summary becomes a full train card, and the back button comes and goes. That would push every row down. After redrawing, the page scrolls by exactly that difference, so the row you tapped stays put. It never jumps to the card; this refines R5's "never scrolls".
- **When the picked train becomes the next train**, the card reads "Next train" and has no back button, since it would point at itself. It stays picked, so once it leaves it still shows "left N min ago" with the back button.
- **A picked train that has left stays visible in the table** even when earlier trains are collapsed.
- **The pick is tied to the service day (`dow`), not the rollover offset.** Tonight's 147 doesn't turn into tomorrow's 147 after the last train. The 3am service-day boundary doesn't drop a pick either.
- **Tapping the Work/Home or Weekday/Weekend option that's already on doesn't clear the pick.**

## Files that change

- `index.html`: all behavior, markup and CSS.
- `README.md`: one line under "Using it" about tapping a row, and a `docs/` row in the Files table.
- `docs/select-train/`:
  - `spec.md`: the amendments above; status set to approved.
  - `plan.md`: this plan.
- `sw.js`: no change. It already refreshes `index.html` in the background.

## Order of work (all in `index.html`)

1. **Countdown.** Extend `until(sec)` (index.html:613):
   - `-60 < sec < 60` → "departing now".
   - `sec <= -60` → "left N min ago" or "left N h M min ago".

   Add a dimmed `.count.gone` style (`--sign-muted`).
2. **State.** Add `pick: null` to `state` (index.html:638). A pick is `{ n, dow }`. The click handler computes `dow` from `upcomingDay(serviceNow())`, not from a cached value.
3. **Card.** Move the next-train branch of `render()` (index.html:815–833) into `trainCard(list, i, …)`. It reuses `itinRow`, `chip`, `stopsLabel`, `wait` and `fmtPlain`.
   - A pick takes priority over every card state except "no trains".
   - Eyebrow: "Next train" when the train shown is the next one; otherwise "Selected train". Both keep the rollover day suffix. On the other day's schedule: "Weekday schedule" or "Weekend schedule".
   - On the other day's schedule there's no countdown, and the "Then" strip has no waits.
   - The back button `#back` appears only when the train shown isn't the next one. It reads "Back to next train", or "Back to summary" on the other day's schedule. After it's used, focus moves to `#sign` (`tabindex="-1"`).
   - `#sign`'s `aria-label` changes to match: "Next train" or "Selected train".
4. **Clearing.**
   - Set `state.pick = null` in the Work/Home and Weekday/Weekend handlers (index.html:908–913), only when the value actually changes.
   - Also in the automatic day follow (index.html:775) and on settings submit (index.html:892).
   - `render()` clears it when the train isn't in `list` or `pick.dow !== svc.dow`.
5. **Rows.**
   - Each `<li>` wraps a `<button type="button" data-n aria-pressed>`.
   - The grid and padding move from `.rows li` to `.rows li > button`: the base rules at index.html:260–281 and the 380px media query at 397. The rules are scoped so `.more` is unaffected.
   - The button reset: `width:100%`, `margin:0`, `border:0`, `background:none`, `text-align:start`. `.gear` already puts a grid on a `<button>`.
   - `.rows li.picked` gets an inset left bar in `--ink` and full opacity, declared after `.past`.
   - The row focus ring gets a negative `outline-offset`, because `.list` clips overflow.
   - The picked row is exempt from the "hide earlier trains" filter (index.html:870).
   - One delegated `click` listener on `#rows`: the picked row or the `.next` row clears the pick; any other row picks it. Before redrawing it records the button's `top`; after, it `scrollBy`s the difference. `overflow-anchor: none` stops the browser from adjusting as well.
6. **Redraws that don't lose focus or taps.**
   - A small `put(el, html)` rewrites `#sign` and `#rows` only when their HTML changed. Most 15-second ticks then leave the rows alone.
   - When a rewrite does detach the focused element, `render()` refocuses its replacement, matched by `id` or `data-n` (looping over buttons, so no selector escaping). It uses `focus({ preventScroll: true })`.
7. **Floating button.**
   - `<button class="to-top" id="to-top" type="button" aria-label="Back to top" hidden>` with an up-arrow SVG.
   - Position: fixed, `right: max(16px, calc(50% - 240px + 16px))`, above `env(safe-area-inset-bottom)`. `.wrap` gets extra bottom padding so the button doesn't cover the footer.
   - It's shown when the card's bottom edge is at or above the sticky controls' bottom edge and the timetable is visible.
   - Its visibility updates on passive `scroll` and `resize`, and at the end of every `render()` (after the early returns for Settings and loading, so those hide it too).
   - Click: `scrollTo` the top (smooth unless `prefers-reduced-motion`), then focus `#sign` with `preventScroll`.
8. **Docs.**
   - README lines.
   - Apply the spec amendments and set its status to approved.
   - Copy this plan to `docs/select-train/plan.md`.

## Risks

- **Riskiest: the row moving under the finger when the card's height changes.** It's handled by the scroll compensation in step 5. To verify, scroll so the card is off screen on the other day's schedule, tap a row, and check that the row's `top` is unchanged. Do the same for Back and for tapping the row again.
- **The row grid on a `<button>`.** If the columns drift from `.list-head`, the table misaligns, most visibly in the three-column layout at 350px. Checked with screenshots at 390px and 340px, in both the two- and three-column layouts.
- **Focus on the 15-second redraw.** Step 6 handles it. To verify, Tab to a row, force `render()`, and check `document.activeElement`.
- **Untrusted train numbers** from caltrain.com in `data-n`: escaped with `esc()` in markup and compared by value, never put in a selector.

## Proof (verification)

Automated: `npm test`, with `tests/pick-train.spec.js` written first against the checks below. Layout: screenshots from the same browsers. What follows is the original manual checklist; the tests now cover it.

**Setup.**
- Run `python3 -m http.server 8765` in the repo and open it in a new tab at phone width (about 390px).
- Unregister the service worker and clear its caches, so the new `index.html` is what's served.
- Set up stations: home and work, then again with a stop.

**Fake clock.** Replace `Date` in the page, since `serviceNow()` reads the global `Date` on each call:

```js
const R = Date; let shift = 0;
Date = class extends R {
  constructor(...a) { a.length ? super(...a) : super(R.now() + shift) }
  static now() { return R.now() + shift }
};
```

Then set `shift` and call `render()`.

**Checks against spec.md:**
- **R1 and R2:** tapping a future row makes the card show it with "in N min" and gives the row its bar. A stop the train skips shows "Skips".
- **Past trains:** open "Show earlier trains" and tap a past row. The card shows "left N min ago", dimmed. Collapse the earlier trains and the picked row stays.
- **R3:** each of these goes back to the next train:
  - tapping the picked row again;
  - tapping the next train's row;
  - the Back button;
  - switching Work/Home or Weekday/Weekend.

  Tapping the option that's already on keeps the pick.
- **Other day's schedule:** pick a row. There's no countdown, the button reads "Back to summary", and the tapped row doesn't move.
- **R4:** with the fake clock:
  - one minute before the picked train, then two minutes after: the card shows "left 1 min ago";
  - after the train before it leaves: the card reads "Next train" with no back button;
  - after the last train of the night: the pick clears;
  - at 3:00am after the rollover: the pick is kept.
- **R5:** scroll the card off screen and the floating button appears. Tapping it goes back to the top and hides it. It's never shown over Settings.
- **R6:**
  - Tab to a row and press Enter: it's picked.
  - Force `render()`: focus stays on that row, and the page doesn't scroll.
  - Use Back: focus goes to the card.
- **Layout:** screenshots at 390px and 340px, in the two- and three-column layouts, light and dark.

**No console errors.**

**Review.** A code review of the diff in a fresh context (`/code-review`). Fix what it finds, then verify again anything that changed.

## Delivery

Three commits on `select-train`: the test suite, the docs artifacts, then the feature with its tests. Push, and open a PR against `main`. Its description links intent, spec and plan and lists the verification done.
