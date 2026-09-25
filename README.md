# Caltrain Commute

A phone-sized page for one Caltrain commute: the next train with a countdown, and the day's trains between your home and work stations, with an optional stop on the way.

## How it works

- Each time it opens, the page downloads the public timetable from caltrain.com (the same data behind the site's route explorer) and reads it in the browser. There's no server and no API key.
- Your stations are saved in your browser's local storage. They aren't in this repository and aren't sent anywhere: the page downloads the whole timetable and picks out your trains itself.
- The last timetable it loaded is kept, so the page still works offline or when caltrain.com is down, and it says when it's showing a saved copy.
- It's a progressive web app. Add it to your home screen to open it like an app.

It only lists single trains that stop at both of your stations, so a trip that needs a transfer shows "No weekday trains stop at both stations" (or "weekend"). For example, Gilroy, San Martin, Morgan Hill, Blossom Hill and Capitol are served only by South County trains that end at San Jose Diridon, so trips from those stations to anywhere farther north need a transfer.

After the last train of the night on your route, it shows the next day's trains. It shows scheduled times only, not real-time delays. On holidays that run a weekend schedule, switch to **Weekend** by hand.

## Using it

1. Open the page and choose your home and work stations. You can also pick a stop between them.
2. **Work** and **Home** switch the direction. The page opens on **Work**; add `#home` to the address to open on **Home** instead.
3. With a stop set, the timetable has a column for home, the stop and work, in travel order, with — where a train doesn't stop. The next-train card shows the time at the stop too.
4. Tap a train in the timetable to see it on the card instead of the next train, with its countdown (or how long ago it left), its stop, and the trains after it. Tap it again, tap the next train, or use **Back to next train** to go back. Switching direction or schedule also goes back. When you've scrolled down past the card, the round arrow button at the bottom right takes you back up.
5. The gear icon at the top opens **Settings**, where you change your stations and switch between 12- and 24-hour time. Both are saved in the browser.

## Running locally

```sh
python3 -m http.server 8765
```

Then open http://localhost:8765. The service worker only runs on `localhost` or HTTPS, so offline support and installing won't work from a LAN address.

After you change a file, reload twice: the service worker serves the cached version first and picks up the new one in the background.

## Tests

```sh
npm install
npx playwright install chromium webkit   # first time only
npm test
```

The tests are scenarios written in plain language (Gherkin), one file per feature in `tests/features/`, for example:

```gherkin
Scenario: The card shows the next train, its countdown and the two after it
  Given it is Wednesday 7:10am
  And my commute is from "San Francisco" to "Mountain View"
  When I open the app
  Then the card is headed "Next train"
  And the countdown says "in 20 min"
```

[Playwright](https://playwright.dev) runs them, through [playwright-bdd](https://vitalets.github.io/playwright-bdd/), against `index.html` in a phone-sized Chromium and WebKit (as on an iPhone). The steps are defined in `tests/steps/`. The tests don't contact caltrain.com: `tests/fixtures/timetable.html` stands in for its timetable, and each scenario sets the clock to a fixed Pacific time. The app itself still has no dependencies; `package.json` is only for the tests.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | The whole app: timetable download and parsing, station picker, and layout |
| `sw.js` | Service worker that caches the app, including its fonts, for offline use |
| `manifest.webmanifest` | App name, colors, and icons for installing |
| `icon.svg` | Icon source: a train front on a platform-edge warning strip |
| `apple-touch-icon.png`, `icon-192.png`, `icon-512.png` | Home-screen icons rendered from `icon.svg` |
| `fonts/` | The Overpass typeface (Latin, weights 400, 600 and 800) and its license |
| `tests/`, `playwright.config.js`, `package.json` | Test scenarios, their step definitions, and a stand-in for caltrain.com's timetable |
| `CLAUDE.md` | Commands and conventions for coding agents |
| `docs/` | One dated folder per piece of work (`YYYY-MM-DD-name`) with its intent, and for features its spec and plan, written before building it |

## Disclaimer

This project isn't affiliated with or endorsed by Caltrain. Timetable data comes from [caltrain.com](https://www.caltrain.com/).

## License

[MIT](LICENSE). The Overpass font files in `fonts/` are under the SIL Open Font License 1.1 ([`fonts/OFL.txt`](fonts/OFL.txt)).
