# Spec: show every stop on the card

Status: approved 2026-11-06
Intent: [intent.md](intent.md)
Date: 2026-11-06

## Requirements

**R1. Collapsed, the card shows the same stations as today, plus a control.**
The itinerary shows the departure, my stop if one is set, and the arrival.
Right under the departure, on the route line, a button reads **Show N more
stops**. N is the number of stations this train stops at between the two, not
counting my stop ("Show 1 more stop" for one). When N is 0, there's no button.
That happens when the train runs nonstop or stops only at my stop. The button's
row makes the collapsed card one short row taller than today.

**R2. Expanded, the card lists every station the train stops at on the way.**
Between the departure and the arrival, in travel order, it lists each station
this train stops at, with its time. My stop is listed in its place, with its
Stop or Skips tag, exactly as when collapsed. Stations the train passes without
stopping aren't listed, apart from my stop. The other stops are drawn smaller
than my stop, so the departure, arrival and my stop still stand out. The button
reads **Hide N stops** ("Hide 1 stop"), with the same N, and collapses the card
again.

**R3. One choice, kept while the page is open.** The card starts collapsed
every time the page loads. Once expanded, it stays expanded for whatever train
the card shows:
- when the next train changes, and through the 15-second redraw;
- for a picked train, and after **Back to next train**;
- for either direction, either schedule, and after saving Settings;
- after coming back to the app, even after 2 hours away.

A card with no train on it has no button. That's the other day's summary, "No
more trains tonight", "No weekday trains stop at both stations" and loading. A
card where N is 0 has none either. In both cases the choice is kept for the
next train that has more stops. Nothing is saved.

**R4. The button stays where it was tapped.** Tapping it doesn't scroll the
page. Only content below the button changes, so it stays under the finger, and
the timetable moves down or up with the card. The one exception is collapsing
when the page is scrolled near its end: if the page gets too short for where
it's scrolled, the browser has to pull it back.

A redraw doesn't scroll the card away either. While the card's heading is on
screen, a redraw that makes the card taller leaves the card where it is, and
the timetable moves down. That covers a next train with more stops, **Back to
next train**, and coming back to the app. Picking a train already follows this
rule. (Amended after code review. It narrows the timetable-scroll spec's R5,
"periodic redraws … preserve the viewed row": with the card's heading on
screen, the card is what's being viewed. **Show N earlier trains** and **Hide N
earlier trains** still keep the train being read in place.)

**R5. Keyboard and screen reader.** The button carries `aria-expanded`. Its
accessible name is exactly its label, with no glyphs. It keeps keyboard focus
when pressed, and through the redraw that updates the countdown each minute.
Its hit area is at least 40px tall.

**R6. README.** "Using it" describes the button.

## Examples

From `tests/fixtures/timetable.html`, on a Wednesday:

| Commute | Time | Train | Collapsed | Button | Expanded |
| --- | --- | --- | --- | --- | --- |
| SF → San Jose | 7:10am | 502 | SF 7:30, SJ 8:20 | Show 2 more stops | SF 7:30, Millbrae 7:45, MV 8:05, SJ 8:20 |
| SF → San Jose, stop Palo Alto | 7:10am | 502 | SF 7:30, PA — Skips, SJ 8:20 | Show 2 more stops | SF 7:30, Millbrae 7:45, PA — Skips, MV 8:05, SJ 8:20 |
| SF → San Jose, stop Palo Alto | 7:40am | 402 | SF 8:00, PA 8:35 Stop, SJ 9:00 | Show 2 more stops | SF 8:00, Millbrae 8:15, PA 8:35 Stop, MV 8:44, SJ 9:00 |
| SF → MV | 7:10am | 502 | SF 7:30, MV 8:05 | Show 1 more stop | SF 7:30, Millbrae 7:45, MV 8:05 |
| SF → MV, Home | 7:10am | 101 | MV 4:50pm, SF 5:45pm | Show 2 more stops | MV 4:50pm, PA 5:00pm, Millbrae 5:25pm, SF 5:45pm |
| SF → Millbrae | 7:10am | 502 | SF 7:30, Millbrae 7:45 | none | |
| Millbrae → MV, stop Palo Alto | 7:10am | 104 | Millbrae 7:20, PA 7:45 Stop, MV 7:55 | none | |
| Millbrae → MV, stop Palo Alto | 7:30am | 502 | Millbrae 7:45, PA — Skips, MV 8:05 | none | |

After midnight, SF → San Jose at 11:40pm (`#work`): train 108 shows SF 11:50pm,
Millbrae 12:10am, PA 12:35am, MV 12:45am and SJ 1:05am, with "Show 3 more
stops".

