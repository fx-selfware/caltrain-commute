// Settings: stations, the optional stop, time format, and settings saved by older versions.
const { test } = require("@playwright/test");
const { open, expect, HOME, WORK, STOP, sign } = require("./helpers");

const WED_MORNING = "2026-09-23T07:10";

test("first run asks for stations, listed A to Z", async ({ page }) => {
  await open(page, { at: WED_MORNING, prefs: null });
  await expect(page.locator("#setup")).toBeVisible();
  await expect(page.locator("#controls")).toBeHidden();
  await expect(page.locator("#cancel")).toBeHidden();
  await expect(page.locator("#home-stn option")).toHaveText([
    "Choose a station", "Gilroy", "Millbrae", "Mountain View", "Palo Alto", "San Francisco", "San Jose Diridon",
  ]);
});

test("saving checks the stations", async ({ page }) => {
  await open(page, { at: WED_MORNING, prefs: null });
  const err = page.locator("#setup-err");
  await page.locator("#save").click();
  await expect(err).toHaveText("Choose your home station.");
  await page.locator("#home-stn").selectOption(HOME);
  await page.locator("#save").click();
  await expect(err).toHaveText("Choose your work station.");
  await page.locator("#work-stn").selectOption(HOME);
  await page.locator("#save").click();
  await expect(err).toHaveText("Home and work need to be different stations.");
});

test("the stop list offers only stations between home and work", async ({ page }) => {
  await open(page, { at: WED_MORNING, prefs: null });
  const stop = page.locator("#stop-stn"), hint = page.locator("#stop-hint");
  await expect(stop).toBeDisabled();
  await expect(hint).toHaveText("Choose home and work first.");

  await page.locator("#home-stn").selectOption(HOME);
  await page.locator("#work-stn").selectOption(WORK);
  await expect(stop).toBeEnabled();
  await expect(stop.locator("option")).toHaveText(["None", "Millbrae", "Palo Alto"]);

  await page.locator("#home-stn").selectOption(STOP);
  await expect(stop).toBeDisabled();
  await expect(hint).toHaveText("There are no stations between home and work.");
});

test("saving shows the next train and remembers the stations", async ({ page }) => {
  await open(page, { at: WED_MORNING, prefs: null });
  await page.locator("#home-stn").selectOption(HOME);
  await page.locator("#work-stn").selectOption(WORK);
  await page.locator("#stop-stn").selectOption(STOP);
  await page.locator("#save").click();

  await expect(page.locator("#setup")).toBeHidden();
  await expect(sign(page).locator(".eyebrow")).toHaveText("Next train");
  expect(JSON.parse(await page.evaluate(() => localStorage.getItem("commute.stations"))))
    .toEqual({ home: HOME, work: WORK, stop: STOP });

  await page.reload();
  await expect(sign(page).locator(".eyebrow")).toHaveText("Next train");
});

test("the gear opens settings, and Cancel leaves them as they were", async ({ page }) => {
  await open(page, { at: WED_MORNING });
  await page.getByRole("button", { name: "Settings" }).click();
  await expect(page.locator("#home-stn")).toHaveValue(HOME);
  await expect(page.locator("#work-stn")).toHaveValue(WORK);
  await page.locator("#work-stn").selectOption("San Jose Diridon");
  await page.locator("#cancel").click();

  await expect(page.locator("#setup")).toBeHidden();
  await expect(page.locator("#sign .itin li").last()).toContainText(WORK);
});

test.describe("time format", () => {
  test("follows the device's region by default: 12-hour in the US", async ({ page }) => {
    await open(page, { at: WED_MORNING });
    await expect(page.locator("#sign .itin .t").first()).toHaveText("7:30am");
  });

  test.describe("24-hour region", () => {
    test.use({ locale: "en-GB" });
    test("defaults to 24-hour", async ({ page }) => {
      await open(page, { at: WED_MORNING });
      await expect(page.locator("#sign .itin .t").first()).toHaveText("07:30");
    });
  });

  test("can be changed in settings and is remembered", async ({ page }) => {
    await open(page, { at: WED_MORNING });
    await page.getByRole("button", { name: "Settings" }).click();
    await page.getByRole("button", { name: "24-hour" }).click();
    await page.locator("#save").click();
    await expect(page.locator("#sign .itin .t").first()).toHaveText("07:30");
    await expect(page.locator("#rows .dep").first()).toHaveText("07:30");

    await page.reload();
    await expect(page.locator("#sign .itin .t").first()).toHaveText("07:30");
  });
});

test("settings from the version with two work stations are converted", async ({ page }) => {
  await open(page, { at: WED_MORNING, prefs: { home: HOME, works: [STOP, WORK] } });
  await expect(page.locator("#listHead span")).toHaveText([HOME, STOP, WORK, "Train"]);
  expect(JSON.parse(await page.evaluate(() => localStorage.getItem("commute.stations"))))
    .toEqual({ home: HOME, work: WORK, stop: STOP });
});
