// Then: the platform-sign card at the top.
const { createBdd } = require("playwright-bdd");
const { expect } = require("@playwright/test");
const { test } = require("./fixtures");
const { itinerary } = require("../support/app");

const { When, Then } = createBdd(test);
const card = page => page.locator("#sign");
// The button on the route line that shows or hides the stops on the way.
const stopsButton = page => card(page).locator(".itin").getByRole("button");

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

// The itinerary's second row, right after the departure station.
Then("the card's {string} button is just under the departure", async ({ page }, name) => {
  await expect(card(page).locator(".itin > li").nth(1).getByRole("button", { name, exact: true })).toBeVisible();
});

Then("the card's stops are {word}", async ({ page }, state) => {
  await expect(stopsButton(page)).toHaveAttribute("aria-expanded", String(state === "expanded"));
});

Then("the card has no button for more stops", async ({ page }) => {
  await expect(stopsButton(page)).toHaveCount(0);
});

When("I note where the card's stops button is on screen", async ({ app, page }) => {
  app.notedStops = (await stopsButton(page).boundingBox()).y;
});

Then("the card's stops button is still in the same place on screen", async ({ app, page }) => {
  // Let animation frames and any delayed browser scroll anchoring settle first.
  await page.clock.runFor(32);
  expect(Math.abs((await stopsButton(page).boundingBox()).y - app.notedStops)).toBeLessThan(1);
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

// Check the viewport itself: the top controls may have scrolled out of view.
Then("the top of the card is in view", async ({ page }) => {
  const box = await card(page).boundingBox();
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.y).toBeLessThan(page.viewportSize().height);
});

Then("the card has changed height", async ({ page, app }) => {
  expect((await card(page).boundingBox()).height).not.toBe(app.noted.card);
});