Keeping the choice (R3), SF → MV from 7:10am: expand on train 502. At 7:31am
the card moves on to 402, still expanded. Tapping 106, **Back to next train**,
Settings then Save, Home, the Weekend summary, and back to Weekday all keep it
expanded. A reload collapses it.

## Design

All app changes are in `index.html`.

- **Trip data.** `trips()` gives each trip a `calls` list: every station
  strictly between `from` and `to` in the trip's own direction table, in travel
  order, as `{ name, time }`, with `time` null where the train doesn't stop
  (`dir.stops.slice(a + 1, b)` with `t.t[a + 1 + j]`). `stops` becomes the count
  with a time, as now. `at` stays, for the timetable's columns.
- **State.** `state.allStops`, false on load. Nothing resets it.
- **Itinerary.** In `trainCard`, one filter picks the stations between the two
  from `calls`:
  - expanded, it keeps the ones with a time, plus my stop;
  - collapsed, it keeps only my stop.

  My stop is drawn with `itinRow(time, name, true)`, as today. Every other
  station is drawn as a new, smaller row, `li.call`, with the same `.mark`, `.t`
  and `.s` parts, so the test helper reads it like the others. There's one code
  path, and expanding when N is 0 draws the same card as collapsing.

  `ready()` checks that my stop lies between home and work in the table where
  home comes before work. The card's other direction reads the other table.
  Both list the same stations on caltrain.com, so my stop is in `calls` in
  practice. If a table ever lacked it, the card would leave it out, where today
  it shows "Skips" (see Concerns).
- **The button** is the itinerary's second item:
  `<li class="more-stops"><button id="all-stops" type="button" aria-expanded="…">`.
  - It sits in the columns after the mark, so the route line runs past it.
  - Its text is `--sign-muted`, which has 8.1:1 contrast on the sign in light
    and 6.9:1 in dark. `--muted`, which **Show N earlier trains** uses, is
    3.1:1 on the sign, too low.
  - A chevron, drawn with borders on an empty `::before` (like `.select::after`),
    points down to expand and up to collapse. Text glyphs would get into the
    button's name.
  - The row is no more than 28px tall. The button's hit area is at least 40px,
    reaching into the 8px gaps above and below with negative block margins.
  - Its click handler is set after each draw, as for `#back`, since the redraw
    replaces it.
- **Tapping** flips `state.allStops` and calls `render({ keepPlace: false })`.
  The default, `keepPlace`, keeps the first visible timetable row in place
  while the card above it changes height. When rows are on screen below the
  card, that would scroll the button up and away from the finger. Nothing
  above the button changes, so with no scroll it stays put (R4). `render()`
  already puts focus back, by id, on a button the redraw replaced, as it does
  for **Back to next train** (R5).
- **Redraws** (added after code review). `captureRows()` notes whether the
  card's heading was in view. `restoreRows()` then scrolls only up, never down,
  when it was, except for Show or Hide earlier trains. That's
  `Math.min(dy, 0)`, the rule the row-picking handler already uses.
- **Styles.** The `.call` rows have:
  - a smaller mark: a dot in `--sign-ink`, ringed in `--sign-bg` so it cuts the
    route line like the others;
  - a 15px time and a 14px regular station name, in a shorter row than the main
    stations;
  - selectors written as `.itin .call .t` and so on, so the 380px and 350px
    `.itin .t` overrides don't enlarge them;
  - am/pm at about .6em rather than .45em, which would be under 7px.

  The first and last rows stay 40px high, so the route line's ends
  (`.itin::before`, 20px in from each end) still line up with the end marks.
  The sign's colors already have dark-mode values, so there are no new color
  tokens. Exact sizes are settled during the visual check.
- **Not changed:** the timetable, the "N min ride · N stops" line, the trains
  after it, the summary and empty cards.

## Tests

A new `tests/features/card-stops.feature`, tagged R1 to R5. The fixture already
has what's needed: San Jose Diridon past Mountain View gives stops on both
sides of Palo Alto, and 502 skips Palo Alto.

- **R1, R2:** one scenario each for the first five rows of the examples, with
  the button's label and `aria-expanded` before and after the tap, and the
  button just under the departure. They're separate scenarios, since a data
  table can't change its number of rows in an outline. Row 5 is the only
  northbound one: it catches stations read in the wrong order.
