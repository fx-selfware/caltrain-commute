# Intent: tests never reach the real caltrain.com

Status: small fix; the intent is the only document.
Author: Fan Xia (drafted with Claude)
Date: 2026-09-25

## Problem

The Tests run on `main` after PR #3 failed. The code was the same as PR #3's, whose run passed. In WebKit, the scenario "Opening another page doesn't replace the app's offline copy" showed Express train 506. That's a real Caltrain train, not one in the test fixture, so the app had reached the real caltrain.com. Repeating the scenario locally reproduced it about 1 run in 5, in WebKit only.

With a service worker in control of the page, Playwright's WebKit sometimes sends the page's requests past the test's fake caltrain.com. Moving the fake from the page to the whole browser context didn't help. It's a limitation of the test tool, not of the app or of Safari. `CLAUDE.md` promises that tests never contact caltrain.com, but nothing enforced that. The scenario only caught this because it happened to expect a train that exists only in the fixture.

## Proposed outcome

- **A guard enforces the promise:** any scenario, in either browser, that gets a response from the real caltrain.com fails with "reached the real caltrain.com". The fake marks its responses so a real one stands out.
- **Scenarios with the service worker on run in Chromium only.** The worker's logic doesn't depend on the browser, and the other scenarios still run in both.
- `main` is green again.

## Constraints

- No change to the app.
- WebKit keeps running every other scenario.

## Open questions

None.
