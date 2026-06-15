export type OAuthProvider = 'kakao' | 'naver' | 'google'
export type AuthProvider = 'KAKAO' | 'NAVER' | 'GOOGLE'

export interface User {
  id: number
  nickname: string
  email: string
  primaryAuthProvider: AuthProvider
  dogSetupRequired: boolean
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface SocialLoginRequest {
  provider: AuthProvider
  authorizationCode: string
  redirectUri: string
}

export interface SocialLoginResponse extends AuthTokens {
  user: User
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export type RefreshTokenResponse = AuthTokens
