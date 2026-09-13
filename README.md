# QGIS UC 2026 Schedule Viewer

Mobile-friendly schedule viewer for the [QGIS User Conference 2026](https://talks.osgeo.org/qgis-uc2026/schedule/) (Chur, 5–7 October 2026).

**Live:** https://ismailsunni.github.io/qgis-uc-2026/

## Features

- Day tabs, a sticky hour rail to jump to any time of day, full-text search across all days, and room / track / type filters
- Long sessions are repeated as a compact "until 11:00 · room · title" line under every later slot they cover, so a 90-minute workshop is not invisible while you browse the half-hour talks
- Breaks and lunch derived from gaps where every room is idle, shown inline between slots
- Live clock in conference time (Europe/Zurich) with a **now** marker in the schedule, "Now" badges on running sessions, dimmed past sessions, and a *Jump to now* button
- Star sessions to build a personal **★ Mine** list, stored in the browser (localStorage) and shown across all days
- Session details with abstract, speakers, and a link to pretalx
- Reads the live pretalx feed, falling back to a deployed snapshot if the feed is unreachable
- Light/dark theme, no backend; page views only, via Umami (cookieless, no personal data)

## Development

```sh
npm install
npm run dev              # dev server
npm run fetch:schedule   # refresh public/schedule.json fallback from pretalx
npm run build            # type-check + production build
```

Append `?now=2026-10-06T10:15` to the URL to pin the clock and preview the live-marker behaviour outside the conference dates.

## Deployment

Pushes to `main` build and publish to GitHub Pages via `.github/workflows/deploy.yml`; a daily cron re-runs the build so the bundled fallback stays current.

Data: [talks.osgeo.org/qgis-uc2026](https://talks.osgeo.org/qgis-uc2026/schedule/) (pretalx).
