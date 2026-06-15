import { apiClient } from './client'
import type { ApiResponse } from '../types/common'
import type { User } from '../types/auth'

export async function getMe(): Promise<ApiResponse<User>> {
  const res = await apiClient.get<ApiResponse<User>>('/api/v1/me')
  return res.data
}

export async function patchMe(body: Record<string, unknown>): Promise<ApiResponse<User>> {
  const res = await apiClient.patch<ApiResponse<User>>('/api/v1/me', body)
  return res.data
}
