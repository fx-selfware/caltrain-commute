# Intent: pick a train from the timetable

Status: reviewed 2026-09-25
Author: Fan Xia (drafted with Claude)
Date: 2026-09-25

## Problem

The platform-sign card at the top only ever shows the *next* train. When I plan
around a later train (say I want the 5:47 express, not the 5:30 local), I can
see its times in the timetable, but not the card's view of it: the countdown,
whether it stops at my optional stop, ride length, number of stops, and the two
trains after it. There's no way to point the card at a train I choose.

## Proposed outcome

I tap a row in the timetable and the card shows that train, laid out the same
way it shows the next train. The row I picked is marked in the table. I can get
back to the next train easily, and the choice doesn't vanish on the page's
15-second refresh.

## Affected users and systems

- Users: me, on my phone, mostly as an installed PWA.
- `index.html`: the sign card (`render()`), the timetable rows, and the view
  state (`state`).
- Not affected: timetable download and parsing, settings and local storage
  format, `sw.js` (it refreshes `index.html` in the background already).

## Constraints (out of scope)

- No new files, build step, or dependencies. The app stays one `index.html`.
- Scheduled times only, same as today. No real-time data.
- The choice isn't saved: a reload goes back to the next train.
- No change to the timetable data format or the saved settings.
- Works with a keyboard and a screen reader, not only by tapping.

## Open questions (resolved)

1. Past trains: when I pick one that has already left, what does the card say
   in place of the countdown?
   **Answer:** "Left 12 min ago". Past rows can be picked.
2. Going back: how do I return to the next train?
   **Answer:** Both. Tap the picked row again, or a "Back to next train"
   button on the card.
3. Scrolling: the card sits above the table, so on a phone a row far down puts
   the card off screen. Should picking a row scroll the card into view?
   **Answer:** Never scroll automatically. Show a small floating button that
   goes back to the top whenever the card is off screen.
4. What happens when the chosen train leaves while it's selected?
   **Answer:** It stays picked; the countdown turns into "Left N min ago".
   Switching Work/Home or Weekday/Weekend clears the choice, since the rows
   are different trains. (Default, not asked.)
5. Other day's schedule (e.g. the weekend table on a weekday): should picking a
   row work there too?
   **Answer:** Yes, without a countdown, since those trains aren't today.
   (Default, not asked.)
