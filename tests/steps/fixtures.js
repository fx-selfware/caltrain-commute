// The test object the steps run with: playwright-bdd's, plus what a scenario sets up
// before the app opens.
const { test: base } = require("playwright-bdd");
const { expect } = require("@playwright/test");
const { FAKE } = require("../support/app");

exports.test = base.extend({
  // Filled in by Given steps and read when the app opens.
  app: async ({}, use) => {
    await use({ at: null, prefs: null, timetable: undefined, noted: null });
  },
  // A tag like @en-GB runs the scenario on a phone set to that region.
  locale: async ({ $tags, locale }, use) => {
    const tag = $tags.find(t => /^@[a-z]{2}-[A-Z]{2}$/.test(t));
    await use(tag ? tag.slice(1) : locale);
  },
  // Tests never contact caltrain.com: fail any scenario in which a response came from
  // the real site rather than the fake.
  noRealCaltrain: [async ({ page }, use) => {
    const real = [];
    page.context().on("response", response => {
      if (new URL(response.url()).hostname.endsWith("caltrain.com") && !response.headers()[FAKE]) real.push(response.url());
    });
    await use();
    expect(real, "reached the real caltrain.com").toEqual([]);
  }, { auto: true }],
  // Scenarios tagged @service-worker run with the app's offline copy; the rest block it.
  serviceWorkers: async ({ $tags, serviceWorkers }, use) => {
    await use($tags.includes("@service-worker") ? "allow" : serviceWorkers);
  },
});
