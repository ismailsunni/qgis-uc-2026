import { useEffect } from 'react'
import type { Event } from '../schedule'

type Props = {
  event: Event
  starred: boolean
  onToggleStar: (code: string) => void
  onClose: () => void
}

export function EventDetail({ event, starred, onToggleStar, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="sheet__backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <header className="sheet__head">
          <div className="sheet__meta">
            {event.startLabel}–{event.endLabel} · {event.room}
          </div>
          <button className="sheet__close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>

        <h2 className="sheet__title">{event.title}</h2>
        {event.subtitle && <p className="sheet__subtitle">{event.subtitle}</p>}

        <div className="card__tags">
          <span className="badge">{event.type}</span>
          {event.track && <span className="badge badge--track">{event.track}</span>}
        </div>

        {event.persons.length > 0 && (
          <ul className="speakers">
            {event.persons.map((p) => (
              <li key={p.code}>
                {p.avatar && <img src={p.avatar} alt="" loading="lazy" />}
                <span>{p.public_name || p.name}</span>
              </li>
            ))}
          </ul>
        )}

        {event.abstract && <p className="sheet__abstract">{event.abstract}</p>}
        {event.description && <p className="sheet__description">{event.description}</p>}

        <footer className="sheet__actions">
          <button
            className={`btn ${starred ? 'btn--starred' : ''}`}
            onClick={() => onToggleStar(event.code)}
          >
            {starred ? '★ Starred' : '☆ Star this'}
          </button>
          <a className="btn btn--link" href={event.url} target="_blank" rel="noreferrer">
            Open on pretalx ↗
          </a>
        </footer>
      </div>
    </div>
  )
}
