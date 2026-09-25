# Caltrain Commute

A phone-sized page for one Caltrain commute: the next train with a countdown, and the day's trains between your home station and one or two work stations.

## How it works

- Each time it opens, the page downloads the public timetable from caltrain.com (the same data behind the site's route explorer) and reads it in the browser. There's no server and no API key.
- Your stations are saved in your browser's local storage. They aren't in this repository and aren't sent anywhere: the page downloads the whole timetable and picks out your trains itself.
- The last timetable it loaded is kept, so the page still works offline or when caltrain.com is down, and it says when it's showing a saved copy.
- It's a progressive web app. Add it to your home screen to open it like an app.

It shows scheduled times only, not real-time delays. On holidays that run a weekend schedule, switch to **Weekend** by hand.

## Using it

1. Open the page and choose your home station and one or two work stations.
2. **Work** and **Home** switch the direction. The page opens on **Work**; add `#home` to the address to open on **Home** instead.
3. **Stations** changes your stations.

## Running locally

```sh
python3 -m http.server 8765
```

Then open http://localhost:8765. The service worker only runs on `localhost` or HTTPS, so offline support and installing won't work from a LAN address.

After you change a file, reload twice: the service worker serves the cached version first and picks up the new one in the background.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | The whole app: timetable download and parsing, station picker, and layout |
| `sw.js` | Service worker that caches the app and fonts for offline use |
| `manifest.webmanifest` | App name, colors, and icons for installing |
| `apple-touch-icon.png`, `icon-192.png`, `icon-512.png` | Home-screen icons |

## Disclaimer

This project isn't affiliated with or endorsed by Caltrain. Timetable data comes from [caltrain.com](https://www.caltrain.com/).

## License

[MIT](LICENSE)
