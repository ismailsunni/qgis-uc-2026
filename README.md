# QGIS UC 2026 Schedule Viewer

Mobile-friendly schedule viewer for the [QGIS User Conference 2026](https://talks.osgeo.org/qgis-uc2026/schedule/) (Chur, 5–7 October 2026).

**Live:** https://ismailsunni.github.io/qgis-uc-schedule-viewer/

## Features

- Day tabs, a sticky hour rail to jump to any time of day, full-text search across all days, and room / track / type filters
- Live clock in conference time (Europe/Zurich) with a **now** marker in the schedule, "Now" badges on running sessions, dimmed past sessions, and a *Jump to now* button
- Star sessions to build a personal **★ Mine** list, stored in the browser (localStorage) and shown across all days
- Session details with abstract, speakers, and a link to pretalx
- Reads the live pretalx feed, falling back to a deployed snapshot if the feed is unreachable
- Light/dark theme, no tracking, no backend

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
