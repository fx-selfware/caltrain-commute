// Shared setup: a fake caltrain.com, a fixed Pacific clock, and saved settings.
const fs = require("fs");
const path = require("path");
const { expect } = require("@playwright/test");

const FIXTURE = fs.readFileSync(path.join(__dirname, "fixtures", "timetable.html"), "utf8");
const SOURCE = "https://www.caltrain.com/**";

// Home and work in the fixture, with Palo Alto and Millbrae between them.
const HOME = "San Francisco";
const WORK = "Mountain View";
const STOP = "Palo Alto";

// Serve the fixture (or another response) where the page expects caltrain.com.
// `wait` holds the response back until that promise settles.
async function serveTimetable(page, { body = FIXTURE, status = 200, fail = false, wait } = {}) {
  await page.unroute(SOURCE);
  await page.route(SOURCE, async route => {
    await wait;
    return fail
      ? route.abort("internetdisconnected")
      : route.fulfill({ status, body, contentType: "text/html", headers: { "access-control-allow-origin": "*" } });
  });
}

// Open the app at a Pacific wall-clock time, e.g. "2026-09-23T07:10" (a Wednesday).
// `prefs` is saved as the stations setting before the page loads; null means first run.
async function open(page, { at, prefs = { home: HOME, work: WORK, stop: null }, clock, hash = "", timetable } = {}) {
  // Time stands still until a test moves it, so countdowns are exact.
  await page.clock.install({ time: pacific(at) });
  await page.clock.pauseAt(pacific(at));
  await serveTimetable(page, timetable);
  await page.addInitScript(({ prefs, clock }) => {
    // Only on the first load, so a reload keeps whatever the test changed.
    if (sessionStorage.getItem("seeded")) return;
    sessionStorage.setItem("seeded", "1");
    if (prefs) localStorage.setItem("commute.stations", JSON.stringify(prefs));
    if (clock) localStorage.setItem("commute.clock", clock);
  }, { prefs, clock });
  await page.goto("/" + (hash ? "#" + hash : ""));
}

// "2026-09-23T07:10" in Pacific time. Pacific is UTC-7 from March to November 2026.
function pacific(local) {
  return new Date(local + ":00-07:00");
}

// Jump the fake clock to a later Pacific time. Timers that fall due (the page's
// 15-second redraw) fire once.
async function advanceTo(page, local) {
  await page.clock.fastForward(pacific(local).getTime() - await page.evaluate(() => Date.now()));
}

const sign = page => page.locator("#sign");
const eyebrow = page => page.locator("#sign .eyebrow");
const countdown = page => page.locator("#sign .count");
const rows = page => page.locator("#rows li");
const row = (page, n) => page.locator("#rows li").filter({ has: page.locator(".num", { hasText: new RegExp(`^${n}$`) }) });

// Train numbers on the rows, top to bottom.
async function rowNumbers(page) {
  return page.locator("#rows .num").allTextContents();
}

// The itinerary on the card as [time, station, tag] rows.
async function itinerary(page) {
  return page.locator("#sign .itin li").evaluateAll(lis => lis.map(li =>
    [...li.querySelectorAll(".t, .s, .tag")].map(el => el.textContent.trim())));
}

module.exports = {
  FIXTURE, HOME, WORK, STOP, open, pacific, advanceTo, serveTimetable,
  sign, eyebrow, countdown, rows, row, rowNumbers, itinerary, expect,
};
