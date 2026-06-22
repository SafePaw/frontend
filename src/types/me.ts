import type { DogGender } from './dog'

export interface MeDogSummary {
  id: number
  name: string
  gender: DogGender
  rank: string
  totalXp: number
  markerImageUrl?: string
  territoryColor?: string
}

export interface MeResponse {
  id: number
  nickname: string
  email: string
  primaryAuthProvider: string
  role: string
  dogSetupRequired: boolean
  dogs: MeDogSummary[]
}

export interface UserUpdateRequest {
  nickname: string
}
