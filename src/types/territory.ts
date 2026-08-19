import type { DogRank, MarkerImageType } from './dog'
import type { GeoJsonPolygon, GeoJsonMultiPolygon } from './walk'

export interface TerritoryBoundsParams {
  swLng: number
  swLat: number
  neLng: number
  neLat: number
}

export type TerritoryStatus = 'ACTIVE' | 'CONQUERED'

export type LngLatTuple = [number, number]

export type TerritoryPolygon = GeoJsonPolygon | GeoJsonMultiPolygon

export interface TerritoryDog {
  id: number
  name: string
  rank: DogRank
  territoryColor: string
  markerImageType?: MarkerImageType | null
  markerImageValue?: string | null
  markerImageUrl?: string | null
}

export interface TerritoryConqueredBy {
  dogId: number
  dogName: string
}

export interface TerritorySummary {
  id: number
  dog: TerritoryDog
  polygon: TerritoryPolygon
  areaSquareMeters: number
  isMine: boolean
  status: TerritoryStatus
  claimedAt: string
  conqueredAt: string | null
}

export interface TerritoryDetail {
  id: number
  dog: TerritoryDog
  polygon: TerritoryPolygon | null
  areaSquareMeters: number
  isMine: boolean
  status: TerritoryStatus
  claimedAt: string
  conqueredAt: string | null
  conqueredBy: TerritoryConqueredBy | null
  lastKnownPolygon: TerritoryPolygon | null
}

export interface TerritoryPageResponse {
  content: TerritorySummary[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  hasNext: boolean
}

export function isConqueredTerritory(territory: TerritoryDetail): boolean {
  return territory.status === 'CONQUERED'
}
