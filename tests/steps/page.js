// Then: settings, the controls at the top, buttons, the footer and scrolling.
const { createBdd } = require("playwright-bdd");
const { expect } = require("@playwright/test");
const { test } = require("./fixtures");

const { Then } = createBdd(test);

Then("I see the stand-in timetable, not the app", async ({ page }) => {
  await expect(page.locator('select[name="filter_origin"]')).toHaveCount(1);
  await expect(page.locator("#sign")).toHaveCount(0);
});

Then("I'm asked to choose my stations", async ({ page }) => {
  await expect(page.locator("#setup")).toBeVisible();
  await expect(page.locator("#controls")).toBeHidden();
});

Then("the settings are closed", async ({ page }) => {
  await expect(page.locator("#setup")).toBeHidden();
});

Then("the station choices are:", async ({ page }, table) => {
  await expect(page.locator("#home-stn option")).toHaveText(table.raw().map(([name]) => name));
});

Then("the stop choices are:", async ({ page }, table) => {
  await expect(page.locator("#stop-stn")).toBeEnabled();
  await expect(page.locator("#stop-stn option")).toHaveText(table.raw().map(([name]) => name));
});

Then("I can't choose a stop, because {string}", async ({ page }, hint) => {
  await expect(page.locator("#stop-stn")).toBeDisabled();
  await expect(page.locator("#stop-hint")).toHaveText(hint);
});

Then("the settings show {string} as my {word} station", async ({ page }, name, which) => {
  await expect(page.locator(`#${which}-stn`)).toHaveValue(name);
});

Then("I'm told {string}", async ({ page }, text) => {
  await expect(page.locator("#setup-err")).toHaveText(text);
});

Then("my saved stations are {string} to {string}", async ({ page }, home, work) => {
  expect(JSON.parse(await page.evaluate(() => localStorage.getItem("commute.stations"))))
    .toEqual({ home, work, stop: null });
});

Then("my saved stations are {string} to {string} with a stop at {string}", async ({ page }, home, work, stop) => {
  expect(JSON.parse(await page.evaluate(() => localStorage.getItem("commute.stations"))))
    .toEqual({ home, work, stop });
});

Then("the {word} schedule is selected", async ({ page }, day) => {
  await expect(page.locator(`#day-${day.toLowerCase()}`)).toHaveAttribute("aria-pressed", "true");
});

Then("the {word} direction is selected", async ({ page }, dir) => {
  await expect(page.locator(`#dir-${dir.toLowerCase()}`)).toHaveAttribute("aria-pressed", "true");
});

Then("the date shown is {string}", async ({ page }, text) => {
  await expect(page.locator("#today")).toContainText(text);
});

Then("there is a {string} button", async ({ page }, name) => {
  await expect(page.getByRole("button", { name, exact: true })).toBeVisible();
});

// Hidden buttons aren't in the accessibility tree, so this covers those too.
Then("there is no {string} button", async ({ page }, name) => {
  await expect(page.getByRole("button", { name, exact: true })).toHaveCount(0);
});

Then("the footer says {string}", async ({ page }, text) => {
  await expect(page.locator("#foot")).toContainText(text);
});

Then("the footer warns {string}", async ({ page }, text) => {
  await expect(page.locator("#foot .warn")).toHaveText(text);
});

Then("the footer links to {string}", async ({ page }, href) => {
  await expect(page.locator("#foot a")).toHaveAttribute("href", href);
});

Then("the page is scrolled to the top", async ({ page }) => {
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
});
