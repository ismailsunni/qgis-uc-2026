// Snapshots the pretalx schedule into src/data/schedule.json (offline fallback).
import { writeFileSync } from 'node:fs'

const SRC = 'https://talks.osgeo.org/qgis-uc2026/schedule/export/schedule.json'

const res = await fetch(SRC)
if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
const raw = await res.json()

writeFileSync(
  new URL('../public/schedule.json', import.meta.url),
  JSON.stringify(raw) + '\n',
)
console.log(`saved ${raw.schedule.conference.days.length} days from ${SRC}`)
