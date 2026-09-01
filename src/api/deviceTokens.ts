import { apiClient } from './client'
import type { ApiResponse } from '../types/common'

export async function registerDeviceToken(token: string): Promise<ApiResponse<null>> {
  const res = await apiClient.post<ApiResponse<null>>('/device-tokens', {
    platform: 'WEB',
    token,
  })
  return res.data
}

export async function deleteDeviceToken(token: string): Promise<ApiResponse<null>> {
  const res = await apiClient.delete<ApiResponse<null>>('/device-tokens', {
    data: { token },
  })
  return res.data
}
