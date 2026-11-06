# Plan: show every stop on the card

Status: approved 2026-11-06
Intent: [intent.md](intent.md) · Spec: [spec.md](spec.md)
Branch: `card-stops`

The owner approved this plan and spec.md on 2026-11-06.

## 1. Scenarios first

- New `tests/features/card-stops.feature`, tagged R1 to R5:
  - one scenario for each of the examples' rows 1 to 5 (row 5 is the only
    northbound one);
  - the after-midnight example;
  - an outline for the three cards with no button;
  - keeping the choice through the next train, a pick, Back to next train,
    Settings then Save, Home, Weekend and back, then a reload collapsing it;
  - a 2-hour return keeping it expanded;
  - the button staying in place on a 390 by 844 screen;
  - keyboard focus through Enter, a minute's redraw, and Enter again.
- Five new steps in `tests/steps/card.js`, as listed in the spec.
  `itinerary()` in `tests/support/app.js` skips the button's row.
- `pick-train.feature`, "Picking a train with the card in view leaves the
  card's heading in view", gets `Given the screen is 390 by 844 pixels`.
- Run `npm test`. The new scenarios should fail, apart from the no-button
  outline, which passes before the build. Every existing scenario should pass.

## 2. Code (`index.html`)

- `calls` per trip in `trips()`, and `state.allStops`.
- In `trainCard`, one filter for the stations between, the `li.call` rows, and
  the `#all-stops` button with a border-drawn chevron and a 40px hit area. Its
  click handler is set after each draw and calls `render({ keepPlace: false })`.
- CSS in the sign's existing tokens.

## 3. README

A new "Using it" step for **Show N more stops** and **Hide N stops**.

## 4. Verify

- `npm test` passes, with none failed or flaky.
- Break it on purpose, check that the matching scenario fails, then restore:
  - keep the timetable row in place on a tap (R4);
  - count my stop in N (the no-button row 7);
  - reset the choice when Settings are saved (R3);
  - read stations in north-to-south order (row 5);
  - lose the button's id (R5).
- Visually inspect in Chrome on the local server, at 390px in light and dark
  and at 320px:
  - collapsed and expanded, with my stop served and skipped;
  - Home, a selected train, and the other day's schedule;
  - 24-hour time;
  - a long card with live data, San Francisco to San Jose on a local.

  Record the browser, the method, the states checked and the findings below.

## 5. Review

A separate, fresh-context reviewer checks the diff against the spec and code.
Findings go in the spec. Each confirmed issue is fixed with a failing scenario
first.

## 6. Deliver

Commit on `card-stops`, push, and open a PR that links these docs and lists
what was verified. Wait for CI (`gh pr checks`). Merging is left to the owner.
VoiceOver on the phone is a check by hand for the owner after merging (see
Concerns in the spec).

## Verification (2026-11-06)

- **Scenarios first.** With the scenarios written and the app unchanged, 20
  failed: every new scenario, 10 in each browser. The other 191 passed. They
  include the no-button outline and the neighboring-stations scenario, which
  pass before the build, as expected.
- **`npm test`:** 211 passed, with none failed or flaky.
- **Broken on purpose** (`card-stops.feature`), each failing in both browsers,
  then restored:
  - A tap that keeps the timetable row in place (plain `render()`): "The button
    stays where it was tapped" failed.
  - N counting my stop: the no-button row "it stops only at my stop" and "My
    stop keeps its place between stops on both sides" failed.
  - Saving Settings resetting the choice: "Once expanded, the card stays
    expanded for every train it shows" failed.
  - Stations in north-to-south order: "Going home, the stations are in the order
    the train reaches them" and the R3 scenario failed.
  - The button without its id: "The button works from the keyboard and keeps
    focus through a redraw" failed.
- **Visual check in Chrome.** Google Chrome 156.0.8078.80, driven by Playwright
  (`channel: "chrome"`) on the local server with live caltrain.com data. The
  clock was paused at Wednesday, November 11, 2026, 7:10am. Screenshots were
  reviewed, light and dark, at 390 by 844 and 320 by 640:
  - San Francisco to San Jose Diridon, collapsed ("Show 9 more stops" on
    express 506) and expanded (nine smaller rows on the route line);
  - Home, still expanded;
  - a selected Limited (14 stops) with **Back to next train**, and a weekend
    Local with all 21 stops;
  - the weekend summary, with no button;
  - a stop at Burlingame, served (diamond and Stop among the other stops) and
    skipped (hollow diamond, —, Skips, in its place in travel order), collapsed
    and expanded;
  - 24-hour time;
  - keyboard focus on the button, collapsed and after Enter.

  **Found and fixed:** the focus ring was drawn outside the button's 40px hit
  area and covered the top of the first stop's row. It's inset now, with 6px of
  padding on each side. The label still lines up with the times, since the
  button reaches 6px into the column gap. No other problems: nothing
  overlapped, the route line ran through every mark, the button's text is
  legible on the sign in both themes, and at 320px there's no horizontal
  overflow. At 320px "South San Francisco" wraps to two lines, with its dot
  centered on them.
- **Gap: VoiceOver wasn't tried.** See Concerns in the spec.

## Amendment

- **The pick-train scenario's screen size.** The button's row came out at 24px.
  With that, "Picking a train with the card in view leaves the card's heading in
  view" also passes without the new screen size. The size stays anyway: on the
  iPhone 13's default screen, train 106 is still partly off the bottom, so the
  scenario would otherwise depend on the device's height.
