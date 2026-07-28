import { apiClient } from './client'
import type { ApiResponse } from '../types/common'
import type { TerritorySummary, TerritoryDetail, TerritoryPageResponse } from '../types/territory'

export async function getTerritories(): Promise<TerritorySummary[]> {
  const res = await apiClient.get<ApiResponse<TerritorySummary[]>>('/territories')
  if (!res.data.success || !Array.isArray(res.data.data)) {
    throw new Error(res.data.error?.message ?? '영토 목록 응답 형식이 올바르지 않습니다.')
  }
  return res.data.data
}

export async function getMyTerritories(params?: {
  page?: number
  size?: number
}): Promise<TerritoryPageResponse> {
  const res = await apiClient.get<ApiResponse<TerritoryPageResponse>>('/me/territories', { params })
  if (!res.data.success || !res.data.data) {
    throw new Error(res.data.error?.message ?? '내 영토 목록 조회에 실패했습니다.')
  }
  return res.data.data
}

export async function getTerritoryDetail(territoryId: number): Promise<TerritoryDetail> {
  const res = await apiClient.get<ApiResponse<TerritoryDetail>>(`/territories/${territoryId}`)
  if (!res.data.success || !res.data.data) {
    throw new Error(res.data.error?.message ?? '영토 상세 조회에 실패했습니다.')
  }
  return res.data.data
}
