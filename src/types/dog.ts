export type MarkerImageType = 'PRESET' | 'UPLOADED'
export type DogGender = 'MALE' | 'FEMALE'

export interface DogDraft {
  name: string
  gender: DogGender | null
  breed: string
  age: string
  weightKg: string
  markerImageType: MarkerImageType
  markerImageValue: string
}

export interface CreateDogRequest {
  name: string
  gender?: DogGender
  breed?: string
  age?: number
  weightKg?: number
  markerImageType: MarkerImageType
  markerImageValue: string
  territoryColor?: string
}

export interface UpdateDogRequest {
  name?: string
  gender?: DogGender
  breed?: string
  age?: number
  weightKg?: number
  territoryColor?: string
  markerImageType?: MarkerImageType
  markerImageValue?: string
}

export interface Dog {
  id: number
  name: string
  breed: string | null
  gender: DogGender
  age: number | null
  weightKg: number | null
  markerImageUrl: string | null
  territoryColor: string | null
  rank: string
  totalXp: number
}

export interface MarkerUploadUrlRequest {
  contentType: 'image/jpeg' | 'image/png' | 'image/webp'
}

export interface MarkerUploadUrlResponse {
  uploadUrl: string
  storageKey: string
  expiresIn: number
}
