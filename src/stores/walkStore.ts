import { create } from 'zustand'
import type { WalkServerStatus, WalkPendingAction, WalkLiveStats } from '../types/walk'

interface WalkError {
  code: string
  message: string
}

interface WalkStore {
  walkId: number | null
  dogId: number | null
  serverStatus: WalkServerStatus | null
  startedAt: string | null
  pendingAction: WalkPendingAction | null
  liveStats: WalkLiveStats | null
  error: WalkError | null
  initialPoint: [number, number] | null

  setWalkSession(walkId: number, dogId: number, startedAt: string, status: WalkServerStatus): void
  setServerStatus(status: WalkServerStatus): void
  setPendingAction(action: WalkPendingAction | null): void
  setLiveStats(stats: WalkLiveStats): void
  setError(error: WalkError | null): void
  setInitialPoint(point: [number, number] | null): void
  clearWalkSession(): void
}

export const useWalkStore = create<WalkStore>((set) => ({
  walkId: null,
  dogId: null,
  serverStatus: null,
  startedAt: null,
  pendingAction: null,
  liveStats: null,
  error: null,
  initialPoint: null,

  setWalkSession(walkId, dogId, startedAt, status) {
    set({ walkId, dogId, startedAt, serverStatus: status })
  },

  setServerStatus(status) {
    set({ serverStatus: status })
  },

  setPendingAction(action) {
    set({ pendingAction: action })
  },

  setLiveStats(stats) {
    set({ liveStats: stats })
  },

  setError(error) {
    set({ error })
  },

  setInitialPoint(point) {
    set({ initialPoint: point })
  },

  clearWalkSession() {
    set({
      walkId: null,
      dogId: null,
      serverStatus: null,
      startedAt: null,
      pendingAction: null,
      liveStats: null,
      error: null,
      initialPoint: null,
    })
  },
}))
