# Intent: keep your place in the timetable

Status: approved
Date: 2026-10-19
Spec: [spec.md](spec.md)

## Problem

While browsing the timetable, Work/Home stays pinned but the column labels
scroll away. Showing or hiding earlier trains loses the viewer's place, and
hiding them requires returning to the top of the table.

## Outcome

- Keep column context visible instead of Work/Home.
- Preserve the train being read when showing or hiding earlier trains.
- Make hiding earlier trains reachable throughout the timetable.

## Scope and constraints

For people browsing the timetable, especially on phones. Changes affect the
page's layout and scrolling, tests, and usage documentation—not timetable data,
settings storage, or dependencies. Preserve train selection and accessibility;
support both themes and Chromium/WebKit.

## Open questions

None for the UX. The owner approved the proposal, including the no-earlier-trains
state, and asked to proceed. Design decisions are recorded in the spec.
