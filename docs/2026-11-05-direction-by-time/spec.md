# Spec: open on Work or Home by the time of day

Status: approved 2026-11-05
Intent: [intent.md](intent.md) · Plan: [plan.md](plan.md)
Date: 2026-11-05

## Requirements

**R1. The time of day picks the direction on opening.** On the Pacific service
clock, the app opens on **Work** from 3:00am to 11:59am and on **Home** from
12:00pm (noon) until the service day ends at 3:00am. After midnight counts as
the evening before, so 12:30am opens on Home. Weekdays and weekends follow the
same rule. The Weekday/Weekend choice is unaffected.

**R2. The address can name the direction.** With `#home` in the address, the
app always opens on Home, as it does today. With `#work`, it always opens on
Work. Anything else in the address, or nothing, leaves it to R1.

**R3. Coming back after 2 hours away picks the direction again.** Away is the
time the page is hidden, by the browser's page visibility: from switching to
another app, going to the home screen, locking the phone or switching tabs, to
the page being visible again. A page that loads hidden (a link opened in a
background tab) hasn't been seen yet, so the first time it's shown counts as 2
hours or more away. When it's visible again after 2 hours or more, the app picks
the direction the way a fresh open does (R2, then R1). If that's a different
direction from the one showing:

- the picked train is cleared and earlier trains collapse, as when tapping the
  other direction;
- if the timetable is showing (not Settings or the first-run station picker),
  the page scrolls to the top at once, so the card shows that direction's next
  train.

After less than 2 hours away, nothing changes, whatever the time of day and
whatever was tapped. The direction never changes while the app is on screen,
including the 15-second redraw.

2 hours is longer than any single trip: the longest on caltrain.com's timetable
on November 5, 2026 is 1 h 38 min end to end (train 104, a weekday local). So a
ride with the phone locked doesn't flip the direction.

**R4. README.** "Using it" step 2 says how the starting direction is chosen,
that `#home` and `#work` override it, and what coming back after 2 hours does.

## Examples

