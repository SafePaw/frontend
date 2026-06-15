import axios from 'axios'
import { tokenStorage } from '../utils/tokenStorage'

export const BASE_URL = import.meta.env.VITE_API_BASE_URL

let _accessToken: string | null = null
let _onAuthFailed: (() => void) | null = null
let _refreshInFlight: Promise<boolean> | null = null

export function setAccessToken(token: string | null): void {
  _accessToken = token
}

export function getAccessToken(): string | null {
  return _accessToken
}

export function setAuthFailedCallback(cb: () => void): void {
  _onAuthFailed = cb
}

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
})

apiClient.interceptors.request.use((config) => {
  if (_accessToken) {
    config.headers.Authorization = `Bearer ${_accessToken}`
  }
  return config
})

async function executeRefresh(): Promise<boolean> {
  const storedToken = tokenStorage.getRefreshToken()
  if (!storedToken) {
    _onAuthFailed?.()
    return false
  }

  try {
    const res = await axios.post(`${BASE_URL}/auth/refresh`, {
      refreshToken: storedToken,
    })
    const data = res.data?.data as { accessToken?: string; refreshToken?: string } | undefined

    if (data?.accessToken && data?.refreshToken) {
      setAccessToken(data.accessToken)
      tokenStorage.setRefreshToken(data.refreshToken)
      return true
    }

    setAccessToken(null)
    tokenStorage.clearRefreshToken()
    _onAuthFailed?.()
    return false
  } catch {
    setAccessToken(null)
    tokenStorage.clearRefreshToken()
    _onAuthFailed?.()
    return false
  } finally {
    _refreshInFlight = null
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true

      if (!_refreshInFlight) {
        _refreshInFlight = executeRefresh()
      }

      const refreshed = await _refreshInFlight

      if (refreshed) {
        original.headers.Authorization = `Bearer ${_accessToken}`
        return apiClient(original)
      }
    }

    return Promise.reject(error)
  },
)
