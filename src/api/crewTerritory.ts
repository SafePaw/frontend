import { apiClient } from './client'
import type { ApiResponse } from '../types/common'
import type { TerritoryBoundsParams } from '../types/territory'
import type {
  CrewTerritoryItem,
  CrewStats,
  CrewTerritoryUnion,
  CrewRankingBoard,
  MyCrewRanking,
} from '../types/crewTerritory'

export async function getCrewTerritories(
  crewId: number,
  bounds: TerritoryBoundsParams,
): Promise<CrewTerritoryItem[]> {
  const res = await apiClient.get<ApiResponse<CrewTerritoryItem[]>>(
    `/crews/${crewId}/territories`,
    { params: bounds },
  )
  if (!res.data.success || !Array.isArray(res.data.data)) {
    throw Object.assign(
      new Error(res.data.error?.message ?? '크루 영토 조회에 실패했습니다.'),
      { code: res.data.error?.code },
    )
  }
  return res.data.data
}

export async function getMyCrewTerritories(
  bounds: TerritoryBoundsParams,
): Promise<CrewTerritoryItem[]> {
  const res = await apiClient.get<ApiResponse<CrewTerritoryItem[]>>(
    '/crews/me/territories',
    { params: bounds },
  )
  if (!res.data.success || !Array.isArray(res.data.data)) {
    throw Object.assign(
      new Error(res.data.error?.message ?? '내 크루 영토 조회에 실패했습니다.'),
      { code: res.data.error?.code },
    )
  }
  return res.data.data
}

export async function getCrewStats(crewId: number, season?: string): Promise<CrewStats> {
  const res = await apiClient.get<ApiResponse<CrewStats>>(
    `/crews/${crewId}/stats`,
    { params: season ? { season } : undefined },
  )
  if (!res.data.success || !res.data.data) {
    throw Object.assign(
      new Error(res.data.error?.message ?? '크루 통계 조회에 실패했습니다.'),
      { code: res.data.error?.code },
    )
  }
  return res.data.data
}

export async function getCrewTerritoryUnion(
  crewId: number,
  season?: string,
): Promise<CrewTerritoryUnion> {
  const res = await apiClient.get<ApiResponse<CrewTerritoryUnion>>(
    `/crews/${crewId}/territory-union`,
    { params: season ? { season } : undefined },
  )
  if (!res.data.success || !res.data.data) {
    throw Object.assign(
      new Error(res.data.error?.message ?? '크루 영토 Union 조회에 실패했습니다.'),
      { code: res.data.error?.code },
    )
  }
  return res.data.data
}

export async function getCrewRanking(params?: {
  season?: string
  page?: number
  size?: number
}): Promise<CrewRankingBoard> {
  const res = await apiClient.get<ApiResponse<CrewRankingBoard>>(
    '/rankings/crew-territory',
    { params },
  )
  if (!res.data.success || !res.data.data) {
    throw Object.assign(
      new Error(res.data.error?.message ?? '크루 랭킹 조회에 실패했습니다.'),
      { code: res.data.error?.code },
    )
  }
  return res.data.data
}

export async function getMyCrewRanking(season?: string): Promise<MyCrewRanking> {
  const res = await apiClient.get<ApiResponse<MyCrewRanking>>(
    '/rankings/crew-territory/me',
    { params: season ? { season } : undefined },
  )
  if (!res.data.success || !res.data.data) {
    throw Object.assign(
      new Error(res.data.error?.message ?? '내 크루 랭킹 조회에 실패했습니다.'),
      { code: res.data.error?.code },
    )
  }
  return res.data.data
}
