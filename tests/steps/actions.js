// When: opening the app, tapping, typing, scrolling, and time passing.
const { createBdd } = require("playwright-bdd");
const { test } = require("./fixtures");
const { open, now, nextAt, row } = require("../support/app");

const { When } = createBdd(test);

When("I open the app", async ({ page, app }) => {
  await open(page, app);
});

When("I open the app with {string} in the address", async ({ page, app }, hash) => {
  await open(page, { ...app, hash });
});

When("I reload the app", async ({ page }) => {
  await page.reload();
});

When("caltrain.com answers", async ({ app }) => {
  app.answer();
});

When("I tap train {int}", async ({ page }, n) => {
  await row(page, n).click();
});

When("I tap {string}", async ({ page }, name) => {
  await page.getByRole("button", { name, exact: true }).click();
});

When("I press Enter on train {int}", async ({ page }, n) => {
  await row(page, n).getByRole("button").focus();
  await page.keyboard.press("Enter");
});

When("I move keyboard focus to {string}", async ({ page }, name) => {
  await page.getByRole("button", { name, exact: true }).focus();
});

When("I choose {string} as my home station", async ({ page }, name) => {
  await page.locator("#home-stn").selectOption(name);
});

When("I choose {string} as my work station", async ({ page }, name) => {
  await page.locator("#work-stn").selectOption(name);
});

When("I choose {string} as my stop", async ({ page }, name) => {
  await page.locator("#stop-stn").selectOption(name);
});

When("I scroll to the bottom", async ({ page }) => {
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
});

When("I note where train {int} is on screen", async ({ page, app }, n) => {
  app.noted = { y: (await row(page, n).boundingBox()).y, card: (await page.locator("#sign").boundingBox()).height };
});

// Runs the page's timers on the way, including the redraw every 15 seconds.
When("{int} minute(s) pass(es)", async ({ page }, minutes) => {
  await page.clock.runFor(minutes * 60_000);
});

// Jumps ahead; timers that fall due fire once.
When("the time reaches {word}", async ({ page }, time) => {
  const t = await now(page);
  await page.clock.fastForward(nextAt(t, time).getTime() - t);
});

// The table on screen can be up to 15 seconds behind the clock.
When("the time reaches {word} before the page redraws", async ({ page }, time) => {
  await page.clock.setSystemTime(nextAt(await now(page), time));
});
