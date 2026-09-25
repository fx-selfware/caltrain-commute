// Then: the platform-sign card at the top.
const { createBdd } = require("playwright-bdd");
const { expect } = require("@playwright/test");
const { test } = require("./fixtures");
const { itinerary } = require("../support/app");

const { Then } = createBdd(test);
const card = page => page.locator("#sign");

Then("the card is headed {string}", async ({ page }, text) => {
  await expect(card(page).locator(".eyebrow")).toHaveText(text);
});

Then("the card shows {string}", async ({ page }, text) => {
  await expect(card(page)).toContainText(text);
});

Then("the card shows {word} train {int}", async ({ page }, kind, n) => {
  await expect(card(page).locator(".trip-train .chip")).toHaveText(kind);
  await expect(card(page).locator(".trip-train")).toContainText(`Train ${n}`);
});

Then("the countdown says {string}", async ({ page }, text) => {
  await expect(card(page).locator(".count")).toHaveText(text);
});

Then("the countdown is dimmed", async ({ page }) => {
  await expect(card(page).locator(".count")).toHaveClass(/gone/);
});

Then("there is no countdown", async ({ page }) => {
  await expect(card(page).locator(".count")).toHaveCount(0);
});

// Rows of time, station and (for the stop) its tag.
Then("the card's itinerary is:", async ({ page }, table) => {
  const want = table.raw().map(cells => cells.filter(c => c !== ""));
  await expect.poll(() => itinerary(page)).toEqual(want);
});

Then("the trains after it are:", async ({ page }, table) => {
  await expect(card(page).locator(".after span")).toHaveText(["Then", ...table.raw().map(([text]) => text)]);
});

Then("screen readers call the card {string}", async ({ page }, label) => {
  await expect(card(page)).toHaveAttribute("aria-label", label);
});

Then("the card has keyboard focus", async ({ page }) => {
  await expect(card(page)).toBeFocused();
});

// Not scrolled up under the sticky controls.
Then("the top of the card is in view", async ({ page }) => {
  const controls = await page.locator("#controls").boundingBox();
  expect((await card(page).boundingBox()).y).toBeGreaterThanOrEqual(controls.y + controls.height);
});

Then("the card has changed height", async ({ page, app }) => {
  expect((await card(page).boundingBox()).height).not.toBe(app.noted.card);
});
