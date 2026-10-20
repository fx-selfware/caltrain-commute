# Spec: keep your place in the timetable

Status: approved UX; design stress-tested by a separate fresh-context reviewer
Intent: [intent.md](intent.md)

## Approved UX and requirements

The owner approved the combined sticky action/column header, expand-in-place
behavior, collapse fallback, and removal of the action row when nothing is
hideable. The entire top controls block scrolls away, not just Work/Home.

- **R1 — Sticky table context.** All top controls scroll away. A single sticky
  timetable header contains the earlier-trains action above the existing column
  labels. It respects the top safe area, stays inside the timetable, uses an
  opaque light/dark surface, and preserves column alignment and wrapping.
  Keep station names in travel order when a stop is set; otherwise retain
  Depart / Arrive / Ride / Train. Do not add another floating button.
- **R2 — Expand in place.** Showing earlier trains preserves the first visible
  train's screen position. Earlier rows appear above, chronologically. The
  action becomes Hide N earlier trains with a visible `Scroll up to view` hint.
  If no row is visible, position the previously first shown row below the sticky
  header rather than showing the first train of the day. If that row has been
  removed by updated data, use the next train, then the first available row.
- **R3 — Collapse anywhere.** The same action remains available while scrolling
  the timetable. Preserve the first visible row that will survive collapse,
  within document scroll limits. If no visible row survives, position the next
  upcoming train below the sticky header. A selected past train remains shown
  and excluded from the count.
- **R4 — No earlier trains.** Omit the entire action row if nothing is hideable;
  no blank space or disabled control. Only column labels stick. This includes
  the case where the only past train is selected. If time passing introduces
  the action row, preserve a visible surviving train's position, subject to
  keeping it readable below the taller header and document scroll limits.
- **R5 — Existing interactions.** Selection, focus, counts, service-day behavior,
  Settings, and back-to-top continue working. Back-to-top depends on the card
  leaving the viewport, not on the formerly sticky controls. Periodic redraws
  and refreshes preserve the viewed row for the same route/service day. No
  automatic jump across direction, schedule, or service-day changes. Compare
  route endpoints, optional stop, schedule, and displayed service date. A
  same-table refresh removing all visible rows uses the next train; an entirely
  offscreen table is not pulled into view by an automatic redraw.
- **R6 — Accessibility and responsive layout.** Native keyboard-operable action,
  stable focus, aria-expanded and aria-controls, at least 44px action target,
  narrow-phone layouts, both themes, safe areas, and immediate (not animated)
  scroll compensation. The hint describes the button without changing its
  accessible name or causing the header height to change on toggle. If the
  action disappears, use the established card focus fallback without scrolling.
  Zero hideable trains does not reset the viewer's expansion preference.
  Keyboard navigation must keep the focused row readable below the sticky
  header; native focus scrolling alone does not account for its overlap.

## Implementation design

Keep all application changes in `index.html`.

- Introduce a sticky header wrapper around the action and column labels. Keep
  tomorrow's day note outside the sticky wrapper. Remove the list's overflow
  clipping; round the header and last row individually instead.
- Use a two-line action (reserved hint line when collapsed) so Show and Hide
  have the same height even on narrow phones. Omit the whole action when empty.
- Capture visible row identities and viewport coordinates before a same-table
  redraw; restore the first surviving row afterward. Ignore rows obscured by
  the sticky header. Expansion's no-visible-row fallback uses the old first row;
  collapse's fallback uses the next train. Partially visible rows qualify if
  they intersect the readable viewport below the actual header. Search only
  these visible rows for a survivor, not an offscreen selected past train.
  Preserve the chosen coordinate unless the new header would obscure it; then
  keep it readable. Clamp to real scroll limits without adding spacer height.
- Use one source of scroll compensation per interaction and disable native
  scroll anchoring to avoid Chromium adjusting twice. Keep the existing
  row-picking behavior but update its card-visible calculation for nonsticky
  controls. Prevent focus restoration from scrolling.
- Keep the header/button nodes stable where possible; update markup only when
  changed. Escape timetable-sourced labels and train numbers as before.
- No dependencies, network behavior, storage schema, or service-worker changes.

## Verification

Write failing BDD scenarios first for sticky headers, show/hide anchoring,
collapse fallback, no-row-visible expansion, count/focus updates, selected past
trains, no-action space, time passing, and back-to-top with nonsticky controls.
Use a deterministic long timetable fixture to test meaningful scroll distances
rather than adding arbitrary spacer elements. Retain all existing scenarios.

Run Chromium and WebKit through `npm test`; deliberately break the fix and
confirm the new scenarios fail; restore and rerun. Inspect affected states at
phone widths in Chrome in both themes. Fresh-context design and code review
precede delivery by PR; merging remains the owner's action.
