// The next-train card and the day's timetable.
const { test } = require("@playwright/test");
const { open, expect, HOME, WORK, STOP, eyebrow, countdown, row, rowNumbers, itinerary } = require("./helpers");

const WED_MORNING = "2026-09-23T07:10";

test("the card shows the next train with a countdown and the two after it", async ({ page }) => {
  await open(page, { at: WED_MORNING });
  await expect(eyebrow(page)).toHaveText("Next train");
  await expect(countdown(page)).toHaveText("in 20 min");
  expect(await itinerary(page)).toEqual([["7:30am", HOME], ["8:05am", WORK]]);
  await expect(page.locator("#sign .trip-train")).toHaveText("ExpressTrain 502");
  await expect(page.locator("#sign .trip-stats")).toHaveText("35 min ride · 1 stop");
  await expect(page.locator("#sign .after span")).toHaveText([
    "Then", "8:00am Limited · in 50 min", "9:00am Local · in 1 h 50 min",
  ]);
});

test("the countdown keeps time", async ({ page }) => {
  await open(page, { at: WED_MORNING });
  await page.clock.runFor(60_000);
  await expect(countdown(page)).toHaveText("in 19 min");
  await page.clock.runFor(19 * 60_000);
  await expect(countdown(page)).toHaveText("departing now");
});

test("the timetable hides earlier trains and highlights the next one", async ({ page }) => {
  await open(page, { at: WED_MORNING });
  await expect(page.locator("#listHead span")).toHaveText(["Depart", "Arrive", "Ride", "Train"]);
  expect(await rowNumbers(page)).toEqual(["502", "402", "106", "108"]);
  await expect(row(page, "502")).toHaveClass(/next/);
  await expect(row(page, "402").locator(".ride")).toHaveText("44 min");

  const more = page.locator("#toggle-past");
  await expect(more).toHaveText("Show 2 earlier trains");
  await more.click();
  expect(await rowNumbers(page)).toEqual(["102", "104", "502", "402", "106", "108"]);
  await expect(row(page, "104")).toHaveClass(/past/);
  await expect(more).toHaveText("Hide 2 earlier trains");
  await more.click();
  expect(await rowNumbers(page)).toEqual(["502", "402", "106", "108"]);
});

test("Home switches the direction", async ({ page }) => {
  await open(page, { at: WED_MORNING });
  await page.getByRole("button", { name: "Home", exact: true }).click();
  await expect(page.locator("#dir-home")).toHaveAttribute("aria-pressed", "true");
  expect(await itinerary(page)).toEqual([["4:50pm", WORK], ["5:45pm", HOME]]);
  await expect(countdown(page)).toHaveText("in 9 h 40 min");
  expect(await rowNumbers(page)).toEqual(["101", "501", "103", "105"]);
});

test("#home in the address opens on Home", async ({ page }) => {
  await open(page, { at: WED_MORNING, hash: "home" });
  await expect(page.locator("#dir-home")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#sign .trip-train")).toContainText("Train 101");
});

test("a stop gets its own column and a place on the card", async ({ page }) => {
  await open(page, { at: WED_MORNING, prefs: { home: HOME, work: WORK, stop: STOP } });
  await expect(page.locator("#listHead span")).toHaveText([HOME, STOP, WORK, "Train"]);
  // The express skips the stop.
  await expect(row(page, "502").locator(".via")).toHaveText("—");
  expect(await itinerary(page)).toEqual([["7:30am", HOME], ["—", STOP, "Skips"], ["8:05am", WORK]]);
  await expect(row(page, "402").locator(".via")).toHaveText("8:35am");

  await page.clock.runFor(21 * 60_000);
  expect(await itinerary(page)).toEqual([["8:00am", HOME], ["8:35am", STOP, "Stop"], ["8:44am", WORK]]);
});

test("the other day's schedule shows a summary instead of a next train", async ({ page }) => {
  await open(page, { at: WED_MORNING });
  await page.getByRole("button", { name: "Weekend" }).click();
  await expect(eyebrow(page)).toHaveText(`Weekend schedule · ${HOME} → ${WORK}`);
  await expect(page.locator("#sign .meta")).toHaveText("2 trains · first 8:00am · last 10:00am");
  expect(await rowNumbers(page)).toEqual(["602", "604"]);
  await expect(page.locator("#toggle-past")).toHaveCount(0);

  // It stays on the day picked through the 15-second redraw.
  await page.clock.runFor(30_000);
  await expect(page.locator("#day-weekend")).toHaveAttribute("aria-pressed", "true");

  await page.getByRole("button", { name: "Weekday" }).click();
  await expect(eyebrow(page)).toHaveText("Next train");
});

test("says so when no single train serves both stations", async ({ page }) => {
  await open(page, { at: WED_MORNING, prefs: { home: "Gilroy", work: HOME, stop: null } });
  await expect(page.locator("#sign .empty")).toHaveText("No weekday trains stop at both stations");
  await expect(page.locator("#rows li")).toHaveCount(0);
});

test("the footer links to the trip on caltrain.com", async ({ page }) => {
  await open(page, { at: WED_MORNING });
  await expect(page.locator("#foot a")).toHaveAttribute("href",
    "https://www.caltrain.com/?service=weekday&active_tab=route_explorer_tab&origin=7001&destination=7017");
});
