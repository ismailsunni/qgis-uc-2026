import type { Event } from '../schedule'

type Props = {
  event: Event
  starred: boolean
  status: 'past' | 'live' | 'upcoming'
  onToggleStar: (code: string) => void
  onOpen: (event: Event) => void
}

export function EventCard({ event, starred, status, onToggleStar, onOpen }: Props) {
  const speakers = event.persons.map((p) => p.public_name || p.name).join(', ')
  return (
    <article className={`card card--${status}`}>
      <button className="card__main" onClick={() => onOpen(event)}>
        <div className="card__time">
          <span>{event.startLabel}</span>
          <span className="card__dash">–</span>
          <span>{event.endLabel}</span>
          {status === 'live' && <span className="badge badge--live">Now</span>}
        </div>
        <h3 className="card__title">{event.title}</h3>
        {speakers && <p className="card__speakers">{speakers}</p>}
        <div className="card__tags">
          <span className="badge badge--room">{event.room}</span>
          <span className="badge">{event.type}</span>
          {event.track && <span className="badge badge--track">{event.track}</span>}
        </div>
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
