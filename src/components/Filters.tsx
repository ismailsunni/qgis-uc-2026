type Props = {
  rooms: string[]
  tracks: string[]
  types: string[]
  value: { room: string; track: string; type: string }
  onChange: (next: Props['value']) => void
  onReset: () => void
}

export function Filters({ rooms, tracks, types, value, onChange, onReset }: Props) {
  const active = value.room || value.track || value.type
  return (
    <div className="filters">
      <select value={value.room} onChange={(e) => onChange({ ...value, room: e.target.value })}>
        <option value="">All rooms</option>
        {rooms.map((r) => (
          <option key={r}>{r}</option>
        ))}
      </select>
      <select value={value.track} onChange={(e) => onChange({ ...value, track: e.target.value })}>
        <option value="">All tracks</option>
        {tracks.map((t) => (
          <option key={t}>{t}</option>
        ))}
      </select>
      <select value={value.type} onChange={(e) => onChange({ ...value, type: e.target.value })}>
        <option value="">All types</option>
        {types.map((t) => (
          <option key={t}>{t}</option>
        ))}
      </select>
      {active && (
        <button className="filters__reset" onClick={onReset}>
          Clear
        </button>
      )}
    </div>
  )
}