| Opened | Address | Then | Direction |
| --- | --- | --- | --- |
| Wed 7:10am | | | Work |
| Wed 11:59am | | | Work |
| Wed 12:00pm | | | Home |
| Thu 12:30am | | | Home (Wednesday's service day) |
| Thu 3:00am | | | Work |
| Sat 1:00pm | | | Home, weekend schedule |
| Wed 1:00pm | `#work` | | Work |
| Wed 1:00pm | `#later` | | Home |
| Wed 11:50am, in a background tab | | first shown at 12:10pm | Home |
| Wed 8:00am | | away until 5:00pm | Home |
| Wed 11:59am | | away until 12:01pm | Work |
| Wed 8:00am | | tap Home, away until 9:59am | Home |
| Wed 8:00am | | tap Home, away 9:59am to 11:59am (2 h) | Work |
| Wed 8:00am | | on screen until 5:00pm | Work |
| Wed 8:00am | | scrolled down, away until 10:05am | Work, same place |
| Wed 7:10am | `#home` | tap Work, away until 10:00am | Home |

## Design

All app changes are in `index.html`.

- **Direction for a time.** `function timeDir(now)` returns
  `now.sec < 12 * 3600 ? "work" : "home"` for a `serviceNow()` reading.
  `now.sec` already runs past 86400 before 3am, so after midnight lands on Home.
- **Opening direction.** `function openingDir(now)` reads `location.hash` each
  time it's called. `home` or `work` wins; otherwise `timeDir(now)` decides. It
  replaces the `hash` constant, and `state.dir` starts as `openingDir(now0)`.
  Both are `function` declarations, since `state` is built before the helpers
  further down. Reading the hash each time means a return sees the address as
  it is then, the way a reload would.
- **Away time.** `const AWAY_MS = 2 * 60 * 60 * 1000`, with a comment on where
  the number comes from. `let hiddenAt` holds `Date.now()` from the moment the
  page was hidden, or `null` while it's visible. It starts as `-Infinity` if the
  page loads hidden (a background tab), so the first showing always picks the
  direction afresh. Each hide records the latest time, so if a browser ever
  misses a "visible" event, a break can only be undercounted, never overcounted.
  `Date.now()`, not `performance.now()`, because the monotonic clock can stop
  while a phone suspends the app.
- **Coming back.** The existing `visibilitychange` handler:
  - when hidden, sets `hiddenAt` and returns;
  - when visible after 2 hours or more, sets the direction from `openingDir`.
    On a change, it clears `state.pick` and `state.showPast` and calls
    `renderControls()`;
  - clears `hiddenAt`, then runs `refresh()`/`render()` as today;
  - after a change of direction, if `$("list")` isn't hidden, scrolls to the top
    with an instant `scrollTo(0, 0)` and calls `updateTop()`.

  Both `refresh()` and `render()` draw synchronously, `refresh()` before it awaits
  the download, so the scroll comes after the new direction is on screen. Since
  2 hours is past the 30-minute re-download (`RECHECK_MS`), a switch always goes
  through `refresh()`. The scroll can't be smooth: the redraw after the download
  runs `restoreRows`, which would cut a smooth scroll off partway. The first
  redraw doesn't move the page: its scroll keeping (`captureRows`/`restoreRows`)
  skips a different route, since `shown.key` includes the stations in travel
  order.
- **The pick.** Clearing `state.pick` matches the Work/Home tap handler, but
  `draw()` already drops a pick that isn't in the new list. Train numbers are
  odd northbound and even southbound, so a pick never survives a change of
  direction. No scenario can tell the two apart, so the clear isn't tested on
  its own.
- **Not on the timer, not on taps.** The 15-second redraw and the Work/Home
  handlers don't change.

## Tests

A new feature file, `tests/features/direction.feature`, has one scenario per
example (some combined), each tagged with the requirement it checks.

New steps:

- `When I leave the app` makes the page report itself hidden
  (`document.hidden` and `document.visibilityState`, overridden on the
  document) and fires `visibilitychange`. Playwright can't background a page
  in both browsers, and this works in WebKit too.
- The existing `When I return to the app` also removes those overrides, so
  the page is visible again before it fires `visibilitychange`. Existing uses
  never left the app, so for them nothing changes.
- `Given the app's address ends in {string}` sets the hash that
  `I open the app` uses (`open()` already takes `hash`).
- `When I open the app in the background` loads the page already hidden.
- `Then the page is still scrolled to the bottom`, for Settings on return.

The When steps are in `tests/steps/actions.js`, with `I return to the app`
(moved there from `scrolling.js`). The Given is in `setup.js`, and the Then in
`page.js`.

"The time reaches" fast-forwards the clock, so the 15-second redraw fires at
least once on the way. That makes "on screen until 5:00pm" a real check that it
doesn't switch while on screen.

The side effects of a switch need a page long enough to scroll, or "the page is
scrolled to the top" would pass without the feature. That scenario uses "there
is a train every ten minutes" on a 390 by 520 screen. It shows earlier trains,
scrolls a train well down the table, leaves, and comes back that evening. Then
it checks Home, the collapsed earlier-trains action, and the top of the page.

DST changes can't be tested: the test clock fixes Pacific time at UTC-7.
`serviceNow()` reads wall-clock parts, so they're handled anyway. The design
review checked this by hand for November 1, 2026 and March 14, 2027. Away time is
measured in real elapsed time, so a DST change doesn't stretch or shrink it.

### Existing scenarios

Scenarios set at noon or later that open on Work have to say so now, with
`#work` in the address:

- `service-day.feature`: "After the last train, the next day's trains show"
  (Wed 11:55pm) and "After Friday's last train, the weekend schedule shows"
  (Fri 11:45pm).
- `pick-train.feature`: "A pick doesn't carry over to the next day's trains"
  (Wed 11:40pm) and "A tap just after the last train goes to the next day's
  table" (Wed 11:49pm).
- `timetable-scroll.feature`: its Background is Wed 12:00pm with southbound
  trains (1104 and so on), and one scenario is Thu 2:59am. Its Background gets
  `the app's address ends in "#work"`.

Scenarios that already use `#home` after noon keep it: they're about the service
day, not the direction. Every other scenario runs between 5am and 9:30am, or
uses `#home`. That includes the ones with "I reload the app" and "I open the app
again" ("I open the app again" goes to `/` and drops any hash). None of the
timetable-scroll scenarios that use "I return to the app" leave first, so they
don't switch.

## Concerns

- **After the last train home, Home is the least useful card.** Between the
  last train home (around 12:15am) and 3am, the app opens on Home and shows
  tomorrow afternoon's first train home, while Work would show the first
  morning train. That follows from the owner's noon-to-3am rule. It's why
  service-day scenarios after midnight now need `#work`. Raised by the code
  review and left to the owner.
- **A tab left on screen doesn't switch.** On a desktop browser left visible
  from morning to evening, the direction stays put until the tab is hidden for
  2 hours. That's the owner's choice (never switch while on screen).
- **A long ride with a transfer, or a long wait on the platform with the phone
  locked**, could go past 2 hours and switch on return. The app doesn't plan
  transfers, so this needs a day well outside its normal use.
- **The 2 hours is fixed, not computed from the timetable.** A schedule change
  would have to add over 20 minutes to the longest trip before it mattered.
- **Only the direction is chosen again.** A return after 2 hours picks the
  direction afresh, but keeps a Weekday/Weekend choice made by hand
  (`state.dayPinned`), as today.
- **Screen readers aren't told.** A switch on return only changes `aria-pressed`
  on Work/Home and redraws the card. If the focused row disappears, focus moves
  to the card without scrolling, as on any redraw. That seems enough for a
  switch that happens as the app comes back.
- **A new timetable can move the page off the top.** If the download after
  coming back changes the card's height, `restoreRows` keeps the first visible
  row in place, as it does today. That's existing behaviour, not new here.
- **Pages restored from the back/forward cache** fire `visibilitychange` when
  hidden and when shown again, so they're covered by the same handler.
- **An installed app gets this build on its next full launch.** `sw.js` serves
  the cached copy and updates it in the background. No change is needed.

## Design review

A fresh-context reviewer stress-tested the first draft against `index.html` and
the tests (read only). That draft re-picked the direction once noon or 3am had
passed since it was last set, and taps held until the next one. Afterwards, the
owner asked for the simpler 2-hour rule above. These findings still apply and
are built in:

- Scroll synchronously after `refresh()` draws, not after the download, and use
  an instant scroll, since the redraw after the download would cut off a smooth
  one. Call `updateTop()` after.
- Don't scroll when Settings or the first-run picker is showing.
- "the page is scrolled to the top" passes on a page that never scrolled. The
  switch scenario scrolls a long timetable first.
- Clearing the pick can't be told apart from `draw()` dropping it, because train
  numbers differ by direction. Kept for consistency, and not tested on its own.
- The still-on-screen example passed with today's code. It now also leaves and
  comes back, and checks the switch.
- The helpers must be `function` declarations.
- Confirmed correct: the noon and 3am edges, month and year rollovers, DST (by
  hand), the list of scenarios that need `#work`, the step names, and that
  `open()` already takes a hash from the scenario.

Findings that only applied to the noon-and-3am design were dropped: the wrong
example of tapping the selected option, and testing both the `render()` and
`refresh()` paths (a 2-hour return always re-downloads).

## Code review

A separate, fresh-context reviewer read the finished diff against this spec
and `index.html`. It ran `npm test` (181 passed) and probe scenarios in a copy
of the repo. It found no bug on the main path. Its findings:

- **A tab that loads hidden kept its load-time direction (confirmed, fixed).**
  Loaded in a background tab at 11:50am and first shown at 12:10pm, it opened on
  Work. Now a page that loads hidden picks afresh when first shown (R3). The
  scenario "An app opened in the background picks its direction when first
  seen" failed first.
- **Three behaviours had no scenario (confirmed, covered).** Each break still
  passed the suite. Now there are scenarios for:
  - the hidden load above;
  - the Settings guard: Settings scrolled to the bottom stay there after a
    switch;
  - a 2-hour return to the same direction keeping your place.

  Also covered: another hash (`#later`) leaving the choice to the time of day.
  Each scenario was checked by breaking its code.
- **`hiddenAt ??= Date.now()` could overcount a break (plausible, changed).**
  If a browser misses a "visible" event, the next break would be measured from
  an older hide. Now each hide records the latest time. The steps can't model a
  missed browser event in the viewer's words, so this has no scenario.
- **After the last train home, Home is the least useful card (design concern).**
  Added to Concerns, for the owner.
- **README overstated a return as "opening it again"** when only the direction
  is chosen again. Reworded.
- **plan.md put the new step in `scrolling.js`;** it's in `actions.js`.
  Recorded as a plan amendment.
- **Nits, done:** the Saturday outline row duplicated "Weekends follow the same
  rule", so it was removed.
- **Nits, left:** "the page is scrolled to the top" polls, so it can't tell an
  instant scroll from a later one. Instant is still what the code does, and the
  reason is in the design.
- **Checked correct:**
  - the noon, 3am and exactly-2-hour edges;
  - a short break followed by a long one;
  - order with the async `refresh()`;
  - Settings, first run, and no timetable yet;
  - focus;
  - that the leave and return steps model visibility in both browsers;
  - the list of after-noon scenarios.
