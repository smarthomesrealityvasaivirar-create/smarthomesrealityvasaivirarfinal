'use client'
import { useSyncExternalStore } from 'react'

const KEY = 'shr_favourites'
const listeners = new Set<() => void>()

function read(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    return Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string').slice(0, 300) : []
  } catch {
    return []
  }
}
let cache: string[] | null = null
function snapshot() {
  if (cache === null) cache = read()
  return cache
}
const EMPTY: string[] = []

export function toggleFavourite(id: string) {
  const list = snapshot()
  const next = list.includes(id) ? list.filter(x => x !== id) : [...list, id]
  try { localStorage.setItem(KEY, JSON.stringify(next)) } catch { /* Private mode: keep saved homes in memory. */ }
  cache = next
  listeners.forEach(l => l())
}

export function useFavourites(): string[] {
  return useSyncExternalStore(
    cb => {
      listeners.add(cb)
      const onStorage = (e: StorageEvent) => {
        if (e.key === KEY) {
          cache = null
          cb()
        }
      }
      window.addEventListener('storage', onStorage)
      return () => {
        listeners.delete(cb)
        window.removeEventListener('storage', onStorage)
      }
    },
    snapshot,
    () => EMPTY
  )
}
