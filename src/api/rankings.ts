import { apiClient } from './client'
import type { ApiResponse } from '../types/common'
import type { RankingCategoryKey, RankingListParams, RankingPageData, MyRankingData } from '../types/ranking'

export async function getRankingsByCategory(
  category: RankingCategoryKey,
  params?: RankingListParams,
): Promise<RankingPageData> {
  const res = await apiClient.get<ApiResponse<RankingPageData>>(`/rankings/${category}`, { params })
  if (!res.data.success || !res.data.data) {
    throw new Error(res.data.error?.message ?? '랭킹 조회에 실패했습니다.')
  }
  return res.data.data
}

export async function getMyRanking(dogId: number): Promise<MyRankingData> {
  const res = await apiClient.get<ApiResponse<MyRankingData>>('/rankings/me', {
    params: { dogId },
  })
  if (!res.data.success || !res.data.data) {
    throw new Error(res.data.error?.message ?? '내 랭킹 조회에 실패했습니다.')
  }
  return res.data.data
}
