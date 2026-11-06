# Intent: open on Work or Home by the time of day

Status: reviewed 2026-11-05
Date: 2026-11-05
Spec: [spec.md](spec.md)

## Problem

The app always opens on **Work** unless the address ends in `#home`. On the
evening commute, the first thing I do is tap **Home**, every time.

## Outcome

The app opens on the direction I'm most likely to travel: Work in the morning,
Home in the afternoon and evening. Coming back to an installed app that stayed
in memory for hours counts as opening it, so the evening commute starts on Home
even if the app was last on screen that morning. A short break, such as locking
the phone for the ride, leaves it as I left it.

## Affected users and systems

- Users: anyone with stations set, mostly on a phone as an installed PWA.
- `index.html`: the starting direction (`state.dir`) and the handler for the
  app going to and returning from the background.
- Tests: scenarios set at noon or later that expect Work, and new scenarios
  for this feature. README's "Using it".
- Not affected: timetable download and parsing, saved settings and their
  storage format, `sw.js`, the Weekday/Weekend choice.

## Constraints

- No new files in the app, no build step, no dependencies.
- Times are on the Pacific service clock the app already uses, where the
  service day runs from 3am to 3am.
- The direction isn't saved. Nothing new goes in local storage.
- No new setting.

## Open questions (resolved)

1. When does it switch from Work to Home?
   **Answer:** Noon. 3am to 11:59am opens on Work; noon to 3am opens on Home.
   Fixed, with no setting.
2. Does coming back to an app that resumed from the background count?
   **Answer:** Yes, after being away longer than the longest end-to-end trip:
   2 hours. Under that, nothing changes. It never switches while the app is on
   screen. (The first answer tied this to noon and 3am passing since the
   direction was set, with taps holding until the next one. The owner found
   that too complicated, and asked for a duration instead.)
3. What counts as away? **Answer:** The time the app isn't on screen: from the
   browser hiding the page (another app, the home screen, a locked phone,
   another tab) to showing it again.
4. Does `#home` in the address still win? **Answer:** Yes, and `#work` does the
   same for Work. (Default, not asked.)
5. Weekends? **Answer:** The same rule. (Default, not asked.)
