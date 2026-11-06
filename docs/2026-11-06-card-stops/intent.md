# Intent: show every stop on the card

Status: reviewed 2026-11-06
Date: 2026-11-06
Spec: [spec.md](spec.md)

## Problem

The card only shows where the train leaves, where it arrives and my stop, if I
set one. "35 min ride · 1 stop" says how many stations it stops at in between,
but not which ones or when. To find out, I have to go to caltrain.com.

## Outcome

On the card, I can expand the trip to see every station the train stops at
between my two, with its time, and collapse it again. My stop from Settings is
always on the card, expanded or not.

## Affected users and systems

- Users: anyone with stations set, mostly on a phone.
- `index.html`: the card's itinerary, and the trip data the card draws from.
- Tests: new scenarios for the card. The step that reads the card's itinerary
  has to skip the new control.
- README's "Using it".
- Not affected: the timetable below the card, timetable download and parsing,
  saved settings and their storage format, `sw.js`.

## Constraints

- No new files in the app, no build step, no dependencies.
- Nothing new goes in local storage. There's no new setting.
- Works with a keyboard and a screen reader, and in light and dark.

## Open questions (resolved)

1. When expanded, which stations between the two does the card list?
   **Answer:** Only the ones this train stops at. My stop is always listed,
   still marked "Skips" if this train doesn't stop there. Stations it passes
   aren't listed. (Live data, November 6, 2026: San Francisco to San Jose
   Diridon has 22 stations in between. A local stops at 20 or 21 of them and an
   express at 9.)
2. How long does it stay expanded?
   **Answer:** While the app is open. It opens collapsed. Once expanded, it
   stays expanded for every train the card shows (the next train, a picked
   train, either direction) until the page loads again. Nothing is saved.
3. Where is the control, and what if there are stops on both sides of my stop?
   **Answer:** One control, on the route line just under the departure. One
   tap opens every stop between the two, on both sides of my stop, which keeps
   its place in travel order. The owner asked how this works with stops on
   both sides before choosing it over one control per gap and over making the
   "N min ride · N stops" line the control.
