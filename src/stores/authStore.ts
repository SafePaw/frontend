import { create } from 'zustand'
import { setAccessToken, setAuthFailedCallback } from '../api/client'
import { refreshAuth } from '../api/auth'
import { getMe } from '../api/me'
import { tokenStorage } from '../utils/tokenStorage'
import type { User, AuthTokens } from '../types/auth'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isInitializing: boolean

  setAuth: (tokens: AuthTokens, user: User) => void
  clearAuth: () => void
  initializeAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isInitializing: true,

  setAuth(tokens, user) {
    setAccessToken(tokens.accessToken)
    tokenStorage.setRefreshToken(tokens.refreshToken)
    set({ user, isAuthenticated: true })
  },

  clearAuth() {
    setAccessToken(null)
    tokenStorage.clearRefreshToken()
    set({ user: null, isAuthenticated: false })
  },

  async initializeAuth() {
    const storedRefreshToken = tokenStorage.getRefreshToken()
    if (!storedRefreshToken) {
      set({ isInitializing: false })
      return
    }

    try {
      const refreshRes = await refreshAuth(storedRefreshToken)

      if (!refreshRes.success || !refreshRes.data?.accessToken || !refreshRes.data?.refreshToken) {
        throw new Error('유효하지 않은 리프레시 토큰 응답입니다.')
      }

      setAccessToken(refreshRes.data.accessToken)
      tokenStorage.setRefreshToken(refreshRes.data.refreshToken)

      const meRes = await getMe()
      if (!meRes.success || !meRes.data) {
        throw new Error('사용자 정보 조회에 실패했습니다.')
      }

      set({ user: meRes.data, isAuthenticated: true, isInitializing: false })
    } catch {
      setAccessToken(null)
      tokenStorage.clearRefreshToken()
      set({ isInitializing: false })
    }
  },
}))

setAuthFailedCallback(() => {
  useAuthStore.getState().clearAuth()
})
