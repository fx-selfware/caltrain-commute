// Which day's trains show: weekends, trains after midnight, and moving on to the next
// day after the last train.
const { test } = require("@playwright/test");
const { open, expect, eyebrow, countdown, rowNumbers } = require("./helpers");

test("opens on the weekend schedule on a Saturday", async ({ page }) => {
  await open(page, { at: "2026-09-26T09:00" });
  await expect(page.locator("#day-weekend")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#sign .trip-train")).toContainText("Train 604");
  await expect(countdown(page)).toHaveText("in 1 h 0 min");
});

test("before 3am still counts as the previous service day", async ({ page }) => {
  // 12:05am Saturday is still Friday's weekday service; train 105 leaves at 12:15am.
  await open(page, { at: "2026-09-26T00:05", hash: "home" });
  await expect(page.locator("#today")).toContainText("Sat, Sep 26");
  await expect(page.locator("#day-weekday")).toHaveAttribute("aria-pressed", "true");
  await expect(eyebrow(page)).toHaveText("Next train");
  await expect(page.locator("#sign .trip-train")).toContainText("Train 105");
  await expect(countdown(page)).toHaveText("in 10 min");
});

test("after the last train it shows the next day's trains", async ({ page }) => {
  await open(page, { at: "2026-09-23T23:55" });
  await expect(eyebrow(page)).toHaveText("Next train · Thursday");
  await expect(countdown(page)).toHaveText("in 6 h 5 min");
  await expect(page.locator("#listNote")).toHaveText("Thursday's trains");
  expect(await rowNumbers(page)).toEqual(["102", "104", "502", "402", "106", "108"]);
});

test("after Friday's last train it moves on to the weekend schedule", async ({ page }) => {
  await open(page, { at: "2026-09-25T23:45" });
  await expect(page.locator("#day-weekday")).toHaveAttribute("aria-pressed", "true");
  await expect(countdown(page)).toHaveText("in 5 min");

  await page.clock.runFor(10 * 60_000);
  await expect(page.locator("#day-weekend")).toHaveAttribute("aria-pressed", "true");
  await expect(eyebrow(page)).toHaveText("Next train · Saturday");
  await expect(page.locator("#sign .trip-train")).toContainText("Train 602");
  await expect(countdown(page)).toHaveText("in 8 h 5 min");
  await expect(page.locator("#listNote")).toHaveText("Saturday's trains");
});
