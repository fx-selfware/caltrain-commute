// Tests run the real index.html from a local server in a phone-sized Chromium and WebKit.
// caltrain.com is never contacted: each test serves tests/fixtures/timetable.html in its
// place and sets the clock (see tests/helpers.js).
const { defineConfig, devices } = require("@playwright/test");

const PORT = 8766;

module.exports = defineConfig({
  testDir: "tests",
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
