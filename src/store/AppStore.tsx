import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { DEMO_ADMIN, initialRequests, properties as seedProperties } from '../data/mock'
import type { Property, RequestStatus, ViewingRequest } from '../types'

const KEYS = {
  favorites: 'kluch:favorites',
  properties: 'kluch:properties',
  requests: 'kluch:requests',
  auth: 'kluch:auth',
}

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function usePersistent<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => load(key, fallback))
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* приватный режим — просто не сохраняем */
    }
  }, [key, value])
  return [value, setValue] as const
}

interface Toast {
  id: number
  text: string
}

interface Store {
  properties: Property[]
  getProperty: (id: string) => Property | undefined
  saveProperty: (p: Property) => void
  deleteProperty: (id: string) => void

  favorites: string[]
  isFavorite: (id: string) => boolean
  toggleFavorite: (id: string) => void
  clearFavorites: () => void

  requests: ViewingRequest[]
  addRequest: (r: Omit<ViewingRequest, 'id' | 'status' | 'createdAt'>) => void
  setRequestStatus: (id: string, status: RequestStatus) => void

  isAdmin: boolean
  login: (email: string, password: string) => boolean
  logout: () => void

  notify: (text: string) => void

  resetDemo: () => void
}

const Ctx = createContext<Store | null>(null)
// тосты отдельно: их появление/исчезновение не должно перерисовывать всё приложение
const ToastCtx = createContext<Toast[]>([])

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [properties, setProperties] = usePersistent<Property[]>(KEYS.properties, seedProperties)
  const [favorites, setFavorites] = usePersistent<string[]>(KEYS.favorites, ['k-102', 'k-201'])
  const [requests, setRequests] = usePersistent<ViewingRequest[]>(KEYS.requests, initialRequests)
  const [isAdmin, setIsAdmin] = usePersistent<boolean>(KEYS.auth, false)
  const [toasts, setToasts] = useState<Toast[]>([])

  const notify = useCallback((text: string) => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, text }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200)
  }, [])

  const toggleFavorite = useCallback(
    (id: string) => {
      const has = favorites.includes(id)
      setFavorites(has ? favorites.filter((x) => x !== id) : [...favorites, id])
      notify(has ? 'Удалено из избранного' : 'Добавлено в избранное')
    },
    [favorites, setFavorites, notify],
  )

  const value = useMemo<Store>(
    () => ({
      properties,
      getProperty: (id) => properties.find((p) => p.id === id),
      saveProperty: (p) =>
        setProperties((list) => (list.some((x) => x.id === p.id) ? list.map((x) => (x.id === p.id ? p : x)) : [p, ...list])),
      deleteProperty: (id) => setProperties((list) => list.filter((x) => x.id !== id)),

      favorites,
      isFavorite: (id) => favorites.includes(id),
      toggleFavorite,
      clearFavorites: () => {
        setFavorites([])
        notify('Избранное очищено')
      },

      requests,
      addRequest: (r) =>
        setRequests((list) => [
          { ...r, id: `req-${Date.now()}`, status: 'new', createdAt: new Date().toISOString().slice(0, 10) },
          ...list,
        ]),
      setRequestStatus: (id, status) => setRequests((list) => list.map((x) => (x.id === id ? { ...x, status } : x))),

      isAdmin,
      login: (email, password) => {
        const ok = email.trim().toLowerCase() === DEMO_ADMIN.email && password === DEMO_ADMIN.password
        if (ok) setIsAdmin(true)
        return ok
      },
      logout: () => setIsAdmin(false),

      notify,

      resetDemo: () => {
        setProperties(seedProperties)
        setRequests(initialRequests)
        setFavorites([])
      },
    }),
    [properties, favorites, requests, isAdmin, notify, toggleFavorite, setProperties, setRequests, setFavorites, setIsAdmin],
  )

  return (
    <Ctx.Provider value={value}>
      <ToastCtx.Provider value={toasts}>{children}</ToastCtx.Provider>
    </Ctx.Provider>
  )
}

export function useStore() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useStore вне AppStoreProvider')
  return ctx
}

export const useToasts = () => useContext(ToastCtx)
