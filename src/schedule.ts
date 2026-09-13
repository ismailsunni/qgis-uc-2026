const FEED = 'https://talks.osgeo.org/qgis-uc2026/schedule/export/schedule.json'
const SNAPSHOT = `${import.meta.env.BASE_URL}schedule.json`

export type Person = { code: string; public_name?: string; name: string; avatar: string | null }

export type Event = {
  code: string
  title: string
  subtitle: string
  abstract: string
  description: string | null
  room: string
  track: string | null
  type: string
  url: string
  persons: Person[]
  /** ISO string with the conference UTC offset, e.g. 2026-10-05T09:30:00+02:00 */
  date: string
  start: number // epoch ms
  end: number // epoch ms
  startLabel: string // HH:MM in conference time
  endLabel: string
  dayIndex: number
}

export type Day = { index: number; date: string; label: string; events: Event[] }

export type Schedule = {
  title: string
  version: string
  timezone: string
  days: Day[]
  rooms: string[]
  tracks: string[]
  types: string[]
}

const pad = (n: number) => String(n).padStart(2, '0')

/** Formats an epoch in the conference timezone offset carried by the source ISO string. */
const hhmm = (epoch: number, offsetMs: number) => {
  const d = new Date(epoch + offsetMs)
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`
}

const offsetOf = (iso: string) => {
  const m = /([+-])(\d{2}):(\d{2})$/.exec(iso)
  if (!m) return 0
  const sign = m[1] === '-' ? -1 : 1
  return sign * (Number(m[2]) * 60 + Number(m[3])) * 60_000
}

const dayLabel = (date: string) =>
  new Date(`${date}T12:00:00Z`).toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  })

type RawDay = { index: number; date: string; rooms: Record<string, unknown[]> }
type RawFeed = {
  schedule: {
    version: string
    conference: { title: string; time_zone_name?: string; days: RawDay[] }
  }
}

export function parseSchedule(input: unknown): Schedule {
  const raw = input as RawFeed
  const conf = raw.schedule.conference
  const days: Day[] = conf.days.map((day) => {
    const events: Event[] = Object.entries(day.rooms).flatMap(([room, list]) =>
      (list as Array<Record<string, unknown>>).map((e) => {
        const date = e.date as string
        const offset = offsetOf(date)
        const start = new Date(date).getTime()
        const [h, m] = (e.duration as string).split(':').map(Number)
        const end = start + (h * 60 + m) * 60_000
        return {
          code: e.code as string,
          title: e.title as string,
          subtitle: (e.subtitle as string) || '',
          abstract: (e.abstract as string) || '',
          description: (e.description as string) ?? null,
          room,
          track: (e.track as string) || null,
          type: (e.type as string) || 'Session',
          url: e.url as string,
          persons: (e.persons as Person[]) ?? [],
          date,
          start,
          end,
          startLabel: hhmm(start, offset),
          endLabel: hhmm(end, offset),
          dayIndex: day.index,
        }
      }),
    )
    events.sort((a, b) => a.start - b.start || a.room.localeCompare(b.room))
    return {
      index: day.index,
      date: day.date,
      label: dayLabel(day.date),
      events,
    }
  })

  const all = days.flatMap((d) => d.events)
  const uniq = (xs: string[]) => [...new Set(xs)].sort()
  return {
    title: conf.title,
    version: raw.schedule.version,
    timezone: conf.time_zone_name ?? 'Europe/Zurich',
    days,
    rooms: uniq(all.map((e) => e.room)),
    tracks: uniq(all.map((e) => e.track).filter((t): t is string => !!t)),
    types: uniq(all.map((e) => e.type)),
  }
}

const load = async (url: string, init?: RequestInit) => {
  const res = await fetch(url, init)
  if (!res.ok) throw new Error(`${url} responded ${res.status}`)
  return parseSchedule(await res.json())
}

/**
 * Live feed first so the viewer picks up schedule changes without a redeploy;
 * the deployed snapshot keeps it usable when pretalx is unreachable.
 */
export async function fetchSchedule(): Promise<{ schedule: Schedule; live: boolean }> {
  try {
    return { schedule: await load(FEED, { cache: 'no-cache' }), live: true }
  } catch {
    return { schedule: await load(SNAPSHOT), live: false }
  }
}

/** Conference-local offset in ms, taken from the data itself. */
export const confOffset = (s: Schedule) => offsetOf(s.days[0]?.events[0]?.date ?? '')

export const clockIn = (epoch: number, offsetMs: number) => hhmm(epoch, offsetMs)

export const dateKeyIn = (epoch: number, offsetMs: number) =>
  new Date(epoch + offsetMs).toISOString().slice(0, 10)
