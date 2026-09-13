import type { Event } from '../schedule'

// The type badge already says "Short Workshop"; the room suffix repeating it
// only forces the line to wrap.
const shortRoom = (room: string) => room.replace(/-Short Workshops$/, '')

type Props = {
  event: Event
  starred: boolean
  status: 'past' | 'live' | 'upcoming'
  onToggleStar: (code: string) => void
  onOpen: (event: Event) => void
}

export function EventCard({ event, starred, status, onToggleStar, onOpen }: Props) {
  const speakers = event.persons.map((p) => p.public_name || p.name).join(', ')
  // Some tracks just restate the type ("Short Workshop (90min)") — no point showing both.
  const track = event.track?.startsWith(event.type) ? null : event.track
  const minutes = Math.round((event.end - event.start) / 60_000)
  // The start time is already the group heading; only the end is worth repeating,
  // and only for sessions that outlast the slot.
  const length =
    minutes >= 480 ? 'all day' : minutes > 60 ? `until ${event.endLabel}` : `${minutes} min`

  return (
    <article className={`card card--${status}`}>
      <button className="card__main" onClick={() => onOpen(event)}>
        <div className="card__meta">
          {status === 'live' && <span className="badge badge--live">Now</span>}
          <span className="card__length">{length}</span>
          <span className="badge badge--type">{event.type}</span>
          {track && <span className="badge badge--track">{track}</span>}
        </div>
        <h3 className="card__title">{event.title}</h3>
        <p className="card__by">
          {speakers && <span>{speakers} · </span>}
          <span className="card__room">{shortRoom(event.room)}</span>
        </p>
      </button>
      <button
        className={`star ${starred ? 'star--on' : ''}`}
        aria-pressed={starred}
        aria-label={starred ? `Unstar ${event.title}` : `Star ${event.title}`}
        onClick={() => onToggleStar(event.code)}
      >
        {starred ? '★' : '☆'}
      </button>
    </article>
  )
}
