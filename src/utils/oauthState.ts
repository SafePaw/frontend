import type { OAuthProvider } from '../types/auth'

export const createOAuthState = (provider: OAuthProvider): string => {
  const state = crypto.randomUUID()
  sessionStorage.setItem(`oauth_state_${provider}`, state)
  return state
}

export const validateOAuthState = (provider: OAuthProvider, returnedState: string | null): boolean => {
  const savedState = sessionStorage.getItem(`oauth_state_${provider}`)
  sessionStorage.removeItem(`oauth_state_${provider}`)
  return !!returnedState && savedState === returnedState
}
