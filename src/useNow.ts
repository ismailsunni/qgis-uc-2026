import { useEffect, useState } from 'react'

// ?now=2026-10-06T10:15 pins the clock, so the live marker can be checked off-conference.
const override = () => {
  const raw = new URLSearchParams(location.search).get('now')
  const t = raw ? Date.parse(raw) : NaN
  return Number.isNaN(t) ? null : t
}

/** Current time, refreshed every `ms`. */
export function useNow(ms = 30_000) {
  const pinned = override()
  const [now, setNow] = useState(() => pinned ?? Date.now())

  useEffect(() => {
    if (pinned !== null) return
    const id = setInterval(() => setNow(Date.now()), ms)
    return () => clearInterval(id)
  }, [ms, pinned])

  return now
}
