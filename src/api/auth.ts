import axios from 'axios'
import { apiClient, BASE_URL } from './client'
import type { ApiResponse } from '../types/common'
import type {
  SocialLoginRequest,
  SocialLoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
} from '../types/auth'

export async function socialLogin(
  body: SocialLoginRequest,
): Promise<ApiResponse<SocialLoginResponse>> {
  const res = await apiClient.post<ApiResponse<SocialLoginResponse>>('/auth/social', body)
  return res.data
}

// refresh 재발급
export async function refreshAuth(token: string): Promise<ApiResponse<RefreshTokenResponse>> {
  const body: RefreshTokenRequest = { refreshToken: token }
  const res = await axios.post<ApiResponse<RefreshTokenResponse>>(`${BASE_URL}/auth/refresh`, body)
  return res.data
}

// 로그아웃
export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout')
}
