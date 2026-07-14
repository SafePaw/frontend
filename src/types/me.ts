import type { DogGender, DogRank, MarkerImageType } from './dog'

export interface MeDogSummary {
  id: number
  name: string
  gender: DogGender
  rank: DogRank
  totalXp: number
  markerImageUrl?: string | null
  markerImageType?: MarkerImageType | null
  markerImageValue?: string | null
  territoryColor: string
}

export interface MeResponse {
  id: number
  nickname: string
  email: string | null
  primaryAuthProvider: string
  role: string
  dogSetupRequired: boolean
  dogs: MeDogSummary[]
}

export interface UserUpdateRequest {
  nickname: string
}
