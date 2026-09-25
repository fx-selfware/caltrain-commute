// Given: the time, saved settings, the screen, and how caltrain.com behaves.
const { createBdd } = require("playwright-bdd");
const { test } = require("./fixtures");
const { expect } = require("@playwright/test");
const { moment, serveTimetable, open } = require("../support/app");

const { Given } = createBdd(test);

Given("it is {word} {word}", async ({ app }, day, time) => {
  app.at = moment(day, time);
});

Given("I haven't chosen my stations yet", async ({ app }) => {
  app.prefs = null;
});

Given("my commute is from {string} to {string}", async ({ app }, home, work) => {
  app.prefs = { home, work, stop: null };
});

Given("my commute is from {string} to {string} with a stop at {string}", async ({ app }, home, work, stop) => {
  app.prefs = { home, work, stop };
});

Given("I saved my stations with the older version: home {string}, work {string} and {string}", async ({ app }, home, a, b) => {
  app.prefs = { home, works: [a, b] };
});

Given("the screen is {int} by {int} pixels", async ({ page }, width, height) => {
  await page.setViewportSize({ width, height });
});

// The app has loaded (and saved) the timetable, and its service worker controls the page.
Given("the app is ready to work offline", async ({ page, app }) => {
  await open(page, app);
  await expect(page.locator("#sign .eyebrow")).toHaveText("Next train");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) {
      await new Promise(resolve => navigator.serviceWorker.addEventListener("controllerchange", resolve, { once: true }));
    }
  });
});

// These apply from the next request on, so they work before or after the app opens.
Given("caltrain.com can't be reached", async ({ page, app }) => {
  app.timetable = { fail: true };
  await serveTimetable(page, app.timetable);
});

Given("caltrain.com is reachable again", async ({ page, app }) => {
  app.timetable = undefined;
  await serveTimetable(page);
});

Given("caltrain.com answers with error {int}", async ({ app }, status) => {
  app.timetable = { status, body: "busy" };
});

Given("caltrain.com has redesigned its timetable page", async ({ app }) => {
  app.timetable = { body: "<html><body>Redesigned!</body></html>" };
});

Given("caltrain.com is slow to answer", async ({ app }) => {
  app.timetable = { wait: new Promise(resolve => app.answer = resolve) };
});
