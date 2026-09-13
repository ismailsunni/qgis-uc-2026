import { useEffect, useMemo, useRef, useState } from 'react'
import {
  clockIn,
  confOffset,
  dateKeyIn,
  fetchSchedule,
  type Event,
  type Schedule,
} from './schedule'
import { EventCard } from './components/EventCard'
import { HourRail } from './components/HourRail'
import { EventDetail } from './components/EventDetail'
import { Filters } from './components/Filters'
import { useFavorites } from './useFavorites'
import { useNow } from './useNow'
import './App.css'

const MINE = 'mine'

const statusOf = (e: Event, now: number) =>
  now >= e.end ? 'past' : now >= e.start ? 'live' : 'upcoming'

const matches = (e: Event, q: string) => {
  if (!q) return true
  const hay = [e.title, e.subtitle, e.abstract, e.room, e.track ?? '', e.type]
    .concat(e.persons.map((p) => p.public_name || p.name))
    .join(' ')
    .toLowerCase()
  return q
    .toLowerCase()
    .split(/\s+/)
    .every((term) => hay.includes(term))
}

export default function App() {
  const [schedule, setSchedule] = useState<Schedule | null>(null)
  const [stale, setStale] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    fetchSchedule()
      .then(({ schedule, live }) => {
        setSchedule(schedule)
        setStale(!live)
      })
      .catch(() => setFailed(true))
  }, [])

  if (failed) return <p className="empty">Could not load the schedule. Please try again later.</p>
  if (!schedule) return <p className="empty">Loading schedule…</p>
  return <ScheduleView schedule={schedule} stale={stale} />
}