- **R1:** the three rows with no button, as a Scenario Outline. Today's app has
  no button either, so these pass before the build. They're a guard, checked by
  breaking the count of N on purpose (counting my stop would show "Show 1 more
  stop" on row 7).
- **R2:** the after-midnight example.
- **R3:** keeping the choice as in the example above, then a reload. Also:
  leaving the app and coming back after 2 hours, which switches direction,
  keeps it expanded.
- **R4:** on a 390 by 844 screen, with a train row in view below the card, the
  button is in the same place on screen after each tap. The design review
  measured that a plain `render()` moves it by 32px (SF to MV) and 64px (SF to
  San Jose), so this fails if the tap keeps the timetable row in place instead.
- **R5:** keyboard focus moves to the button, Enter expands, focus stays
  through a minute's redraw, and Enter collapses.

Added after code review:
- **R2:** the other stops are drawn smaller than my stop.
- **R3:** the choice is kept across a train with nothing more to show
  (Millbrae to San Jose with a stop at Mountain View: 104, then 502, then 402).
- **R4:** the card stays put when the next train has more stops.
- **R5:** the button is at least 40 pixels tall.
- `pick-train.feature`: "Picking a train with the card in view…" also checks
  that the card didn't move. Its "top of the card is in view" only checks
  y ≥ 0, which passed with the rule broken.

Step changes:

- `itinerary()` in `tests/support/app.js` skips the button's row
  (`li:not(.more-stops)`), so "the card's itinerary is:" still lists only
  stations.
- New, in `tests/steps/card.js`:
  - `Then the card's {string} button is just under the departure`;
  - `Then the card's stops are {word}` (expanded or collapsed, by
    `aria-expanded`);
  - `Then the card has no button for more stops`;
  - `When I note where the card's stops button is on screen` and
    `Then the card's stops button is still in the same place on screen`, kept
    apart from the existing `app.noted` values.
- Reused: "I tap {string}", "there is a/no {string} button", "I move keyboard
  focus to {string}", "I press Enter", "the {string} button has keyboard
  focus", "I reload the app", "I leave the app", "I return to the app".

### Existing scenarios

`pick-train.feature`, "Picking a train with the card in view leaves the card's
heading in view", taps train 106. On the iPhone 13's 664px-high screen in WebKit,
that row is already partly below the bottom edge. The taller card pushes it off
screen, so Playwright scrolls to reach it and the card is no longer in view when
it's tapped. The design review saw it fail 5 times out of 5. The scenario gets
`Given the screen is 390 by 844 pixels`, so that train 106 is on screen in
both browsers. Its intent, tapping with the card in view, is unchanged. Every
other existing scenario passed against the review's prototype.

## Concerns

- **A long card.** A local from San Francisco to San Jose lists 20 or 21 extra
  rows, about 640px, which pushes the timetable below the fold on a phone. The
  owner chose to keep it expanded for every train once expanded, so it stays
  long until collapsed. The button is at the top of the list, so it's easy to
  reach to collapse.
- **Two counts on one card.** With my stop set and served, "44 min ride · 2
  stops" counts every stop, while the button says "Show 1 more stop". "More"
  is there to say it's counting the ones not yet on the card.
- **The card is rewritten every minute.** When the countdown changes, `put()`
  replaces the whole card. Focus comes back to the button by id, but a screen
  reader may announce it again. Someone reading a 20-stop list with VoiceOver
  also has every node replaced under them. **Back to next train** already
  works this way. If it turns out to be a problem, the countdown and the "Then"
  line can be drawn separately. Automated checks can't run VoiceOver, so this
  needs a check by hand on the phone.
- **Screen readers count the button as a list item.** The itinerary is an
  ordered list and the button is one of its items, so "list, 4 items" includes
  it. Taking it out of the list (`role="none"`) is the menu pattern, but it
  trips list-structure checks, and it isn't worth that.
- **Picking a train with the card expanded and on screen** can push the
  tapped row off the bottom. The card grows to show the picked train's stops,
  and, as before, a pick with the card's heading in view doesn't scroll down.
  The card is what changed, so it stays in view. Raised in code review and
  accepted.
- **Collapsing near the end of a short page** can't keep the button in place
  (R4). It needs a short timetable scrolled to the bottom with the card still
  on screen.
- **Rarely served stations** (College Park, Broadway) appear only on trains
  that stop there. That's correct, but the expanded list can differ a lot from
  one train to the next.
- **Both direction tables must list the same stations.** If the card's table
  ever lacked my stop, the card would leave it out, where today it shows
  "Skips", while the timetable still shows "—". On caltrain.com today both
  tables have the same 30 stations, reversed.

## Design review

A separate, fresh-context reviewer stress-tested the first draft against
`index.html` and the tests. It built the design in a throwaway copy, ran the
suite there and probed it with Playwright in Chromium and WebKit, light and
dark, at 390px and 320px wide. Findings and what changed:

- **An existing scenario fails (confirmed, spec changed).** The collapsed card
  is a row taller, and "Picking a train with the card in view leaves the card's
  heading in view" failed in WebKit, 5 times out of 5. With a button row of
  28px or less it passed; at 32px or more it failed. The spec now says the card
  grows, sets that scenario's screen size (under Existing scenarios), and keeps
  the row short with a 40px hit area, without shrinking the tap target to suit
  the test.
- **`--muted` is too low-contrast on the sign (confirmed, spec changed).** 3.1:1.
  The spec names `--sign-muted`.
- **A text chevron gets into the button's name (confirmed, spec changed).**
  "Show 2 more stops▾" in both engines, which breaks exact-name matching and is
  read aloud. It's drawn with borders now.
- **No hit-area size (plausible, spec changed).** At least 40px.
- **Northbound wasn't tested (confirmed gap, covered).** Only examples row 5
  catches stations read in north-to-south order. Rows 1 to 5 each get a
  scenario.
- **The R3 scenario skipped Settings and Back to next train (confirmed gap,
  covered).** Saving Settings already clears the pick, so clearing this there
  by mistake is plausible. Both are in the scenario now.
- **The no-button outline can't fail before the build (confirmed, noted).** It's
  a guard, checked by breaking the count on purpose.
- **"My stop is always in `between`" was overstated (confirmed, reworded).** A
  table that lacked it would drop it, where today it shows "Skips". Accepted,
  since the real tables match, and kept under Concerns.
- **The minute-by-minute rewrite and screen readers (plausible, Concerns).**
  Focus stays on the button through the minute's redraw in both engines, but
  VoiceOver wasn't tried.
- **Minor, done:** am/pm at about .6em in the smaller rows; `calls` and
  `li.call` instead of `between` (the name of an existing function) and `via`
  (the timetable's name for my stop's column); the row parts named; selectors
  specific enough to beat the narrow-screen overrides; the click handler set
  after each draw; the noted button position stored apart.
- **Checked correct:**
  - all eight example rows, the after-midnight case, and the R3 walk-through,
    by hand and on the prototype;
  - that the R4 scenario tells the two `render()` modes apart, in both engines
    (the scenario covers the top of the page; the reviewer's probes also covered
    a scrolled page);
  - that a tap in WebKit doesn't scroll a long card;
  - focus through Enter, a minute's redraw and Enter again, in both engines;
  - that a reload keeps the paused clock and collapses the card;
  - the `trips()` slice in both directions;
  - the one filter path;
  - the route line's ends, at 320px too;
  - 24-hour times;
  - dark mode with no new tokens;
  - the `itinerary()` skip against every existing scenario.

  It found nothing materially simpler. Toggling a class on a stable button
  would avoid replacing it on tap, but it needs attribute syncing and hidden
  rows. That's only worth it if the VoiceOver check goes badly.

## Code review

A separate, fresh-context reviewer read the finished diff (3bf4eeb) against
this spec and the code. It ran `npm test` (211 passed), probes, and mutations in
a copy of the repository. Findings and what was done:

- **A redraw scrolled the card's heading away (bug, confirmed, fixed).** Once
  expanded, the card's height depends on the train. When a redraw made it
  taller, the page's scroll keeping held the first visible timetable row in
  place and scrolled the countdown off the top. That happened for a next train
  with more stops, **Back to next train**, and a short return to the app. On
  390 by 844 the probe measured 161px; with live data it would be about 300px.
  The fix is the rule picking a train already follows (R4, amended). "The card
  stays put when the next train has more stops" failed first, with the card
  moving 30px in both browsers.
- **A pick with the card expanded can push the tapped row off screen (risk,
  accepted).** Added to Concerns.
- **Test gaps (confirmed by mutation, covered):** the 40px hit area, the
  smaller rows, and keeping the choice across a train with nothing more to show.
  Each now has a check that fails when broken.
- **"the card's stops are {word}" took any word as collapsed (nit, fixed).** It
  throws on anything but expanded or collapsed.
- **The pick-train scenario couldn't catch its own regression (nit,
  pre-existing, fixed).** It now also checks that the card didn't move. With
  the pick rule broken, it fails.
- **Docs out of step with the code (nit, fixed):** `::before`, not `::after`;
  the chevron, not the label, lines up with the times; the R4 scenario covers
  the top of the page only.
- **Checked correct:** `calls` in both directions and after midnight; one filter
  for both states; N leaving out my stop; labels and plurals; the choice never
  reset; focus by id; `esc()` on station names; the 40px hit area reaching into
  the gaps without overlapping rows; selectors beating the narrow-screen
  overrides; contrast; the README; the `itinerary()` skip; and the screen-size
  change being harmless. It found the design about as simple as it can be.
