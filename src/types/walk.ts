import type { MarkerImageType } from './dog'

export type WalkServerStatus = 'ONGOING' | 'PAUSED' | 'COMPLETED' | 'ABORTED'
export type WalkPendingAction = 'start' | 'pause' | 'resume' | 'finish' | 'abort'
export type MapFollowMode = 'following' | 'free'

export interface WalkPointDto {
  lng: number
  lat: number
  accuracyMeters: number
  speedKmh?: number
  recordedAt: string
}

export interface WalkFinishRequest {
  lastPoints: WalkPointDto[] | null
}

export interface WalkStartResponse {
  walkSessionId: number
  dogId: number
  status: 'ONGOING'
  startedAt: string
}

export interface WalkLiveStats {
  walkId: number
  status: WalkServerStatus
  distanceMeters: number
  durationSeconds: number
  currentSpeedKmh: number
  averageSpeedKmh: number
  pointCount: number
  estimatedTerritoryM2: number
  caloriesKcal: number
  pausedAt: string | null
  totalPausedSeconds: number
}

export interface WalkPauseResponse {
  walkId: number
  status: WalkServerStatus
  pausedAt: string
}

export interface WalkResumeResponse {
  walkId: number
  status: WalkServerStatus
  totalPausedSeconds: number
}

export interface WalkStats {
  distanceMeters: number
  durationSeconds: number
  averageSpeedKmh: number
  pointCount: number
  loopGapMeters: number | null
  caloriesKcal?: number | null
}

export interface GeoJsonPolygon {
  type: 'Polygon'
  coordinates: [number, number][][]
}

export interface GeoJsonMultiPolygon {
  type: 'MultiPolygon'
  coordinates: [number, number][][][]
}

export type GeoJsonGeometry = GeoJsonPolygon | GeoJsonMultiPolygon

export interface GeoJsonLineString {
  type: 'LineString'
  coordinates: [number, number][]
}

export interface WalkFinishTerritoryPart {
  id: number
  polygon: GeoJsonGeometry
  areaSquareMeters: number
}

export interface WalkFinishIntrusionPart {
  victimDogName: string
  overlapRatio: number
  victimTerritoryId: number
  stolenPolygon: GeoJsonGeometry
  victimRemainderPolygon: GeoJsonGeometry | null
  victimRemainderAreaSquareMeters: number
  victimStatusAfter: 'ACTIVE' | 'CONQUERED'
}

export interface WalkFinishXpPart {
  source: string
  amount: number
}

export interface WalkFinishResponse {
  walkSessionId: number
  status: 'COMPLETED'
  walkType: 'TERRITORY' | 'NORMAL'
  stats: WalkStats
  territory: WalkFinishTerritoryPart | null
  ineligibleReason: string | null
  ineligibleMessage: string | null
  intrusions: WalkFinishIntrusionPart[]
  xpGained: WalkFinishXpPart[]
  totalXpAfter: number
  rankAfter: string
  rankUp: boolean
}

export interface WalkDetailResponse {
  id: number
  dogId: number
  status: WalkServerStatus
  startedAt: string
  endedAt: string | null
  stats: WalkStats
  polyline: GeoJsonLineString | null
  territoryId: number | null
}

export interface PersistedActiveWalk {
  walkId: number
  dogId: number
  startedAt: string
  lastKnownStatus: 'ONGOING' | 'PAUSED'
}

export interface WalkRouteGeoJson {
  type: 'Feature'
  properties: Record<string, never>
  geometry: {
    type: 'LineString'
    coordinates: [number, number][]
  }
}

export type ActiveWalkStatus = 'ONGOING' | 'PAUSED'

export interface ActiveWalkItem {
  walkId: number
  dogId: number
  dogName: string
  status: ActiveWalkStatus
  startedAt: string
}

export interface ActiveWalksResponse {
  walks: ActiveWalkItem[]
}

export type WalkType = 'TERRITORY' | 'NORMAL'

export interface WalkHistoryTerritory {
  id: number
  areaSquareMeters: number
  status: 'ACTIVE' | 'CONQUERED'
}

export interface WalkHistoryItem {
  walkId: number
  dogId: number
  dogName: string
  status: WalkServerStatus
  walkType: WalkType
  startedAt: string
  endedAt: string | null
  stats: WalkStats
  territory: WalkHistoryTerritory | null
}

export interface WalkHistoryPage {
  content: WalkHistoryItem[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  hasNext: boolean
}

export interface WalkSummaryResponse {
  walkId: number
  status: WalkServerStatus
  startedAt: string
  endedAt: string | null
  stats: WalkStats
  polyline: GeoJsonLineString | null
  territory: (WalkFinishTerritoryPart & { claimedAt: string }) | null
  owner: {
    userId: number
    nickname: string
    dog: {
      id: number
      name: string
      markerImageUrl: string | null
      markerImageType: MarkerImageType | null
      markerImageValue: string | null
      territoryColor: string | null
    }
  }
}

export interface ShareCardUploadUrlResponse {
  uploadUrl: string
  imageKey: string
  expiresInSeconds: number
}

export interface ShareCardRequest {
  backgroundImageKey: string | null
  renderedImageKey: string | null
}

export interface ShareCardResponse {
  id: number
  walkId: number
  backgroundImageUrl: string | null
  renderedImageUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface WalkShareData {
  distanceMeters: number
  durationSeconds: number
  averageSpeedKmh: number
  territory: WalkFinishTerritoryPart | null
  route: [number, number][] | null
  dogName: string
  markerImageUrl: string | null
  territoryColor: string | null
  caloriesKcal: number | null
}
