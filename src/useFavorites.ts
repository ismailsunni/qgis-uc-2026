import { useCallback, useEffect, useState } from 'react'

const KEY = 'qgis-uc2026:favorites'

const read = (): string[] => {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}

export function useFavorites() {
  const [codes, setCodes] = useState<Set<string>>(() => new Set(read()))

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify([...codes]))
  }, [codes])

  // Keep tabs in sync when the list is starred elsewhere.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setCodes(new Set(read()))
    }
    addEventListener('storage', onStorage)
    return () => removeEventListener('storage', onStorage)
  }, [])

  const toggle = useCallback((code: string) => {
    setCodes((prev) => {
      const next = new Set(prev)
      if (!next.delete(code)) next.add(code)
      return next
    })
  }, [])

  return { favorites: codes, toggle, clear: () => setCodes(new Set()) }
}