function ScheduleView({ schedule, stale }: { schedule: Schedule; stale: boolean }) {
  const offset = useMemo(() => confOffset(schedule), [schedule])
  const now = useNow()
  const todayKey = dateKeyIn(now, offset)

  // Open on today when the conference is running, otherwise on day one.
  const [tab, setTab] = useState<number | typeof MINE>(
    () => schedule.days.find((d) => d.date === todayKey)?.index ?? schedule.days[0]?.index ?? 1,
  )
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState({ room: '', track: '', type: '' })
  const [selected, setSelected] = useState<Event | null>(null)
  const [activeHour, setActiveHour] = useState<string | null>(null)
  const { favorites, toggle } = useFavorites()
  const nowRef = useRef<HTMLDivElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const slotRefs = useRef(new Map<string, HTMLElement>())

  // A search reaches across the whole conference, not just the open day.
  const crossDay = tab === MINE || query.trim() !== ''

  const visible = useMemo(() => {
    const all = schedule.days.flatMap((d) => d.events)
    const pool =
      tab === MINE
        ? all.filter((e) => favorites.has(e.code))
        : query.trim()
          ? all
          : (schedule.days.find((d) => d.index === tab)?.events ?? [])
    return pool
      .filter((e) => matches(e, query))
      .filter((e) => !filters.room || e.room === filters.room)
      .filter((e) => !filters.track || e.track === filters.track)
      .filter((e) => !filters.type || e.type === filters.type)
      .sort((a, b) => a.start - b.start || a.room.localeCompare(b.room))
  }, [schedule, tab, favorites, query, filters])

  // Group into time slots so parallel sessions line up under one heading.
  const slots = useMemo(() => {
    const out: { key: string; label: string; day: string; start: number; events: Event[] }[] = []
    for (const e of visible) {
      const key = `${e.date.slice(0, 10)}-${e.startLabel}`
      const last = out[out.length - 1]
      if (last?.key === key) last.events.push(e)
      else
        out.push({
          key,
          label: e.startLabel,
          day: schedule.days.find((d) => d.index === e.dayIndex)?.label ?? '',
          start: e.start,
          events: [e],
        })
    }
    return out
  }, [visible, schedule])

  // One chip per hour that actually has sessions; ambiguous across days, so day view only.
  const hours = useMemo(() => {
    const first = new Map<string, string>()
    for (const s of slots) {
      const hour = s.label.slice(0, 2)
      if (!first.has(hour)) first.set(hour, s.key)
    }
    return [...first]
  }, [slots])

  const scrollToSlot = (key: string) => {
    const el = slotRefs.current.get(key)
    if (!el) return
    const offset = (stickyRef.current?.offsetHeight ?? 0) + 8
    scrollTo({ top: el.getBoundingClientRect().top + scrollY - offset, behavior: 'smooth' })
  }

  // Highlight the hour whose slot heading sits under the sticky bar.
  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const line = (stickyRef.current?.getBoundingClientRect().bottom ?? 0) + 12
      let current = hours[0]?.[0] ?? null
      for (const [hour, key] of hours) {
        const el = slotRefs.current.get(key)
        if (el && el.getBoundingClientRect().top <= line) current = hour
      }
      setActiveHour(current)
    }
    const onScroll = () => {
      frame ||= requestAnimationFrame(update)
    }
    update()
    addEventListener('scroll', onScroll, { passive: true })
    return () => {
      removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [hours])

  const onConferenceDay = schedule.days.some((d) => d.date === todayKey)
  const showNowLine =
    onConferenceDay &&
    (crossDay || schedule.days.find((d) => d.index === tab)?.date === todayKey)
  const nowIndex = showNowLine ? slots.findIndex((s) => s.start > now) : -1

  const conferenceStart = schedule.days[0]?.events[0]?.start ?? 0
  const daysToGo = Math.ceil((conferenceStart - now) / 86_400_000)

  return (
    <div className="app">
      <header className="header">
        <div className="header__row">
          <h1>{schedule.title}</h1>
          <div className="clock">
            <strong>{clockIn(now, offset)}</strong>
            <span>{schedule.timezone.replace('_', ' ')}</span>
          </div>
        </div>
        <p className="header__sub">
          {daysToGo > 0 && `Starts in ${daysToGo} day${daysToGo === 1 ? '' : 's'} · `}
          {schedule.days.length} days · {schedule.rooms.length} rooms
          {stale && ' · offline copy'}
        </p>
      </header>

      <div className="sticky" ref={stickyRef}>
        <nav className="tabs">
        {schedule.days.map((d) => (
          <button
            key={d.index}
            className={`tab ${tab === d.index ? 'tab--on' : ''}`}
            onClick={() => setTab(d.index)}
          >
            {d.label}
            {d.date === todayKey && <span className="tab__dot" aria-label="today" />}
          </button>
        ))}
        <button
          className={`tab tab--mine ${tab === MINE ? 'tab--on' : ''}`}
          onClick={() => setTab(MINE)}
        >
          ★ Mine{favorites.size > 0 && <span className="tab__count">{favorites.size}</span>}
          </button>
        </nav>
        {!crossDay && hours.length > 1 && (
          <HourRail
            hours={hours.map(([hour]) => hour)}
            active={activeHour}
            nowHour={showNowLine ? clockIn(now, offset).slice(0, 2) : null}
            onPick={(hour) => scrollToSlot(hours.find(([h]) => h === hour)?.[1] ?? '')}
          />
        )}
      </div>

      <div className="toolbar">
        <input
          className="search"
          type="search"
          placeholder="Search talks, speakers, rooms…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Filters
          rooms={schedule.rooms}
          tracks={schedule.tracks}
          types={schedule.types}
          value={filters}
          onChange={setFilters}
          onReset={() => setFilters({ room: '', track: '', type: '' })}
        />
      </div>

      <main className="list">
        {slots.length === 0 && (
          <p className="empty">
            {tab === MINE
              ? 'Nothing starred yet — tap ☆ on a session to build your own schedule.'
              : 'No sessions match these filters.'}
          </p>
        )}

        {slots.map((slot, i) => (
          <section
            key={slot.key}
            className="slot"
            ref={(el) => {
              if (el) slotRefs.current.set(slot.key, el)
              else slotRefs.current.delete(slot.key)
            }}
          >
            {i === nowIndex && <NowLine ref={nowRef} label={clockIn(now, offset)} />}
            <h2 className="slot__label">
              {crossDay && <span className="slot__day">{slot.day}</span>}
              {slot.label}
            </h2>
            {slot.events.map((e) => (
              <EventCard
                key={e.code}
                event={e}
                starred={favorites.has(e.code)}
                status={statusOf(e, now)}
                onToggleStar={toggle}
                onOpen={setSelected}
              />
            ))}
          </section>
        ))}
        {showNowLine && nowIndex === -1 && slots.length > 0 && (
          <NowLine ref={nowRef} label={clockIn(now, offset)} />
        )}
      </main>

      {showNowLine && (
        <button
          className="jump"
          onClick={() => nowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
        >
          Jump to now
        </button>
      )}

      {selected && (
        <EventDetail
          event={selected}
          starred={favorites.has(selected.code)}
          onToggleStar={toggle}
          onClose={() => setSelected(null)}
        />
      )}

      <footer className="footer">
        Data from{' '}
        <a href="https://talks.osgeo.org/qgis-uc2026/schedule/" target="_blank" rel="noreferrer">
          talks.osgeo.org
        </a>
        {schedule.version && ` · schedule ${schedule.version}`}
      </footer>
    </div>
  )
}

function NowLine({ ref, label }: { ref: React.Ref<HTMLDivElement>; label: string }) {
  return (
    <div className="nowline" ref={ref}>
      <span>{label} now</span>
    </div>
  )
}
