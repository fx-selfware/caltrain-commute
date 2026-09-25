# Caltrain Commute

A one-page PWA. `index.html` holds all of the app's CSS and JavaScript: no build step and no runtime dependencies. `package.json` exists only for the tests. README.md describes what the app does.

## Commands

- Run locally: `python3 -m http.server 8765`, then open http://localhost:8765. After a change, reload twice (the service worker serves the cached copy first).
- Test: `npm test`. The first time, run `npm install && npx playwright install chromium webkit`.
  - Healthy output ends with `N passed`, with nothing failed or flaky. Every scenario runs twice: Chromium as a Pixel 7 and WebKit as an iPhone 13.
  - One scenario: `npm test -- --grep "words from its name"`.
  - Work isn't done until `npm test` passes. Don't skip or delete a failing scenario. For a bug fix, write the failing scenario first.
  - CI (`.github/workflows/test.yml`) runs `npm test` on every pull request and every push to `main`. Check a PR's run with `gh pr checks <number>`.
  - The "Tests must pass" ruleset on `main` requires that run (the `test` check) before merging. Admins can bypass it; that's for the owner to choose, never an agent.
- Check it by eye in Chrome (Claude in Chrome), always, as well as `npm test`. Scenarios only check what a spec names; looking catches the design problems nobody wrote down, such as spacing, wrapping, overlap, contrast or anything that looks off.
  - Use the local server at phone width.
  - Go through every screen and state the change touches, in light and dark.
  - Fix what you find, or raise it, before calling the work done.

## Tests

The tests are BDD scenarios in Gherkin, run by Playwright through [playwright-bdd](https://vitalets.github.io/playwright-bdd/).

- `tests/features/*.feature` holds one feature per area, in the viewer's words. Each Given sets up the time, the stations or caltrain.com; each When is a tap, a key or time passing; each Then is something on screen.
- `tests/steps/` holds the step definitions, grouped by setup, actions, the card, the timetable and the rest of the page. Reuse an existing step before writing a new one.
- `tests/support/app.js` drives the app. It opens it at a Pacific time with the clock paused ("it is Wednesday 7:10am" is September 23, 2026).
- Tests never contact caltrain.com. `tests/fixtures/timetable.html` stands in for it, with the same markup the page parses; the comment at its top lists every train. A guard in `tests/steps/fixtures.js` fails any scenario that gets a response from the real site.
- `npm test` generates Playwright tests into `.features-gen/` (ignored by git) first.
- Steps check what the viewer sees (text, `aria-pressed`, classes on rows), not internal state.
- Scenarios run with the service worker blocked, so no cached copy leaks between steps. Tag a scenario `@service-worker` to run it with the worker, as `tests/features/offline.feature` does. These run in Chromium only: with a worker in control, Playwright's WebKit sometimes lets requests past the fake caltrain.com.
- `@chromium-only` skips a scenario in WebKit, for other things Playwright's WebKit can't do. Say why in a comment above the tag.

## How we work

We follow the [AI-native SDLC playbook](https://claude.com/blog/the-ai-native-sdlc-playbook). For a feature:

1. **Intent.** Start a folder in `docs/` named `YYYY-MM-DD-<name>`, dated the day the work starts (e.g. `docs/2026-09-25-select-train/`). Write `intent.md`: the problem, the outcome, who and what it affects, constraints, and open questions. Ask the owner the open questions and record the answers.
2. **Spec and plan.** Write `spec.md`: requirements, design, and concerns to flag.
   - Have a fresh-context agent stress-test the design against the code.
   - Then plan in plan mode. The owner's approval of the plan approves the spec too.
   - Save the approved plan as `plan.md`. Later changes of course go in it as amendments.
3. **Build on a branch, test first.** Write the scenarios and see them fail, then write the code.
4. **Verify.**
   - `npm test` passes.
   - Break the fix on purpose and check that its scenario fails.
   - Check by eye in Chrome, as described under Commands.
5. **Review.** Run `/code-review` on the diff, in a fresh context. Fix what it confirms, each fix with a failing scenario first.
6. **Deliver.** Push the branch and open a PR that links the docs and lists what was verified. Wait for CI to pass. Never commit straight to `main`, and leave merging to the owner.
7. **After the merge.** Update local `main` and delete the branch. Confirm the Tests run on `main` passed and that the live site (GitHub Pages) serves the change.

A smaller change may need only `intent.md`; the owner says when. A bug fix always starts with a failing scenario.

## Conventions

- Colors are tokens on `:root`, with dark-mode overrides; check both themes.
- Anything from caltrain.com goes through `esc()` before it goes into HTML.
- Keep README's "Using it" in step with the controls.
