// Downloading the timetable from caltrain.com, and what happens when that fails.
const { test } = require("@playwright/test");
const { open, expect, serveTimetable, eyebrow } = require("./helpers");

const WED_MORNING = "2026-09-23T07:10";

test("says it's loading until the timetable arrives", async ({ page }) => {
  let release;
  await open(page, { at: WED_MORNING, timetable: { wait: new Promise(r => release = r) } });
  await expect(page.locator("#sign .empty")).toHaveText("Loading timetable…");
  release();
  await expect(eyebrow(page)).toHaveText("Next train");
  await expect(page.locator("#foot")).toContainText("Timetable loaded from caltrain.com at 7:10am today.");
});

test("offers to try again when caltrain.com can't be reached", async ({ page }) => {
  await open(page, { at: WED_MORNING, timetable: { fail: true } });
  await expect(page.locator("#sign .empty")).toHaveText("Couldn't load the timetable");
  await expect(page.locator("#sign .meta")).toHaveText("Couldn't reach caltrain.com.");

  await serveTimetable(page);
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(eyebrow(page)).toHaveText("Next train");
});

test("reports a server error", async ({ page }) => {
  await open(page, { at: WED_MORNING, timetable: { status: 503, body: "busy" } });
  await expect(page.locator("#sign .meta")).toHaveText("The caltrain.com server returned an error (HTTP 503).");
});

test("reports a page layout it doesn't recognize", async ({ page }) => {
  await open(page, { at: WED_MORNING, timetable: { body: "<html><body>Redesigned!</body></html>" } });
  await expect(page.locator("#sign .meta")).toHaveText("The caltrain.com timetable has a layout this page doesn't recognize.");
});

test("keeps working from the saved timetable when caltrain.com is down", async ({ page }) => {
  await open(page, { at: WED_MORNING });
  await expect(eyebrow(page)).toHaveText("Next train");

  await serveTimetable(page, { fail: true });
  await page.reload();
  await expect(eyebrow(page)).toHaveText("Next train");
  await expect(page.locator("#sign .trip-train")).toContainText("Train 502");
  await expect(page.locator("#foot .warn")).toHaveText("Couldn't reach caltrain.com.");
  await expect(page.locator("#foot")).toContainText("Showing the timetable saved at 7:10am today.");
});
