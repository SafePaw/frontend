import type { DogRank } from './dog'

export type RankingCategoryKey = 'xp' | 'distance' | 'duration' | 'territory'
export type RankingCategory = 'XP' | 'DISTANCE' | 'DURATION' | 'TERRITORY'
export type RankingUnit = 'xp' | 'm' | 'seconds' | 'm2'

export interface RankingItem {
  rank: number
  dogId: number
  dogName: string
  markerImageUrl: string | null
  rankBadge: DogRank | null
  territoryColor: string | null
  value: number
  unit: RankingUnit
}

export interface RankingPageData {
  season: string
  category: RankingCategory
  page: number
  size: number
  totalElements: number
  content: RankingItem[]
}

export interface RankingListParams {
  page?: number
  size?: number
  season?: string
}

export interface MyCategoryRanking {
  rank: number | null
  value: number
  unit: RankingUnit
  percentile: number | null
}

export interface MyRankings {
  xp: MyCategoryRanking
  territory: MyCategoryRanking
  distance: MyCategoryRanking
  duration: MyCategoryRanking
}

export interface MyRankingData {
  season: string
  dogId: number
  dogName: string
  rankings: MyRankings
}
