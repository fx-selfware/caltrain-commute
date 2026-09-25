# Spec: pick a train from the timetable

Status: approved 2026-09-25, with the amendments from [plan.md](plan.md)
Intent: [intent.md](intent.md)
Date: 2026-09-25

## Requirements

**R1. Rows can be picked.** Every timetable row, past ones included, is a
button. Tapping it, or Enter/Space with it focused, picks that train. The
picked row is marked with a bar on its left edge and `aria-pressed="true"`.
The yellow "next" highlight stays on the actual next train. A picked train
that has left stays in the table even when earlier trains are collapsed, and
"Show N earlier trains" doesn't count it.

**R2. The card shows the picked train.** It has the same layout as the next
train card: itinerary (home, optional stop with its Stop/Skips tag, work),
service chip, train number, ride length, number of stops, and a "Then" strip
with the two trains after it. The differences:

| | Next train (today) | Picked train, today | Picked train, other day's schedule |
| --- | --- | --- | --- |
| Eyebrow | Next train | Selected train | Weekday schedule / Weekend schedule |
| Countdown | in 12 min | in 40 min, or **left 12 min ago** (dimmed) | none |
| "Then" strip | time, kind, wait | time, kind, wait (or "left … ago") | time, kind |
| Back button | none | Back to next train | Back to summary |

When the timetable has rolled over to tomorrow after the last train, the
eyebrow keeps its day suffix ("Selected train · Saturday").

When the picked train is itself the next train (the one before it has left),
the card reads "Next train" and has no back button, since it would point at
the card you're looking at. It stays picked, so once it leaves, the card still
shows it with "left N min ago" and the back button.

**R3. Getting back.** Any of these clears the choice and the card goes back to
what it shows today (the next train, or the summary on the other day's
schedule):

- tapping the picked row again, or tapping the next train's row;
- the back button on the card;
- switching Work/Home or Weekday/Weekend to the other option, including the
  automatic switch to the next day's schedule (tapping the option that's
  already on keeps the pick);
- saving settings;
- the timetable moving on to the next service day after the last train;
- the picked train not being in the list any more (e.g. after the timetable is
  downloaded again);
- reloading the page. The choice is never saved.

**R4. The choice survives refreshes.** It stays through the 15-second redraw,
through the app coming back to the foreground, and after the train leaves. A
train that leaves while picked stays picked and its countdown becomes
"left N min ago".

**R5. Floating "back to top" button.** A small round button with an up arrow
sits at the bottom right, inside the page's 480px column and above the phone's
safe area. It's shown only while the card is completely out of view (scrolled
up behind the sticky controls) and the timetable is showing, whether or not a
train is picked. Tapping it scrolls to the top (smoothly, unless the device
asks for reduced motion) and moves keyboard focus to the card.

Picking a row never scrolls to the card. The row you tapped stays where it was
on screen, even when the card above it changes height (the other day's summary
turning into a train card, or the back button appearing): the page scrolls by
exactly that difference.

**R6. Keyboard and screen reader.** Row buttons are in the tab order and show
a focus ring inside the row, since the list clips anything outside it. After
the 15-second redraw, focus stays on the same row. The floating button has the
label "Back to top". The card's region label reads "Selected train" when a
train is picked.

## Design

All changes are in `index.html`.

- **State.** `state.pick` is `null` or `{ n, dow }`: the train number and the
  service day whose trains were showing when it was picked. Train numbers are
  unique within a direction and service type on the live timetable. Keeping
  the day means that once the table moves on to tomorrow after the last train,
  a pick of tonight's train 147 doesn't quietly point at tomorrow's 147, while
  the 3am service-day boundary (same trains, same day) keeps it.
- **Clearing.** The Work/Home and Weekday/Weekend handlers (when the value
  changes), the automatic day switch in `render()`, and the settings form's
  submit set `state.pick = null`. `render()` also clears it when the train
  isn't in `list` or the day doesn't match.
- **Card.** The current next-train branch of `render()` becomes one function
  that draws a train card from `list`, an index, and the eyebrow and back
  button to use. Both the next train and a picked train use it, so the two
  cards can't drift apart. A picked train takes precedence over every other
  card state except "no trains".
- **Countdown.** `until(sec)` handles negative values: within the departure
  minute it still says "departing now"; after that, "left N min ago" /
  "left N h M min ago". The countdown gets a dimmed style once the train has
  left.
- **Rows.** Each `<li>` holds a `<button type="button" data-n="…"
  aria-pressed="…">` that takes over the row's grid and padding, so the header
  and rows still share `--cols`. One delegated click listener on `#rows`
  handles picking. Train numbers from caltrain.com go through `esc()` in the
  attribute.
- **Redraws.** `#sign` and `#rows` are rewritten only when their HTML changed,
  so most 15-second ticks leave the rows alone. When a rewrite does detach the
  focused element, `render()` focuses its replacement (same `id` or train
  number) without scrolling.
- **Row position.** The row click handler notes the tapped button's position,
  redraws, and scrolls by the difference. It holds off the browser's own scroll
  anchoring until the next frame, so the browser doesn't adjust as well.
- **Taps act on the current timetable.** The page redraws every 15 seconds, so
  the table can be a little behind. A tap first catches up with the clock,
  then decides whether it picks or unpicks. The pick keeps the day of the
  table that was tapped, so a tap on a table that has since moved on to the
  next day is dropped.
- **Focus fallback.** If the focused control is gone after a redraw (the back
  button, or an unpicked earlier train that's now hidden), focus moves to the
  card.
- **Floating button.** One `<button class="to-top" id="to-top" hidden>` after
  the footer. Its visibility is worked out on `scroll` (passive), on `resize`,
  and after each `render()`: shown when the card's bottom edge is at or
  above the sticky controls' bottom edge and the timetable isn't hidden.

## Flagged concerns

- **Accessibility, new.** Rows become buttons, so their content becomes the
  button's name, e.g. "8:12am 9:05am 53 min Local 147". That reads fine.
- **Accessibility, existing.** A skipped stop is a "—" with
  `aria-label="doesn't stop"` on a plain `<span>`, which screen readers may
  ignore inside a button's name. This change doesn't make it worse, and fixing
  it is out of scope; noted for a follow-up.
- **Focus loss on redraw.** Redrawing with `innerHTML` every 15 seconds would
  throw away keyboard focus. Handled by the redraw rules above, which also
  cover the existing "Show earlier trains" and back buttons.
- **Scrolling vs tapping.** Browsers don't fire `click` for a scroll gesture,
  so scrolling the table on a phone won't pick rows.
- **Security and privacy.** No new data leaves the browser and nothing new is
  stored. The only new untrusted input is the train number in `data-n`,
  escaped in markup and compared by value, never put in a selector.

## Open questions from intent.md

All five are answered in [intent.md](intent.md) and covered above: past trains
(R2, R4), getting back (R3), scrolling (R5), leaving while picked and resets
(R3, R4), other day's schedule (R2).
