# Plan: keep your place in the timetable

Status: implementing the owner-approved UX, authorized by “proceed with implementation”
Spec: [spec.md](spec.md)

1. Add a deterministic long timetable and failing BDD scenarios for sticky
   labels/actions, expand/collapse anchoring and fallbacks, selected past trains,
   no-earlier states, focus, redraws, short documents, and back-to-top. Retain all
   existing scenarios and strengthen the card-visibility assertion.
2. Make the top controls nonsticky. Introduce one sticky timetable header with
   a stable show/hide button above the labels; omit its entire row when empty.
   Preserve rounded corners without an overflow ancestor trapping the header.
3. Capture visible rows before each same-table redraw, then restore the first
   surviving visible row. Use the approved expansion/collapse fallbacks and
   real document scroll limits. Keep row selection as one separate scroll
   transaction. Update card visibility and back-to-top for nonsticky controls.
4. Update README usage. Run the full suite, deliberately regress the fix and
   confirm failures, then restore and rerun. Visually inspect installed Chrome
   through Playwright at phone widths in both themes.
5. Obtain fresh-context diff review, fix confirmed issues with failing scenarios
   first, and open a PR. Wait for CI; leave merging to the owner.

## Fresh-context design review

A separate Codex session inspected the spec, application, and tests read-only.
Its findings are incorporated into the spec and steps above:

- The sticky wrapper must be a direct child of the full table section.
- Partially visible rows count; rows behind the header do not.
- Disable generic restoration during both renders inside a row-selection tap.
- Compare card position against the viewport, not the scrolling controls.
- Search only previously visible survivors, not an offscreen selected past row.
- Preserve focus on the stable action; if it disappears use the existing card
  fallback without scrolling. Do not reset expansion preference just because
  the hideable count becomes zero.
- Capture just before each redraw, including asynchronous refresh completion.
  Compare route/stop/schedule/displayed service date before restoring.
- If every visible row disappears on a same-table refresh, use the next train;
  do not pull an entirely offscreen table into view on an automatic refresh.
- Exact placement yields to header readability and actual document limits.

## Verification log

- Before implementation: new scrolling scenarios produced 26 failures and
  2 passes across Chromium/WebKit. Existing row-picking behavior accounts for
  the two passes; the missing sticky header and toggle anchoring fail.
- Full suite after implementation and review fixes: **149 passed**, no failures
  or flaky tests (Chromium and WebKit; existing worker exclusions unchanged).
- Deliberate regression: disabling sticky positioning and row restoration made
  all six targeted sticky/expand tests fail. With sticky restored, disabling
  keyboard clearance made both keyboard regression tests fail. Restored the
  fixes and reran the full suite successfully.
- Chrome **155.0.8059.85**, driven through Playwright against the local server
  with intercepted timetable fixtures: inspected rendered screenshots at 390px,
  340px, and 320px in light and dark. Checked page top, two-/three-station and
  reversed columns, expanded/collapsed/past/selected rows, no earlier trains,
  action appearance, Settings, short-table footer, tomorrow, empty table, and
  keyboard focus. No horizontal overflow. Visual inspection found squared
  bottom corners on the empty table; added a failing scenario, fixed the
  rounding, and rechecked both themes.
- Fresh-context diff review identified focused rows hidden behind the sticky
  header. Reproduced in both browsers, added a failing backward-tab scenario,
  then fixed focus clearance without disturbing redraw restoration. Added the
  review's missing refresh and 3am coverage. A second fresh-context review
  found no remaining actionable issues.
- `git diff --check` passes. PR and CI verification follow delivery.
