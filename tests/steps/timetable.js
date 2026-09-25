// Then: the timetable below the card.
const { createBdd } = require("playwright-bdd");
const { expect } = require("@playwright/test");
const { test } = require("./fixtures");
const { row, rowNumbers } = require("../support/app");

const { Then } = createBdd(test);

// "the timetable lists trains 502, 402, 106 and 108"
Then(/^the timetable lists trains ([\d, and]+)$/, async ({ page }, list) => {
  await expect.poll(() => rowNumbers(page)).toEqual(list.match(/\d+/g));
});

Then("the timetable doesn't list train {int}", async ({ page }, n) => {
  await expect(row(page, n)).toHaveCount(0);
});

Then("the timetable is empty", async ({ page }) => {
  await expect(page.locator("#rows li")).toHaveCount(0);
});

Then("the timetable's columns are:", async ({ page }, table) => {
  await expect(page.locator("#listHead span")).toHaveText(table.raw()[0]);
});

Then("the timetable is headed {string}", async ({ page }, text) => {
  await expect(page.locator("#listNote")).toHaveText(text);
});

// The cell in the column with that heading.
Then("train {int} shows {string} under {string}", async ({ page }, n, text, heading) => {
  const headings = await page.locator("#listHead span").allTextContents();
  const col = headings.indexOf(heading);
  expect(col, `no "${heading}" column in ${headings}`).toBeGreaterThanOrEqual(0);
  await expect(row(page, n).locator(".dep, .arr, .via, .ride, .train").nth(col)).toHaveText(text);
});

Then("train {int} is highlighted as the next train", async ({ page }, n) => {
  await expect(row(page, n)).toHaveClass(/\bnext\b/);
});

Then("train {int} is shown as already left", async ({ page }, n) => {
  await expect(row(page, n)).toHaveClass(/\bpast\b/);
});

Then("train {int} is marked as picked", async ({ page }, n) => {
  await expect(row(page, n).getByRole("button")).toHaveAttribute("aria-pressed", "true");
  await expect(row(page, n)).toHaveClass(/\bpicked\b/);
});

Then("train {int} isn't marked as picked", async ({ page }, n) => {
  await expect(row(page, n).getByRole("button")).toHaveAttribute("aria-pressed", "false");
});

Then("no train is marked as picked", async ({ page }) => {
  await expect(page.locator('#rows [aria-pressed="true"]')).toHaveCount(0);
});

Then("train {int} has keyboard focus", async ({ page }, n) => {
  await expect(row(page, n).getByRole("button")).toBeFocused();
});

Then("train {int} is still in the same place on screen", async ({ page, app }, n) => {
  expect(Math.abs((await row(page, n).boundingBox()).y - app.noted.y)).toBeLessThan(1);
});
