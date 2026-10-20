// Scrolling assertions check rendered positions and hit targets, not app state.
const { createBdd } = require("playwright-bdd");
const { expect } = require("@playwright/test");
const { test } = require("./fixtures");
const { row, serveTimetable } = require("../support/app");
const frequent = require("../fixtures/frequent-timetable");
const { Given, When, Then } = createBdd(test);

Given("there is a train every ten minutes", async ({ app }) => {
  app.timetable = { body: frequent };
});
Given("the timetable has only the usual few trains", async ({ app }) => {
  app.timetable = undefined;
});

When("I scroll train {int} to {int} pixels from the top", async ({ page }, n, y) => {
  await row(page, n).evaluate((el, y) => window.scrollBy(0, el.getBoundingClientRect().top - y), y);
});
When("I place the earlier-trains action at the bottom of the screen", async ({ page }) => {
  await page.locator("#toggle-past").evaluate(el => window.scrollBy(0, el.getBoundingClientRect().bottom - innerHeight));
});
When("I move keyboard focus to train {int}", async ({ page }, n) => {
  await row(page, n).getByRole("button").focus();
});
When("I press Shift+Tab", async ({ page, browserName }) => {
  // Safari's default keyboard navigation needs Option to include buttons.
  await page.keyboard.press(browserName === "webkit" ? "Alt+Shift+Tab" : "Shift+Tab");
});
When("I return to the app", async ({ page }) => {
  await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
});
Given("the next timetable starts with train {int}", async ({ page }, first) => {
  // Change the served timetable markup, not the application's parsed data.
  const body = await page.evaluate(({ html, first }) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    for (const table of doc.querySelectorAll("table.caltrain_schedule")) {
      const heads = [...table.querySelectorAll("[data-trip-id]")];
      const removed = heads.map(h => Number(h.dataset.tripId) < first);
      for (const tr of table.querySelectorAll("tr[data-stop-id]")) {
        [...tr.querySelectorAll(".timepoint")].forEach((td, i) => { if (removed[i]) td.remove(); });
      }
      heads.forEach((h, i) => { if (removed[i]) h.remove(); });
    }
    return doc.documentElement.outerHTML;
  }, { html: frequent, first });
  await serveTimetable(page, { body });
});
When("I press Enter", async ({ page }) => { await page.keyboard.press("Enter"); });
When("I press Space", async ({ page }) => { await page.keyboard.press("Space"); });

Then("the top controls are off screen", async ({ page }) => {
  const box = await page.locator("#controls").boundingBox();
  expect(box.y + box.height).toBeLessThanOrEqual(0);
});
Then("the timetable header is pinned above the trains", async ({ page }) => {
  const box = await page.locator("#listHeader").boundingBox();
  expect(box).not.toBeNull();
  expect(Math.abs(box.y)).toBeLessThan(1);
  const labels = await page.locator("#listHead").boundingBox();
  expect(Math.abs(labels.y + labels.height - box.y - box.height)).toBeLessThan(1);
});

// Also check that it can be tapped without Playwright scrolling it into view.
Then("the {string} button is in the viewport", async ({ page }, name) => {
  const button = page.getByRole("button", { name, exact: true });
  await expect(button).toBeInViewport({ ratio: 1 });
  expect(await button.evaluate(el => {
    const r = el.getBoundingClientRect();
    return el.contains(document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2));
  })).toBe(true);
});
Then("the {string} button has keyboard focus", async ({ page }, name) => {
  await expect(page.getByRole("button", { name, exact: true })).toBeFocused();
});
Then("the earlier-trains hint says {string}", async ({ page }, text) => {
  await expect(page.locator("#past-hint")).toHaveText(text);
  await expect(page.locator("#past-hint")).toBeVisible();
});
Then("the earlier-trains action is {word}", async ({ page }, state) => {
  await expect(page.locator("#toggle-past")).toHaveAttribute("aria-expanded", String(state === "expanded"));
  await expect(page.locator("#toggle-past")).toHaveAttribute("aria-controls", "rows");
});
Then("train {int} begins immediately below the pinned header", async ({ page }, n) => {
  const header = await page.locator("#listHeader").boundingBox();
  expect(header).not.toBeNull();
  expect(Math.abs(header.y)).toBeLessThan(1);
  expect(Math.abs((await row(page, n).boundingBox()).y - header.y - header.height)).toBeLessThan(1);
});
Then("there is no earlier-trains action or space reserved for it", async ({ page }) => {
  await expect(page.locator("#toggle-past")).toBeHidden();
  const header = await page.locator("#listHeader").boundingBox();
  const labels = await page.locator("#listHead").boundingBox();
  expect(header).not.toBeNull();
  expect(header.height).toBe(labels.height);
});
Then("the timetable header does not cover the footer", async ({ page }) => {
  const header = await page.locator("#listHeader").boundingBox();
  const table = await page.locator("#list").boundingBox();
  const footer = await page.locator("#foot").boundingBox();
  expect(header).not.toBeNull();
  expect(header.y + header.height).toBeLessThanOrEqual(table.y + table.height);
  expect(header.y + header.height).toBeLessThan(footer.y);
  await expect(page.locator("#foot")).toBeInViewport();
});
Then("there is no timetable header on screen", async ({ page }) => {
  await expect(page.locator("#listHeader")).toBeHidden();
});
Then("train {int} is in the viewport below the header", async ({ page }, n) => {
  const header = await page.locator("#listHeader").boundingBox();
  await expect(row(page, n)).toBeInViewport({ ratio: 1 });
  expect((await row(page, n).boundingBox()).y).toBeGreaterThanOrEqual(header.y + header.height);
});
Then("the empty timetable has rounded bottom corners", async ({ page }) => {
  const corners = await page.locator("#listHeader").evaluate(el => {
    const style = getComputedStyle(el);
    return [style.borderBottomLeftRadius, style.borderBottomRightRadius].map(parseFloat);
  });
  expect(corners.every(radius => radius > 0)).toBe(true);
  await expect(page.locator("#listHead")).toHaveCSS("border-bottom-width", "0px");
});
Then("there is no horizontal page overflow", async ({ page }) => {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
