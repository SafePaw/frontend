export type CrewRole = 'LEADER' | 'MEMBER'

export interface CrewResponse {
  id: number
  name: string
  imageUrl: string | null
  territoryColor: string
  memberCount: number
  maxMembers: number
  leaderUserId: number
  inviteCode: string | null
  myRole: CrewRole | null
}

export interface CrewMember {
  userId: number
  nickname: string
  role: CrewRole
  joinedAt: string
  dogCount: number
  activeAreaSquareMeters: number
}

export interface CrewCreateRequest {
  name: string
  territoryColor: string
  imageKey?: string
}

export interface CrewUpdateRequest {
  name?: string
  territoryColor?: string
  imageKey?: string
}

export interface CrewJoinRequest {
  inviteCode: string
}

export interface CrewTransferRequest {
  targetUserId: number
}

export interface CrewImageUploadRequest {
  contentType: 'image/jpeg' | 'image/png' | 'image/webp'
}

export interface CrewImageUploadResponse {
  uploadUrl: string
  storageKey: string
  expiresIn: number
}

export type ConfirmAction =
  | { type: 'leave' }
  | { type: 'disband' }
  | { type: 'kick'; member: CrewMember }
  | { type: 'transfer'; member: CrewMember }
