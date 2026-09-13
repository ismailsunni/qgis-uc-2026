import { useEffect, useRef } from 'react'

type Props = {
  hours: string[]
  active: string | null
  nowHour: string | null
  onPick: (hour: string) => void
}

export function HourRail({ hours, active, nowHour, onPick }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  // Keep the active chip in view while scrolling the list.
  useEffect(() => {
    ref.current
      ?.querySelector('.hour--on')
      ?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' })
  }, [active])

  return (
    <div className="rail" ref={ref}>
      {hours.map((h) => (
        <button
          key={h}
          className={`hour ${h === active ? 'hour--on' : ''}`}
          onClick={() => onPick(h)}
          aria-current={h === active}
        >
          {h}
          {h === nowHour && <span className="hour__dot" aria-label="current hour" />}
        </button>
      ))}
    </div>
  )
}
