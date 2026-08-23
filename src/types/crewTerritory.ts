import type { TerritoryPolygon } from './territory'
import type { MarkerImageType } from './dog'

export interface CrewTerritoryDog {
  id: number
  name: string
  rank: string
  territoryColor: string
  markerImageUrl: string | null
  markerImageType: MarkerImageType | null
  markerImageValue: string | null
}

export interface CrewTerritoryCrewPart {
  id: number
  name: string
  territoryColor: string
  imageUrl: string | null
}

export interface CrewTerritoryItem {
  id: number
  polygon: TerritoryPolygon
  areaSquareMeters: number
  status: string
  claimedAt: string
  conqueredAt: string | null
  isMine: boolean
  fillColor: string
  dog: CrewTerritoryDog
  crew: CrewTerritoryCrewPart
}

export interface CrewStats {
  season: string
  crewId: number
  name: string
  territoryColor: string
  imageUrl: string | null
  memberCount: number
  maxMembers: number
  territoryCount: number
  areaSquareMeters: number
  unit: string
}

export interface CrewTerritoryUnion {
  season: string
  crewId: number
  territoryColor: string
  areaSquareMeters: number
  geometry: TerritoryPolygon | null
}

export interface CrewRankingEntry {
  rank: number
  crewId: number
  crewName: string
  imageUrl: string | null
  territoryColor: string | null
  memberCount: number
  value: number
  unit: string
}

export interface CrewRankingBoard {
  season: string
  category: string
  page: number
  size: number
  totalElements: number
  content: CrewRankingEntry[]
}

export interface MyCrewRanking {
  season: string
  crewId: number
  crewName: string
  territoryColor: string | null
  imageUrl: string | null
  rank: number | null
  value: number
  unit: string
  percentile: number | null
}
