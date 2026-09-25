// Scenarios in tests/features/*.feature run against the real index.html, served locally,
// in a phone-sized Chromium and WebKit. playwright-bdd turns them into Playwright tests
// (in .features-gen/) using the steps in tests/steps/. caltrain.com is never contacted:
// tests/fixtures/timetable.html stands in for it, and the clock is set per scenario.
const { defineConfig, devices } = require("@playwright/test");
const { defineBddConfig } = require("playwright-bdd");

const PORT = 8766;

const testDir = defineBddConfig({
  features: "tests/features/*.feature",
  steps: "tests/steps/*.js",
});

module.exports = defineConfig({
  testDir,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    locale: "en-US",
    timezoneId: "America/Los_Angeles",
    // The service worker would serve cached copies and bypass the fake timetable.
    serviceWorkers: "block",
    reducedMotion: "reduce",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Pixel 7"] } },
    { name: "webkit", use: { ...devices["iPhone 13"] } },
  ],
  webServer: {
    command: `python3 -m http.server ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    stderr: "ignore",
  },
});
