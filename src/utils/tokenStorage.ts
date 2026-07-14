const KEY = 'rtoken'

export const tokenStorage = {
  getRefreshToken(): string | null {
    return localStorage.getItem(KEY)
  },
  setRefreshToken(token: string): void {
    localStorage.setItem(KEY, token)
  },
  clearRefreshToken(): void {
    localStorage.removeItem(KEY)
  },
}
