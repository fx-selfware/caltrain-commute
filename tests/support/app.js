// Drives the app for the step definitions: a fake caltrain.com, a paused Pacific clock,
// saved settings, and ways to read the card and the timetable.
const fs = require("fs");
const path = require("path");

const FIXTURE = fs.readFileSync(path.join(__dirname, "..", "fixtures", "timetable.html"), "utf8");
const SOURCE = "https://www.caltrain.com/**";
// Every fake caltrain.com response carries this header, so a real one stands out.
const FAKE = "x-test-fixture";

// Scenarios name days of the week of Monday, September 21, 2026.
const DATES = {
  Monday: "2026-09-21", Tuesday: "2026-09-22", Wednesday: "2026-09-23", Thursday: "2026-09-24",
  Friday: "2026-09-25", Saturday: "2026-09-26", Sunday: "2026-09-27",
};
// Pacific time is UTC-7 all of September 2026.
const OFFSET = "-07:00";

// "7:10am" -> "07:10"
function clock24(time) {
  const m = /^(\d{1,2}):(\d{2})(am|pm)$/.exec(time);
  if (!m) throw new Error(`Write times like 7:10am, not "${time}"`);
  return `${String((+m[1] % 12) + (m[3] === "pm" ? 12 : 0)).padStart(2, "0")}:${m[2]}`;
}

// "Wednesday", "7:10am" -> that moment.
function moment(day, time) {
  if (!DATES[day]) throw new Error(`Unknown day "${day}"`);
  return new Date(`${DATES[day]}T${clock24(time)}:00${OFFSET}`);
}

// The next time the Pacific clock reads `time` after `now` (ms).
function nextAt(now, time) {
  const date = new Date(now - 7 * 3600e3).toISOString().slice(0, 10);
  const at = new Date(`${date}T${clock24(time)}:00${OFFSET}`);
  return at.getTime() <= now ? new Date(at.getTime() + 86400e3) : at;
}

// Serve the fixture (or another response) where the page expects caltrain.com.
// `wait` holds the response back until that promise settles.
async function serveTimetable(page, { body = FIXTURE, status = 200, fail = false, wait } = {}) {
  await page.unroute(SOURCE);
  await page.route(SOURCE, async route => {
    await wait;
    return fail
      ? route.abort("internetdisconnected")
      : route.fulfill({ status, body, contentType: "text/html", headers: { "access-control-allow-origin": "*", [FAKE]: "1" } });
  });
}

// Open the app at `at`, with `prefs` saved as the stations setting (null: first run).
async function open(page, { at, prefs, hash = "", timetable }) {
  // Time stands still until a step moves it, so countdowns are exact. The installed
  // clock starts running at once, so start it a little early and pause it at `at`.
  await page.clock.install({ time: at.getTime() - 10_000 });
  await page.clock.pauseAt(at);
  await serveTimetable(page, timetable);
  await page.addInitScript(prefs => {
    // Only on the first load, so a reload keeps whatever the scenario changed.
    if (sessionStorage.getItem("seeded")) return;
    sessionStorage.setItem("seeded", "1");
    if (prefs) localStorage.setItem("commute.stations", JSON.stringify(prefs));
  }, prefs);
  await page.goto("/" + hash);
}

const now = page => page.evaluate(() => Date.now());

// A timetable row, by train number.
const row = (page, n) => page.locator("#rows li").filter({ has: page.locator(".num", { hasText: new RegExp(`^${n}$`) }) });

// Train numbers on the rows, top to bottom.
const rowNumbers = page => page.locator("#rows .num").allTextContents();

// The card's itinerary as [time, station, tag] rows.
const itinerary = page => page.locator("#sign .itin li").evaluateAll(lis => lis.map(li =>
  [...li.querySelectorAll(".t, .s, .tag")].map(el => el.textContent.trim())));

module.exports = { FIXTURE, FAKE, moment, nextAt, serveTimetable, open, now, row, rowNumbers, itinerary };
