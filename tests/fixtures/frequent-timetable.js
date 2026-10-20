// A long, deterministic timetable for scrolling scenarios. Each direction has
// 114 weekday locals, every ten minutes from 05:00 through 23:50 at its origin.
// Southbound numbers: 1000 + 2*i; northbound: 1001 + 2*i (i = 0..113).
// Station offsets in travel order are 0, 20, 40, 55 and 75 minutes.
// As with timetable.html, this is served instead of ever reaching caltrain.com.
const stations = [
  ["San Francisco", 7001], ["Millbrae", 7006], ["Palo Alto", 7014],
  ["Mountain View", 7017], ["San Jose Diridon", 7021],
];
const times = Array.from({ length: 114 }, (_, i) => 300 + i * 10);
const time = min => {
  const h = Math.floor(min / 60) % 24;
  return `${h % 12 || 12}:${String(min % 60).padStart(2, "0")}${h < 12 ? "am" : "pm"}`;
};
const table = north => {
  const stops = north ? [...stations].reverse() : stations;
  return `<table class="caltrain_schedule" data-direction="${north ? "northbound" : "southbound"}">
    <tr>${times.map((_, i) => `<td data-trip-id="${1000 + 2 * i + Number(north)}" data-route-id="Local Weekday" data-service-type="weekday"></td>`).join("")}</tr>
    ${stops.map(([name, id], s) => `<tr data-stop-id="${id}"><td class="station">${name}</td>${times.map(t => `<td class="timepoint">${time(t + [0, 20, 40, 55, 75][s])}</td>`).join("")}</tr>`).join("")}
  </table>`;
};
module.exports = `<!doctype html><select name="filter_origin">${stations.map(([name, id]) => `<option value="${id}">${name}</option>`).join("")}</select>${table(false)}${table(true)}`;
