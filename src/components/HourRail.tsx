import { useEffect, useRef } from 'react'

type Props = {
  hours: string[]
  active: string | null
  nowHour: string | null
  onPick: (hour: string) => void
}

export function HourRail({ hours, active, nowHour, onPick }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  // Centre the active chip. Scrolled by hand rather than via scrollIntoView,
  // which would also drag the page vertically mid-jump.
  useEffect(() => {
    const rail = ref.current
    const chip = rail?.querySelector<HTMLElement>('.hour--on')
    if (!rail || !chip) return
    rail.scrollTo({
      left: chip.offsetLeft - rail.clientWidth / 2 + chip.clientWidth / 2,
      behavior: 'smooth',
    })
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
