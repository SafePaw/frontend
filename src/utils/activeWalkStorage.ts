import type { PersistedActiveWalk } from '../types/walk'

const PREFIX = 'safepaw_active_walk:'

function getKey(userId: number | string): string {
  return `${PREFIX}${userId}`
}

export const activeWalkStorage = {
  get(userId: number): PersistedActiveWalk | null {
    try {
      const raw = localStorage.getItem(getKey(userId))
      return raw ? (JSON.parse(raw) as PersistedActiveWalk) : null
    } catch {
      return null
    }
  },

  set(userId: number, walk: PersistedActiveWalk): void {
    try {
      localStorage.setItem(getKey(userId), JSON.stringify(walk))
    } catch {
      // localStorage 쓰기 실패 시 무시 (세션 복구 불가 허용)
    }
  },

  update(userId: number, patch: Partial<PersistedActiveWalk>): void {
    const current = activeWalkStorage.get(userId)
    if (!current) return
    activeWalkStorage.set(userId, { ...current, ...patch })
  },

  clear(userId: number): void {
    localStorage.removeItem(getKey(userId))
  },

  // 로그아웃·인증 사용자 변경 시 userId 없이 전체 삭제
  clearAll(): void {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith(PREFIX))
    keys.forEach((k) => localStorage.removeItem(k))
  },
}
