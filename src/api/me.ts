import { apiClient } from './client'
import type { ApiResponse } from '../types/common'
import type { User } from '../types/auth'
import type { MeResponse, UserUpdateRequest } from '../types/me'

export async function getMe(): Promise<ApiResponse<User>> {
  const res = await apiClient.get<ApiResponse<User>>('/me')
  return res.data
}

export async function getMeFull(): Promise<MeResponse> {
  const res = await apiClient.get<ApiResponse<MeResponse>>('/me')
  if (!res.data.success || !res.data.data) {
    throw new Error('사용자 정보 조회에 실패했습니다.')
  }
  return res.data.data
}

export async function updateMe(body: UserUpdateRequest): Promise<MeResponse> {
  const res = await apiClient.patch<ApiResponse<MeResponse>>('/me', body)
  if (!res.data.success || !res.data.data) {
    throw new Error('사용자 정보 수정에 실패했습니다.')
  }
  return res.data.data
}

export async function patchMe(body: Record<string, unknown>): Promise<ApiResponse<User>> {
  const res = await apiClient.patch<ApiResponse<User>>('/me', body)
  return res.data
}
